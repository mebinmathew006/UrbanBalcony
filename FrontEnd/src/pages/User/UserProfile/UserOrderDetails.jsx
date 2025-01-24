import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import { useNavigate } from "react-router-dom";

const UserOrderDetails = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const user_id = useSelector((state) => state.userDetails.id);

 
  const fetchUserOrders = async () => {
    try {
      const response = await axiosInstance.get(`userOrders/${user_id}`);

      // Flatten the nested order items into a single array of products
      const flattenedProducts = response.data.reduce((acc, order) => {
        return [
          ...acc,
          ...order.order_items.map((item) => ({
            ...item,
            orderId: order.id,
            orderDate: order.created_at,
          })),
        ];
      }, []);

      // Sort products by date (most recent first)
      const sortedProducts = flattenedProducts.sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      );
      console.log(sortedProducts);

      setAllProducts(sortedProducts);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="grid gap-4">
        {allProducts.map((product, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md">
            <div className="p-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-36 h-36 flex-shrink-0">
                  <img
                    src={`http://localhost:8000/${product.variant.product.product_img1}`}
                    className="w-full h-full object-cover rounded"
                    alt={product.variant.product.title || "Product"}
                  />
                </div>

                <div className="flex-grow space-y-2">
                  <h3 className="font-semibold text-lg">
                    {product.variant.product.title || "N/A"}
                  </h3>
                  <div className="space-y-1 text-gray-600">
                    <p>Quantity:{product.quantity}</p>
                    <p>Weight: {product.variant.weight}</p>
                    <p>Total Amount: ₹{product.total_amount}</p>
                    <p>
                      Status:{" "}
                      <span
                        className={`font-medium ${
                          product.status === "Delivered"
                            ? "text-green-600"
                            : product.status === "Cancelled"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {product.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <button
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                    onClick={() =>
                      navigate("/userProfile", {
                        state: {
                          orderId: product.id,
                          tab: "orderDetails",
                        },
                      })
                    }
                  >
                    More Details
                  </button>
                </div>

                {/* <div className="flex-shrink-0">
                  {product.status !== "Delivered" && product.status !== "Cancelled" && (
                    <button
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                      onClick={() => handleCancel(product.id)}
                    >
                      Cancel Order
                    </button>
                  )}
                </div> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrderDetails;
