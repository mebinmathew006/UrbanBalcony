import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../Components/Admin/Sidebar/Sidebar";
import adminaxiosInstance from "../../../adminaxiosconfig";
import axiosInstance from "../../../axiosconfig";
import Pagination from "../../../Components/Pagination/Pagination";
import { toast } from "react-toastify";

function OrderManagement() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [userOrders, setUserOrders] = useState([]);

  const fetchUserOrders = async (page = 1) => {
    try {
      const response = await adminaxiosInstance.get(`/admingetuserOrders?page=${page}`);
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

  const orderChangeStatus = async (status, id) => {
    if (!status) {
      return;
    }
    try {
      const response = await adminaxiosInstance.patch(`admingetuserOrders/${id}`, {
        action: status,
      });
      toast.success('Status Changed Successfully', { position: 'bottom-center' });
      fetchUserOrders(currentPage);
    } catch (error) {
      toast.error(error.response.data.updated_status, { position: 'bottom-center' });
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-200 min-h-screen shadow-lg">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-grow">
        <main className="p-8">
          <div className="container mx-auto max-w-7xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">Order Management</h3>
                <p className="text-sm text-gray-500">Manage and track all customer orders</p>
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                onClick={() => navigate("/returned")}
              >
                Return Requests
              </button>
            </div>

            {/* Orders */}
            {userOrders && userOrders.map((order, index) => (
              <div
                key={index}
                className="mb-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-800">
                          Order #{order.id}
                        </h4>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Order Date: {order.order_date}
                      </p>
                    </div>
                    <div className="text-right bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="space-y-1.5">
                        <div className="flex justify-between gap-8 text-sm">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-semibold text-gray-800">
                            ₹{(order.net_amount - (order.net_amount / 100 * order.discout_percentage)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-8 text-sm">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="font-semibold text-gray-800">₹100.00</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between gap-8">
                            <span className="font-semibold text-gray-700">Total Amount:</span>
                            <span className="font-bold text-lg text-blue-600">
                              ₹{((order.net_amount - (order.net_amount / 100 * order.discout_percentage)) + 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="pt-2 text-xs">
                          <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md font-medium">
                            {order.payment_details.pay_method.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.address_details ? (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="text-sm">
                          <p className="font-semibold text-gray-800 mb-1">
                            Shipping to: {order.address_details.address_type}
                          </p>
                          <p className="text-gray-700">
                            {order.address_details.land_mark}, {order.address_details.city}
                          </p>
                          <p className="text-gray-700">
                            {order.address_details.state} - {order.address_details.pin_code}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-sm text-red-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Address Deleted by User
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Items Table */}
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-left border-b-2 border-gray-200">
                          <th className="pb-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="pb-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="pb-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Weight
                          </th>
                          <th className="pb-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="pb-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="pb-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.order_items && order.order_items.map((item, itemIndex) => (
                          <tr
                            key={itemIndex}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="py-4 text-sm font-medium text-gray-800">
                              {item.variant.product.title}
                            </td>
                            <td className="py-4 text-sm text-gray-700">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full font-semibold">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="py-4 text-sm text-gray-700 font-medium">
                              {item.variant.weight}
                            </td>
                            <td className="py-4 text-sm font-semibold text-gray-800">
                              ₹{(item.total_amount - (item.total_amount / 100 * order.discout_percentage)).toFixed(2)}
                            </td>
                            <td className="py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                                  item.status === "Delivered"
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : item.status === "Cancelled"
                                    ? "bg-red-100 text-red-700 border border-red-200"
                                    : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-4">
                              <select
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 cursor-pointer"
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
              </div>
            ))}
          </div>
        </main>
        <div className="px-8 pb-8">
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