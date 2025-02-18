import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar";
import adminaxiosInstance from "../../../adminaxiosconfig";

function ReturnedProducts() {
  const navigate = useNavigate();
  const [returnRequests, setReturnRequests] = useState([]);

  const handleReturnAction = async (
    action,
    itemId,
    userId,
    amount,
    orderId
  ) => {
    try {
      const response = await adminaxiosInstance.patch(
        `admingetuserOrders/${itemId}`,
        { action, userId, amount, orderId }
      );
      fetchReturnRequests();
    } catch (error) {
      console.error("Error handling return request:", error);
    }
  };

  const fetchReturnRequests = async () => {
    try {
      const response = await adminaxiosInstance.get(`/admingetuserOrders`, {
        params: { action: "return" },
      });
      setReturnRequests(response.data);
      console.log(returnRequests);
    } catch (error) {
      console.error("Error fetching return requests:", error);
    }
  };

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
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
              <h3 className="text-2xl font-semibold">Return Requests</h3>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                onClick={() => navigate("/admin/orders")}
              >
                Back to Orders
              </button>
            </div>

            {/* Return Requests */}
            {returnRequests.map((order, index) => (
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
                        Order Date: {order.order_date}
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

                  {/* Customer Details */}
                  <div className="mt-2 text-sm text-gray-600">
                    <p>
                      Customer Address: {order.address_details.address_type}
                    </p>
                    <p>
                      {order.address_details.land_mark},{" "}
                      {order.address_details.city}
                    </p>
                    <p>
                      {order.address_details.state} -{" "}
                      {order.address_details.pin_code}
                    </p>
                  </div>
                </div>

                {/* Return Request Items */}
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
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.order_items
                        .filter(
                          (item) => item.status === "Requested for Return"
                        )
                        .map((item, itemIndex) => (
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
                            <td className="py-3 text-sm text-gray-800">₹{}</td>
                            <td className="py-3 text-sm">
                              <span className="px-2 py-1 rounded-md text-xs bg-yellow-100 text-yellow-700">
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleReturnAction(
                                      "Returned",
                                      item.id,
                                      order.user,
                                      order.net_amount,
                                      order.id
                                    )
                                  }
                                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleReturnAction( 
                                      "Delivered",//reject
                                      item.id,
                                      order.user,
                                      order.net_amount,
                                      order.id
                                    )
                                  }
                                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* No Returns Message */}
            {returnRequests.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No return requests found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ReturnedProducts;
