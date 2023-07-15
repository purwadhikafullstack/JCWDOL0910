require("dotenv").config({
  path: ".env.local",
});
const { db, query } = require("../database");
const { getPaginationParams } = require("../helper/getPaginationHelper");
const { getIdFromToken, getRoleFromToken } = require("../helper/jwt-payload");
const adminOrderQueries = require("../queries/adminOrderQueries");

module.exports = {
  confirmPayment: async (req, res) => {
    try {
      const { id_order } = req.query;

      const fetchOrder = await query(`
    SELECT oi.id_user,oi.id_order, p.id_product,oi.quantity, s.id_warehouse,s.id_stock,s.total_stock FROM orders o INNER JOIN order_items oi ON o.id_order = oi.id_order INNER JOIN products p ON oi.product_name = p.name INNER JOIN stocks s ON p.id_product = s.id_product WHERE o.id_order = ${db.escape(
      id_order
    )}  AND s.id_warehouse = o.id_warehouse;
    `);

      for (const item of fetchOrder) {
        const { id_product, quantity } = item;

        const checkStock = await query(`
                SELECT SUM(total_stock) AS total_stock
                FROM stocks
                WHERE id_product = ${id_product}
              `);

        if (checkStock[0].total_stock < quantity) {
          return res.status(400).send({
            message: `Insufficient stock available for product with ID ${id_product} across all warehouses`,
          });
        }
      }

      for (const item of fetchOrder) {
        const {
          id_order,
          id_product,
          quantity,
          id_warehouse,
          total_stock,
          id_stock,
        } = item;

        if (total_stock < quantity) {
          const stockShortage = quantity - total_stock;

          const warehouseNearnest = await query(`  SELECT *,
                  SQRT(POW((latitude - (SELECT latitude FROM warehouses WHERE id_warehouse = 30)), 2) + POW((longitude - (SELECT longitude FROM warehouses WHERE id_warehouse = 30)), 2)) AS distance
                  FROM warehouses
                  WHERE id_warehouse <> ${id_warehouse}
                  ORDER BY distance;`);

          for (const nearestWarehouse of warehouseNearnest) {
            const checkStock = await query(`
                    SELECT id_stock,total_stock
                    FROM stocks
                    WHERE id_warehouse = ${nearestWarehouse.id_warehouse}
                    AND id_product = ${id_product}
                  `);

            if (checkStock[0].total_stock >= stockShortage) {
              const createMutation =
                await query(`INSERT INTO stock_mutations (id_product, id_request_warehouse, id_send_warehouse, quantity, created_at)
                VALUES (${id_product}, ${id_warehouse}, ${nearestWarehouse.id_warehouse}, ${stockShortage}, CURRENT_TIMESTAMP);`);

              const updateStockSendWarehouse = await query(
                `UPDATE stocks SET total_stock = total_stock - ${stockShortage} WHERE id_product = ${id_product} AND id_warehouse = ${nearestWarehouse.id_warehouse};`
              );

              const updateStockRequestWarehouse = await query(
                `UPDATE stocks SET total_stock = total_stock + ${stockShortage} WHERE id_product = ${id_product} AND id_warehouse = ${id_warehouse};`
              );

              const createHistorySendWarehouse = await query(`
                INSERT INTO stock_history (id_stock, stock_change, status, created_at)
                VALUES (${checkStock[0].id_stock}, ${Math.abs(
                stockShortage
              )}, "outgoing", CURRENT_TIMESTAMP);
               `);

              const createHistoryRequestWarehouse = await query(`
                INSERT INTO stock_history (id_stock, stock_change, status, created_at)
                VALUES (${id_stock}, ${Math.abs(
                stockShortage
              )}, "incoming", CURRENT_TIMESTAMP);
               `);
            }
          }
        }

        const updateStock = await query(
          `UPDATE stocks SET total_stock = total_stock - ${quantity} WHERE id_product = ${id_product} AND id_warehouse = ${id_warehouse};`
        );

        const createHistory = await query(`
            INSERT INTO stock_history (id_stock, stock_change, status, created_at)
            VALUES (${id_stock}, ${quantity}, "outgoing", CURRENT_TIMESTAMP);
            `);
      }

      const updateStatus = await query(`
        UPDATE orders
        SET status = "Diproses"
        WHERE id_order = ${db.escape(id_order)}
      `);

      return res
        .status(200)
        .send({ success: true, message: "Payment Success" });
    } catch (error) {
      return res.status(error.statusCode || 500).send(error);
    }
  },
  rejectPayment: async (req, res) => {
    try {
      const { id_order } = req.query;

      const updateStatus = await query(`UPDATE orders
      SET status = 'Menunggu Pembayaran'
      WHERE id_order= ${id_order}`);

      const deletePaymentDetails = await query(`
      DELETE FROM payment_details
      WHERE id_order = ${id_order}
    `);
      return res
        .status(200)
        .send({ success: true, message: "Payment Rejected" });
    } catch (error) {
      return res.status(error.statusCode || 500).send(error);
    }
  },

  fetchOrderList: async (req, res) => {
    try {
      const itemsPerPage = 10;
      const { page, offset } = getPaginationParams(req, itemsPerPage);
      const { sort, search, status } = req.query;
      const role = getRoleFromToken(req, res); // Get the role from the token

      let warehouseId = null;
      if (role === "warehouse admin") {
        const adminId = getIdFromToken(req, res); // Get the admin ID from the token
        warehouseId = await adminOrderQueries.getWarehouseId(adminId);
      }

      const orderPaymentList = await query(
        adminOrderQueries.orderPaymentListQuery(
          itemsPerPage,
          offset,
          sort,
          search,
          status,
          role,
          warehouseId
        )
      );

      const countQuery = adminOrderQueries.getCountQueryWithSearchAndStatus(
        search,
        status,
        role,
        warehouseId
      );

      const countResult = await query(countQuery);
      const totalItems = countResult[0].total;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      return res
        .status(200)
        .send({ orderPaymentList, totalPages, itemsPerPage });
    } catch (error) {
      return res.status(error.statusCode || 500).send(error);
    }
  },
};
