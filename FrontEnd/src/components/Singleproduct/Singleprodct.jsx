import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Singleproduct.css";
import axiosInstance from "../../axiosconfig";
import ReactImageMagnify from "react-image-magnify";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

function Singleprodct() {
  const user_id = useSelector((state) => state.userDetails.id);

  const location = useLocation();
  const productDetails = location.state.spiceDetails;
  const [varientSpecificDetails, setVarientSpecificDetails] = useState("");

  function ShowVarientDetails(index) {
    setVarientSpecificDetails(productVarientDetails[index]);
  }
  const [product_img, setProduct_img] = useState(
    `http://127.0.0.1:8000/media/${productDetails.product_img1}`
  );

  const [quantity, setQuantity] = useState(1);
  const [reviewAndRating, setReviewAndRating] = useState();
  const [productVarientDetails, setProductVarientDetails] = useState("");
  const rating = reviewAndRating
    ? reviewAndRating.reduce((acc, obj) => acc + obj.rating) /
      reviewAndRating.length
    : 0;

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
      console.log("Product Varient Details:", response.data);
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
    if (!varientSpecificDetails) {
      // Check the specific variant details instead of productVarientDetails
      toast.error("Please select a variant!", {
        position: "bottom-center", // Ensure this position is valid
      });
      return; // Add return to stop further execution
    }

    try {
      const formData = new FormData();
      formData.append("quantitiy", quantity);
      formData.append("id", varientSpecificDetails.id);
      formData.append("user_id", user_id);
      await axiosInstance.post("/userCart", formData);
      toast.error("Added to Cart!", {
        position: "bottom-center", // Ensure this position is valid
      });
    } catch (error) {
      console.log(error);
    }
  };

  // addToWishlist
  const addToWishlist = async () => {
    if (!varientSpecificDetails) {
      // Check the specific variant details instead of productVarientDetails
      toast.error("Please select a variant!", {
        position: "bottom-center",
      });
      return; // Add return to stop further execution
    }

    try {
      const formData = new FormData();
      formData.append("id", varientSpecificDetails.id);
      formData.append("user_id", user_id);
      await axiosInstance.post("/userWishlist", formData);
      toast.info("Added to Wishlist!", {
        position: "bottom-center",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const buyNow = () => {
    console.log("Buy Now clicked");
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Image Section */}
        <div className="space-y-6">
          {/* Main Image */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-full max-w-md mx-auto">
              <ReactImageMagnify
                {...{
                  smallImage: {
                    alt: "Product Image",
                    isFluidWidth: true,
                    src: product_img,
                  },
                  largeImage: {
                    src: product_img,
                    width: 400,
                    height: 500,
                  },
                  enlargedImageContainerStyle: {
                    zIndex: 100,
                    overflow: "hidden",
                    background: "#fff",
                  },
                  enlargedImagePosition: "over",
                }}
              />
            </div>
          </div>

          {/* Thumbnail Images */}
          <div className="flex justify-center gap-4">
            <img
              className="w-24 h-24 rounded-lg shadow hover:ring-2 ring-blue-500 transition-all cursor-pointer object-cover"
              src={`http://127.0.0.1:8000/media/${productDetails.product_img1}`}
              alt="Product thumbnail 1"
              onClick={() =>
                setProduct_img(
                  `http://127.0.0.1:8000/media/${productDetails.product_img1}`
                )
              }
            />
            <img
              className="w-24 h-24 rounded-lg shadow hover:ring-2 ring-blue-500 transition-all cursor-pointer object-cover"
              src={`http://127.0.0.1:8000/media/${productDetails.product_img2}`}
              alt="Product thumbnail 2"
              onClick={() =>
                setProduct_img(
                  `http://127.0.0.1:8000/media/${productDetails.product_img2}`
                )
              }
            />
            <img
              className="w-24 h-24 rounded-lg shadow hover:ring-2 ring-blue-500 transition-all cursor-pointer object-cover"
              src={`http://127.0.0.1:8000/media/${productDetails.product_img3}`}
              alt="Product thumbnail 3"
              onClick={() =>
                setProduct_img(
                  `http://127.0.0.1:8000/media/${productDetails.product_img3}`
                )
              }
            />
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Product Title */}
          <h1 className="text-3xl font-bold text-gray-800">
            {productDetails.title}
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-lg leading-relaxed">
            {productDetails.description}
          </p>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Rating: {rating}
            </span>
            <Link
              to={`/userReviews/${productDetails.id}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Reviews
            </Link>
          </div>

          {/* Price */}
          {varientSpecificDetails && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                Price: ₹
                {varientSpecificDetails.variant_price ? (
                  varientSpecificDetails.price_after_offer ===
                  varientSpecificDetails.variant_price ? (
                    varientSpecificDetails.variant_price
                  ) : (
                    <>
                      <del className="text-red-600 text-lg">{varientSpecificDetails.variant_price}</del>{" "}
                      {varientSpecificDetails.price_after_offer}
                    </>
                  )
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          )}

          {/* Variants */}
          <div className="space-y-2">
            <label className=" block text-sm font-medium text-gray-700">
              Select Weight:
            </label>
            <div className="flex flex-wrap gap-2">
              {productVarientDetails &&
                productVarientDetails.map((varients, index) => (
                  <button
                    key={index}
                    onClick={() => ShowVarientDetails(index)}
                    className="bg-white px-4 py-2 rounded-full border border-gray-300 hover:border-blue-500 hover:bg-blue-100 transition-colors"
                  >
                    {varients.weight}
                  </button>
                ))}
            </div>
          </div>

          {/* Stock Info */}
          {productVarientDetails && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-800 font-medium">
                Stock Available: {varientSpecificDetails.stock}
              </p>
            </div>
          )}

          {/* Shelf Life */}
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-yellow-800 font-medium">
              Shelf Life: {productDetails.shelf_life}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => handleQuantityDecrese()}
              disabled={!varientSpecificDetails}
              className={`px-2 py-1 rounded ${
                !varientSpecificDetails
                  ? "bg-gray-100 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              -
            </button>
            <p className="font-medium">{quantity}</p>
            <button
              onClick={() =>
                handleQuantityIncrese(varientSpecificDetails?.stock)
              }
              disabled={!varientSpecificDetails}
              className={`px-2 py-1 rounded ${
                !varientSpecificDetails
                  ? "bg-gray-100 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              +
            </button>
          </div>

          {/* Action Buttons */}
          {varientSpecificDetails && varientSpecificDetails.stock >= 1 && (
            <div className="flex gap-4 pt-4">
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                onClick={addToCart}
              >
                Add to Cart
              </button>
              <button
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                onClick={() => addToWishlist(varientSpecificDetails.id)}
              >
                Wishlist
              </button>
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Buy Now
              </button>
            </div>
          )}
          {varientSpecificDetails && varientSpecificDetails.stock <= 0 && (
            <p className="text-red-500">Out of Stock</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Singleprodct;
