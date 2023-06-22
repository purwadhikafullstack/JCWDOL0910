import React from "react";
import WarehouseTableBody from "./WarehouseTableBody";

const WarehouseTable = ({
  warehouses,
  navigate,
  openDeleteModal,
  openEditModal,
}) => {
  return (
    <table className="table table-zebra  text-black bg-primary h-3/4 lg:h-full lg:max-h-fit w-full lg:w-screen lg:max-w-screen-xl">
      {/* head */}
      <thead className="sticky top-0 z-10">
        <tr className="bg-base-300 text-base-content lg:text-lg">
          <th></th>
          <th>Name</th>
          <th>Address</th>
          <th>District</th>
          <th>City</th>
          <th>Province</th>
          <th>Postal Code</th>
          <th>Actions</th>
        </tr>
      </thead>
      {/* body */}
      <WarehouseTableBody
        warehouses={warehouses}
        navigate={navigate}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
      />
      <tfoot className="sticky bottom-0 z-10 lg:text-lg">
        <tr className="bg-base-300 text-base-content">
          <th></th>
          <th>Name</th>
          <th>Address</th>
          <th>District</th>
          <th>City</th>
          <th>Province</th>
          <th>Postal Code</th>
          <th>Actions</th>
        </tr>
      </tfoot>
    </table>
  );
};

export default WarehouseTable;
