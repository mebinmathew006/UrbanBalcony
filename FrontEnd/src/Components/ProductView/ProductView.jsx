import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, ShoppingCart, Star, Package } from "lucide-react";
import { useSelector } from "react-redux";
import {
  addWishlistRoute,
  deleteWishlistRoute,
} from "../../../api/userService";
import { toast } from "react-toastify";

function ProductView(props) {
  const navigate = useNavigate();
  const baseurl = import.meta.env.VITE_BASE_URL_WITH_MEDIA;
  const user_id = useSelector((state) => state.userDetails.id);
  const [products, setProducts] = useState(props.data || []);
  const [loadingWishlist, setLoadingWishlist] = useState(new Set());

  useEffect(() => {
    setProducts(props.data || []);
  }, [props.data]);

  const navigationToProductDetailsPage = (spiceDetails) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate("/productDetails", { state: { spiceDetails } });
  };

  const toggleWishlist = async (productId, isInWishlist) => {
    if (loadingWishlist.has(productId)) return;

    try {
      setLoadingWishlist((prev) => new Set([...prev, productId]));

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, in_wishlist: !isInWishlist } : p
        )
      );

      if (isInWishlist) {
        await deleteWishlistRoute(productId);
        toast.success("Product removed from wishlist", {
          position: "bottom-center",
        });
      } else {
        await addWishlistRoute(productId);
        toast.success("Product added to wishlist", {
          position: "bottom-center",
        });
      }
    } catch (error) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, in_wishlist: isInWishlist } : p
        )
      );

      const errorMessage =
        error?.response?.data?.error || "Failed to update wishlist";
      console.error("Wishlist error:", errorMessage);
      toast.error(errorMessage, { position: "bottom-center" });
    } finally {
      setLoadingWishlist((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Header Section - Responsive */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-green-400 to-green-900 rounded-full mb-4 sm:mb-6">
            <Package className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent px-4">
            {props.category}
          </h2>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-green-900 to-green-400 mx-auto rounded-full"></div>
          {!products?.length && (
            <p className="text-gray-600 mt-4 sm:mt-6 text-sm sm:text-base md:text-lg px-4">
              {`Discover our premium ${props.category.toLowerCase()} collection`}
            </p>
          )}
        </div>

        {/* Product Grid - Responsive columns: 1 col mobile, 2 col tablet, 3 col desktop, 4 col large */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 
    ${
      props.category.toLowerCase() === "products"
        ? "lg:grid-cols-3 2xl:grid-cols-3"
        : "lg:grid-cols-4 2xl:grid-cols-4"
    }`}
        >
          {products ? (
            products?.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 ease-out border border-gray-100 hover:border-green-200 transform hover:-translate-y-1 sm:hover:-translate-y-2"
              >
                {/* Image Container - Aspect square for consistency */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img
                    src={`${baseurl}/${product.product_img1}`}
                    alt={product.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-700 ease-out"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Wishlist Button - Responsive sizing */}
                  {user_id && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product.id, product.in_wishlist);
                      }}
                      disabled={loadingWishlist.has(product.id)}
                      className={`absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 p-2 sm:p-2.5 md:p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 z-10 ${
                        loadingWishlist.has(product.id)
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                      aria-label={
                        product.in_wishlist
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <Heart
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                          product.in_wishlist
                            ? "fill-red-500 text-red-500 scale-110"
                            : "text-gray-600 hover:text-red-500"
                        } ${
                          loadingWishlist.has(product.id) ? "animate-pulse" : ""
                        }`}
                      />
                    </button>
                  )}

                  {/* View Product Button - Desktop hover only */}
                  <div className="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigationToProductDetailsPage(product);
                      }}
                      className="bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2 md:gap-3 text-sm md:text-base font-semibold hover:scale-105 border border-gray-200"
                    >
                      <Eye className="w-4 h-4 md:w-5 md:h-5" />
                      View Details
                    </button>
                  </div>

                  {/* Stock Status Badge - Responsive sizing */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4">
                    <span
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 text-xs font-bold rounded-full backdrop-blur-sm border ${
                        product.total_stock > 0
                          ? "bg-green-100/90 text-green-800 border-green-200"
                          : "bg-red-100/90 text-red-800 border-red-200"
                      }`}
                    >
                      {product.total_stock > 0
                        ? "✓ In Stock"
                        : "✗ Out of Stock"}
                    </span>
                  </div>

                  {/* Quick Stats - Desktop only */}
                  <div className="hidden md:block absolute bottom-3 left-3 md:bottom-4 md:left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 md:px-3 text-xs font-medium text-gray-700 border border-gray-200">
                        <Star className="w-3 h-3 inline mr-1 text-yellow-500" />
                        Premium
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section - Responsive padding */}
                <div
                  className="p-3 sm:p-4 md:p-6 cursor-pointer bg-white"
                  onClick={() => navigationToProductDetailsPage(product)}
                >
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {/* Title - Show 2 lines on mobile */}
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors duration-300">
                      {product.title}
                    </h3>

                    {/* Description - Hidden on mobile, show on tablet+ */}
                    <p className="hidden sm:block text-sm md:text-base text-gray-600 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Price and Action Section - Stack on mobile, row on desktop */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                      <div className="space-y-0.5 sm:space-y-1">
                        <p className="text-xl sm:text-2xl font-bold text-green-600">
                          {product.starting_price
                            ? `₹${product.starting_price}`
                            : "Price unavailable"}
                        </p>
                        {product.total_stock > 0 && (
                          <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {product.total_stock} available
                          </p>
                        )}
                      </div>

                      {/* Action Button - Full width mobile, auto width desktop */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigationToProductDetailsPage(product);
                        }}
                        disabled={product.total_stock === 0}
                        className={`w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${
                          product.total_stock > 0
                            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-105"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {product.total_stock > 0 ? (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              View Product
                            </span>
                            <span className="sm:hidden">View</span>
                          </>
                        ) : (
                          "Unavailable"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements - Hidden on mobile and tablet */}
                <div className="hidden md:block absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400/10 to-green-500/10 rounded-bl-full transform translate-x-8 md:translate-x-10 -translate-y-8 md:-translate-y-10"></div>
                <div className="hidden md:block absolute bottom-0 left-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-green-400/10 to-teal-500/10 rounded-tr-full transform -translate-x-6 md:-translate-x-8 translate-y-6 md:translate-y-8"></div>
              </div>
            ))
          ) : (
            <></>
          )}
        </div>

        {/* Empty State - Responsive sizing */}
        {products && products.length === 0 && (
          <div className="text-center py-12 sm:py-16 md:py-20 px-4">
            <div className="relative mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full opacity-20"></div>
              <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-green-400 to-teal-500 rounded-full opacity-20"></div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              No products found
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
              {`No ${props.category.toLowerCase()} are currently available. Check back soon for new arrivals!`}
            </p>
            <div className="mt-6 sm:mt-8">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                Stay tuned for premium products
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductView;
