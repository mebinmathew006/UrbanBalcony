import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../Components/Admin/Sidebar/Sidebar";
import adminaxiosInstance from "../../../adminaxiosconfig";
import axiosInstance from "../../../axiosconfig";
import Pagination from "../../../Components/Pagination/Pagination";

function OrderManagement() {
  const navigate = useNavigate();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Items per page
  const fetchUserOrders = async (page=1) => {
    try {
      const response = await adminaxiosInstance.get(`/admingetuserOrders?page=${page}`);
      // setUserOrders(response.data);
      console.log(response.data);

      setUserOrders(response.data.results);
      setTotalCount(response.data.count);
      setTotalPages(Math.ceil(response.data.count / pageSize));
      setCurrentPage(page);
    } catch (error) {
      console.log(error);
    }
  };
  
  const handlePageChange = (page) => {
    fetchUserOrders(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const [userOrders, setUserOrders] = useState([]);
  const user_id = useSelector((state) => state.userDetails.id);

  const orderChangeStatus = async (status, id) => {
    if (!status) {
      return;
    }
    try {
      const response = await axiosInstance.patch(`userOrders/${id}`, {
        action: status,
      });
      fetchUserOrders();
    } catch (error) {}
  };

  

  useEffect(() => {
    fetchUserOrders();
  }, []);

  return (
    <div className="flex h-full bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-200 h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-grow bg-gray-50">
        <main className="p-6">
          <div className="container mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Order Details</h3>
              <button
                className="bg-blue-600 text-white rounded-lg"
                onClick={() => navigate("/returned")}
              >
                Return Requests
              </button>
            </div>

            {/* Orders */}
            {userOrders && userOrders.map((order, index) => (
              <div
                key={index}
                className="mb-8 bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-semibold">
                        Order #{order.id}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Order Date: {order.order_date} | Delivery Date:{" "}
                        {order.delivery_date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        Total Amount: ₹{order.net_amount}
                      </p>
                      <p className="text-sm text-gray-600">
                        Payment Method:{" "}
                        {order.payment_details.pay_method.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.address_details ? (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Shipping to: {order.address_details.address_type}</p>
                      <p>
                        {order.address_details.land_mark},{" "}
                        {order.address_details.city}
                      </p>
                      <p>
                        {order.address_details.state} -{" "}
                        {order.address_details.pin_code}
                      </p>
                    </div>
                  ) : (
                    <p>Address Deleted by User</p>
                  )}
                </div>

                {/* Order Items Table */}
                <div className="p-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-2 text-sm font-medium text-gray-700">
                          Product
                        </th>
                        <th className="pb-2 text-sm font-medium text-gray-700">
                          Quantity
                        </th>
                        <th className="pb-2 text-sm font-medium text-gray-700">
                          Weight
                        </th>
                        <th className="pb-2 text-sm font-medium text-gray-700">
                          Amount
                        </th>
                        <th className="pb-2 text-sm font-medium text-gray-700">
                          Status
                        </th>
                        <th className="pb-2 text-sm font-medium text-gray-700">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.order_items.map((item, itemIndex) => (
                        <tr
                          key={itemIndex}
                          className="border-b hover:bg-gray-100 transition"
                        >
                          <td className="py-3 text-sm text-gray-800">
                            {item.variant.product.title}
                          </td>
                          <td className="py-3 text-sm text-gray-800">
                            {item.quantity}
                          </td>
                          <td className="py-3 text-sm text-gray-800">
                            {item.variant.weight}
                          </td>
                          <td className="py-3 text-sm text-gray-800">
                            ₹{item.total_amount}
                          </td>
                          <td className="py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded-md text-xs ${
                                item.status === "Delivered"
                                  ? "bg-green-100 text-green-700"
                                  : item.status === "Cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <select
                              className="bg-white block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                              onChange={(event) =>
                                orderChangeStatus(event.target.value, item.id)
                              }
                            >
                              <option value="">Change Status</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                              <option value="Dispatched">Dispatched</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </main>
        <div className="px-4 pb-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            maxPageButtons={5}
            size="md"
          />
        </div>
      </div>
    </div>
  );
}

export default OrderManagement;
