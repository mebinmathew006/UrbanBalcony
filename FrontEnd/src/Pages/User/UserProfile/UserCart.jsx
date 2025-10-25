import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "../../../Components/Pagination/Pagination";
import Swal from "sweetalert2";

function UserCart() {
  const navigate = useNavigate();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10); 
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

  const handleCheckout = async () => {
    try {
      const response = await axiosInstance.get(`checkCartProducts`);
      
        navigate("/checkoutPage", {
          state: { totalAmount: response.data.total_amount, type: "cart" },
        });
       
    } catch (error) {
      console.error("Error checking cart:", error);
      toast.error(error.response.data.message || "Some items in your cart are no longer available.", {
        position: "bottom-center",
      });
    }
  };
  useEffect(() => {
    fetchUserCart();
  }, []);

  const [userCart, setUserCart] = useState();
  const [invalidItems, setInvalidItems] = useState([]);
  const [showInvalidItems, setShowInvalidItems] = useState(false);

  const handleRemoveInvalidItems = async () => {
    try {
      // Remove all invalid items from cart
      for (const item of invalidItems) {
        await axiosInstance.delete(`userCart/${item.id}`);
      }
      
      // Refresh cart and hide invalid items
      fetchUserCart();
      setInvalidItems([]);
      setShowInvalidItems(false);
      
      toast.success("Invalid items removed from cart", {
        position: "bottom-center",
      });
    } catch (error) {
      console.error("Error removing invalid items:", error);
      toast.error("Failed to remove invalid items. Please try again.", {
        position: "bottom-center",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Delete From Cart",
        text: "Are you sure?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        customClass: {
          popup: "rounded-2xl shadow-2xl backdrop-blur-sm",
          header: "border-b-0 pb-2",
          title: "text-2xl font-bold text-gray-900 mb-2",
          htmlContainer: "text-gray-600 leading-relaxed text-base",
          actions: "gap-3 mt-6",
          confirmButton:
            "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-8 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 border-0",
          cancelButton:
            "bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-8 py-3 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 border-0",
          icon: "border-4 border-blue-100 text-blue-500",
        },
        buttonsStyling: false,
        backdrop: `
                        rgba(0,0,0,0.5)
                        left top
                        no-repeat
                      `,
        showClass: {
          popup: "animate-fade-in-up",
        },
        hideClass: {
          popup: "animate-fade-out",
        },
        width: "28rem",
        padding: "2rem",
        color: "#1f2937",
        background: "#ffffff",
      });
      if (!result.isConfirmed) return;

      const response = await axiosInstance.delete(`userCart/${id}`);
      fetchUserCart();
      toast.success("Deleted Sucessfully", { position: "bottom-center" });
    } catch (error) {}
  };

  const fetchUserCart = async (page = 1) => {
    try {
      const response = await axiosInstance.get(
        `userCart/${user_id}?page=${page}`
      );
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
            <div className="card mb-4 p-4  rounded-lg shadow " key={index}>
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

        {/* Invalid Items Section */}
        {showInvalidItems && invalidItems.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-red-800">
              ⚠️ Items No Longer Available
            </h2>
            <p className="text-red-700 mb-4">
              The following items in your cart are no longer available or have insufficient stock:
            </p>
            
            <div className="space-y-3">
              {invalidItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.product_name}</h3>
                    <p className="text-sm text-gray-600">{item.variant_name}</p>
                    <p className="text-sm text-red-600 font-medium">{item.reason}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    {item.available_stock !== undefined && (
                      <p className="text-sm text-gray-600">Available: {item.available_stock}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleRemoveInvalidItems}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove Invalid Items
              </button>
              <button
                onClick={() => setShowInvalidItems(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
            
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                💡 <strong>Tip:</strong> After removing invalid items, you can try checkout again with the remaining valid items.
              </p>
            </div>
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
