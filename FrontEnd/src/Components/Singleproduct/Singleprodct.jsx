import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Singleproduct.css";
import axiosInstance from "../../axiosconfig";
import ReactImageMagnify from "react-image-magnify";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

function Singleprodct() {
  const baseurl = import.meta.env.VITE_BASE_URL_WITH_MEDIA;

  const user_id = useSelector((state) => state.userDetails.id);
  const navigate = useNavigate();
  const location = useLocation();
  const productDetails = location.state.spiceDetails;
  const [varientSpecificDetails, setVarientSpecificDetails] = useState("");

  function ShowVarientDetails(index) {
    setVarientSpecificDetails(productVarientDetails[index]);
    setQuantity(1);
  }
  const [product_img, setProduct_img] = useState(
    `${baseurl}/${productDetails.product_img1}`
  );

  const [quantity, setQuantity] = useState(1);
  const [reviewAndRating, setReviewAndRating] = useState();
  const [productVarientDetails, setProductVarientDetails] = useState("");

  const getAverageRating = (reviews) => {
    if (!reviews) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  useEffect(() => {
    fetchProductVarients();
    fetchReviewAndRating();
  }, []);

  // fetch rating and varients
  const fetchReviewAndRating = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `/reviewAndRating/${productDetails.id}`
      );
      
      setReviewAndRating(response.data);
    } catch (error) {}
  }, [productDetails.id]);

  // fetch product varients from admin panel
  const fetchProductVarients = async () => {
    try {
      const response = await axiosInstance.get(
        `/varientForUser/${productDetails.id}`
      );
      setProductVarientDetails(response.data);
      setVarientSpecificDetails(response.data[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleQuantityDecrese = () => {
    if (quantity - 1 > 0) {
      setQuantity(quantity - 1);
    }
  };
  const handleQuantityIncrese = (stock) => {
    if (!stock) return;
    if (quantity + 1 <= stock) {
      setQuantity(quantity + 1);
    }
  };

  // addtocart
  const addToCart = async () => {
    if (!user_id) {
      toast.error("Please login First!", {
        position: "bottom-center",
      });
      return;
    }
    if (!varientSpecificDetails) {
      toast.error("Please select a variant!", {
        position: "bottom-center",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("quantitiy", quantity);
      formData.append("id", varientSpecificDetails.id);
      formData.append("user_id", user_id);
      await axiosInstance.post("/userCart", formData);
      toast.success("Added to Cart!", {
        position: "bottom-center",
      });
    } catch (error) {
      console.log(error);
    }
  };

  // addToWishlist
  const addToWishlist = async () => {
    if (!user_id) {
      toast.error("Please login First!", {
        position: "bottom-center",
      });
    }
    if (!varientSpecificDetails) {
      toast.error("Please select a variant!", {
        position: "bottom-center",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", varientSpecificDetails.id);
      formData.append("user_id", user_id);
      await axiosInstance.post("/userWishlist", formData);
      toast.success("Added to Wishlist!", {
        position: "bottom-center",
      });
    } catch (error) {}
  };

  const buyNow = () => {
    if (!user_id) {
      toast.error("Please login First!", {
        position: "bottom-center",
      });
      return;
    }
    if (quantity > varientSpecificDetails.stock) {
      toast.error("Please select Less Quantitiy!", {
        position: "bottom-center",
      });
      return;
    }
    const totalAmount = quantity * varientSpecificDetails.price_after_offer;
    navigate("/checkoutPage", {
      state: {
        totalAmount,
        type: "buynow",
        productId: varientSpecificDetails.id,
        quantity,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Image Section */}
          <div className="space-y-8">
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="w-full max-w-lg mx-auto">
                <ReactImageMagnify
                  {...{
                    smallImage: {
                      alt: "Product Image",
                      isFluidWidth: true,
                      src: product_img,
                    },
                    largeImage: {
                      src: product_img,
                      width: 600,
                      height: 700,
                    },
                    enlargedImageContainerStyle: {
                      zIndex: 100,
                      overflow: "hidden",
                      background: "#ffffff",
                      borderRadius: "12px",
                      border: "2px solid #e5e7eb",
                    },
                    enlargedImagePosition: "over",
                  }}
                />
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex justify-center gap-4">
              {[
                `${baseurl}/${productDetails.product_img1}`,
                `${baseurl}/${productDetails.product_img2}`,
                `${baseurl}/${productDetails.product_img3}`,
              ].map((imgSrc, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => setProduct_img(imgSrc)}
                >
                  <img
                    className={`w-20 h-20 rounded-xl object-cover border-2 transition-all duration-300 group-hover:scale-105 ${
                      product_img === imgSrc
                        ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                    }`}
                    src={imgSrc}
                    alt={`Product thumbnail ${index + 1}`}
                  />
                  <div className="absolute inset-0 rounded-xl bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                  {productDetails.title}
                </h1>
                
                {/* Rating and Reviews */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xl ${
                            i < Math.floor(getAverageRating(reviewAndRating))
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {getAverageRating(reviewAndRating)}
                    </span>
                  </div>
                  <Link
                    to={`/userReviews/${productDetails.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium no-underline hover:underline transition-all"
                  >
                    View All Reviews
                  </Link>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {productDetails.description}
                </p>
              </div>

              {/* Shelf Life */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-800 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Shelf Life: {productDetails.shelf_life}
                </p>
              </div>
            </div>

            {/* Variants Selection */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Select Weight</h3>
                <div className="flex flex-wrap gap-3">
                  {productVarientDetails &&
                    productVarientDetails.map((varients, index) => (
                      <button
                        key={index}
                        onClick={() => ShowVarientDetails(index)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 border-2 ${
                          varientSpecificDetails?.weight === varients.weight
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg scale-105"
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:scale-105"
                        }`}
                      >
                        {varients.weight}
                      </button>
                    ))}
                </div>
              </div>

              {/* Price and Stock */}
              {varientSpecificDetails && (
                <div className="space-y-4 border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">
                        Selected: {varientSpecificDetails.weight}
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-gray-900">
                          ₹{varientSpecificDetails.price_after_offer || "N/A"}
                        </span>
                        {varientSpecificDetails.variant_price &&
                          varientSpecificDetails.price_after_offer !==
                            varientSpecificDetails.variant_price && (
                          <span className="text-lg text-gray-500 line-through">
                            ₹{varientSpecificDetails.variant_price}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        varientSpecificDetails.stock > 10 
                          ? "bg-green-100 text-green-800"
                          : varientSpecificDetails.stock > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {varientSpecificDetails.stock > 0 
                          ? `${varientSpecificDetails.stock} in stock`
                          : "Out of stock"
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-lg font-semibold text-gray-900">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQuantityDecrese()}
                      disabled={!varientSpecificDetails}
                      className={`w-12 h-12 flex items-center justify-center text-xl font-bold transition-all ${
                        !varientSpecificDetails
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                      }`}
                    >
                      −
                    </button>
                    <div className="w-16 h-12 flex items-center justify-center bg-gray-50 text-lg font-bold text-gray-900">
                      {quantity}
                    </div>
                    <button
                      onClick={() =>
                        handleQuantityIncrese(varientSpecificDetails?.stock)
                      }
                      disabled={!varientSpecificDetails}
                      className={`w-12 h-12 flex items-center justify-center text-xl font-bold transition-all ${
                        !varientSpecificDetails
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                      }`}
                    >
                      +
                    </button>
                  </div>
                  {varientSpecificDetails && (
                    <p className="text-sm text-gray-600">
                      Max available: {varientSpecificDetails.stock}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {varientSpecificDetails && varientSpecificDetails.stock >= 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                    onClick={addToCart}
                  >
                    <span>🛒</span>
                    Add to Cart
                  </button>
                  <button
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                    onClick={() => addToWishlist(varientSpecificDetails.id)}
                  >
                    <span>❤️</span>
                    Wishlist
                  </button>
                  <button
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                    onClick={() => buyNow(varientSpecificDetails.id)}
                  >
                    <span>⚡</span>
                    Buy Now
                  </button>
                </div>
              ) : (
                varientSpecificDetails && varientSpecificDetails.stock <= 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-700 font-bold text-lg">
                      🚫 Currently Out of Stock
                    </p>
                    <p className="text-red-600 text-sm mt-2">
                      We'll notify you when this item is back in stock
                    </p>
                  </div>
                )
              )}
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Singleprodct;