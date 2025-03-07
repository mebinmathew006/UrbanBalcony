import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import { toast } from "react-toastify";

function UserWishlist() {
  const baseurl = import.meta.env.VITE_BASE_URL_FOR_IMAGE;

  const user_id = useSelector((state) => state.userDetails.id);
  const [wishlist, setWishlist] = useState();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await axiosInstance.get(`userWishlist/${user_id}`);
      setWishlist(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
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
    <div className="min-h-screen bg-[#FCF4D2] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

        {wishlist && wishlist[0]?.wishlist_products.length > 0 ? (
          wishlist[0].wishlist_products.map((item, index) => (
            <div
              key={index}
              className="card mb-4 p-4  rounded-lg shadow  "
              style={{backgroundColor:'#E8D7B4'}}
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
    </div>
  );
}

export default UserWishlist;