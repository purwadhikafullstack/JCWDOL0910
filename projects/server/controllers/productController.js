require("dotenv").config({
  path: ".env.local",
});
const { db, query } = require("../database");
module.exports = {
  getLatestProducts: async (req, res) => {
    try {
      const latest_products = await query(
        `SELECT * FROM products order by id_product desc limit 5`
      );
      // console.log(latest_products);
      return res.status(200).send(latest_products);
    } catch (error) {
      return res.status(error.statusCode || 500).send(error);
    }
  },
  getAllProducts: async (req, res) => {
    try {
      const { offset, limit, sort, filter } = req.query;

      let countProduct = `SELECT COUNT(*) AS total FROM products WHERE 1=1`;
      let productsQuery = ` SELECT * FROM products WHERE 1=1`;

      if (filter) {
        productsQuery += ` AND name LIKE '%${filter}%'`;
        countProduct += ` AND name LIKE '%${filter}%'`;
      }

      if (sort === "asc") {
        productsQuery += ` ORDER BY price ASC`;
      } else if (sort === "desc") {
        productsQuery += ` ORDER BY price DESC`;
      }

      productsQuery += ` LIMIT ${limit} OFFSET ${offset}`;

      console.log(productsQuery, "ini product");
      const products = await query(productsQuery);
      const totalItems = await query(countProduct);

      return res.status(200).send({
        data: products,
        totalPages: Math.ceil(totalItems[0].total / limit),
        totalItems: totalItems[0].total,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).send(error);
    }
  },

  getProductByCategory: async (req, res) => {
    try {
      const { offset, limit, sort, filter, category } = req.query;

      let countProduct = `SELECT COUNT(*) as total FROM products p
      JOIN categories c on p.id_category = c.id_category
      WHERE c.name = "${category}"`;

      // console.log(countProduct);

      let productsQuery = `SELECT p.id_product,p.id_category,c.name as category,p.name as name,p.price,p.description,p.stock,p.image_url FROM products p
      JOIN categories c on p.id_category = c.id_category
      WHERE c.name = "${category}"`;
      // console.log(productsQuery);

      if (filter) {
        productsQuery += ` AND p.name LIKE '%${filter}%'`;
        countProduct += ` AND p.name LIKE '%${filter}%'`;
      }

      if (sort === "asc") {
        productsQuery += ` ORDER BY p.price ASC`;
      } else if (sort === "desc") {
        productsQuery += ` ORDER BY p.price DESC`;
      }
      // console.log(countProduct, "ini category");
      productsQuery += ` LIMIT ${limit} OFFSET ${offset}`;
      const products = await query(productsQuery);
      const totalItems = await query(countProduct);

      return res.status(200).send({
        data: products,
        totalPages: Math.ceil(totalItems[0].total / limit),
      });
    } catch (error) {
      return res.status(error.statusCode || 500).send(error);
    }
  },
};
