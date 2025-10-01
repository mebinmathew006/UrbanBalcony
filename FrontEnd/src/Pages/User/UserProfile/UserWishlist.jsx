import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import { toast } from "react-toastify";
import Pagination from "../../../Components/Pagination/Pagination";

function UserWishlist() {
  const baseurl = import.meta.env.VITE_BASE_URL_FOR_IMAGE;
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Items per page
  const user_id = useSelector((state) => state.userDetails.id);
  const [wishlist, setWishlist] = useState();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async (page=1) => {
    try {
      const response = await axiosInstance.get(`userWishlist/${user_id}?page=${page}`);
      // setWishlist(response.data);
      setWishlist(response.data.results);
    setTotalCount(response.data.count);
    setTotalPages(Math.ceil(response.data.count / pageSize));
    setCurrentPage(page);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };
const handlePageChange = (page) => {
    fetchWishlist(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleRemoveFromWishlist = async (id) => {
    try {
      await axiosInstance.delete(`userWishlist/${id}`);
      fetchWishlist();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const handleAddToCart = async (id) => {
    

    try {
      const formData = new FormData();
      formData.append("quantitiy", 1);
      formData.append("id", id);
      formData.append("user_id", user_id);
      await axiosInstance.post("/userCart", formData);
      toast.success("Added to Cart!", {
        position: "bottom-center", // Ensure this position is valid
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen  py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

        {wishlist && wishlist[0]?.wishlist_products.length > 0 ? (
          wishlist[0].wishlist_products.map((item, index) => (
            <div
              key={index}
              className="card mb-4 p-4  rounded-lg shadow-lg  "
              
            >
              <div className="flex items-center justify-between gap-8">
                {/* Product Image */}
                <img
                  src={`${baseurl}${item.product_variant.product.product_img1}`}
                  alt="Product"
                  className="w-24 h-24 rounded-md object-cover"
                />

                {/* Product Details */}
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">
                    {item.product_variant.product.title}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Price: ₹{item.product_variant.variant_price}
                  </p>
                  <p className="text-gray-600">
                    Weight: {item.product_variant.weight}
                  </p>
                  {item.product_variant.stock <= 5 && (
                    <p className="text-red-600 mt-1">
                      Only {item.product_variant.stock} items left!
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAddToCart(item.product_variant.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    disabled={!item.product_variant.stock}
                  >
                    {item.product_variant.stock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">Your wishlist is empty.</p>
            <p className="text-gray-400 mt-2">
              Add items to your wishlist while shopping!
            </p>
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

export default UserWishlist;