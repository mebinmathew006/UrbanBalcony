import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "../../../Components/Pagination/Pagination";

function UserCart() {
  const navigate = useNavigate();
  // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(10); // Items per page
  const baseurl = import.meta.env.VITE_BASE_URL_FOR_IMAGE;

  const user_id = useSelector((state) => state.userDetails.id);

  const handleIncreaseQuantity = async (itemId) => {
    try {
      // API call to increase quantity
      await axiosInstance.patch(`userCart/${itemId}`, { action: "increase" });
      fetchUserCart(); // Refresh the cart
      
    } catch (error) {
      console.error("Error increasing quantity:", error);
    }
  };

  const handleDecreaseQuantity = async (itemId) => {
    try {
      // API call to decrease quantity
      await axiosInstance.patch(`userCart/${itemId}`, { action: "decrease" });
      fetchUserCart(); // Refresh the cart
    } catch (error) {
      console.error("Error decreasing quantity:", error);
    }
  };

  const handleCheckout = () => {
    navigate("/checkoutPage", {
      state: { totalAmount, type: "cart" },
    });
  };
  useEffect(() => {
    fetchUserCart();
  }, []);

  const [userCart, setUserCart] = useState();

  const handleDelete = async (id) => {
    try {
      const response = await axiosInstance.delete(`userCart/${id}`);
      fetchUserCart();
      toast.success('Deleted Sucessfully',{position:'bottom-center'})
    } catch (error) {}
  };

  const fetchUserCart = async (page=1) => {
    try {
      const response = await axiosInstance.get(`userCart/${user_id}`);
      // setUserCart(response.data);
      setUserCart(response.data.results);
    setTotalCount(response.data.count);
    setTotalPages(Math.ceil(response.data.count / pageSize));
    setCurrentPage(page);
      console.log(response.data);
      // Calculate the total cart amount
    } catch (error) {}
  };

  const handlePageChange = (page) => {
    fetchUserAddress(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalAmount = userCart
    ? userCart.reduce((acc, cart) => {
        const cartTotal = cart.cart_items.reduce(
          (itemAcc, item) => itemAcc + item.quantity * item.price_after_offer,
          0
        );
        return acc + cartTotal;
      }, 0)
    : 0;

  return (
    <div className="min-h-screen  py-8  }}">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Cart Details</h1>

        {userCart ? (
          userCart.map((cart, index) => (
            <div
              className="card mb-4 p-4  rounded-lg shadow "
              key={index}
              
            >
              {cart.cart_items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex items-center justify-between gap-8 mb-6 "
                >
                  {/* Product Image */}
                  <img
                    src={`${baseurl}${item.product_variant.product.product_img1}`}
                    alt="Product"
                    className="w-24 h-24 rounded-md object-cover"
                  />

                  {/* Product Details */}
                  <div>
                    <h3 className="font-semibold text-lg">
                      {item.product_variant.product.title || "N/A"}
                    </h3>

                    {/* Quantity Counter */}
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() => handleDecreaseQuantity(item.id)}
                        className="bg-green-200 px-3 py-1 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <p className="font-medium">{item.quantity}</p>
                      <button
                        onClick={() => handleIncreaseQuantity(item.id)}
                        className=" bg-green-200 px-3 py-1 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-gray-600 mt-2">
                      Total Amount: ₹{item.quantity * item.price_after_offer}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-green-900 text-white px-4 py-2 rounded hover:bg-green-800"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-gray-500">Your cart is empty.</p>
        )}

        {/* Total Amount & Checkout Button */}
        {userCart && (
          <div className="mt-6 p-4  rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Cart Summary</h2>
            <p className="text-gray-600 text-lg font-medium">
              Total Amount: ₹{totalAmount}
            </p>
            {totalAmount !== 0 && (
              <button
                onClick={handleCheckout}
                className="mt-4 bg-[#467927] text-white px-6 py-3 rounded-lg font-medium
              hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Proceed to Checkout
              </button>
            )}
          </div>
        )}
      </div>
      {/* Pagination Component */}
      <div className="px-4 pb-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          maxPageButtons={10 / 2}
          size="md"
        />
      </div>
    </div>
  );
}

export default UserCart;
