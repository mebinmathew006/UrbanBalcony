import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye } from "lucide-react";
import { useSelector } from "react-redux";
import { addWishlistRoute, deleteWishlistRoute } from "../../../api/userService";
import { toast } from "react-toastify";

function ProductView(props) {
  const navigate = useNavigate();
  const baseurl = import.meta.env.VITE_BASE_URL_WITH_MEDIA;
  const user_id = useSelector((state) => state.userDetails.id);
  const [products, setProducts] = useState(props.data || []);
  console.log(products,'kkkkkkkkkkkkkkkkkkkk')
  const [loadingWishlist, setLoadingWishlist] = useState(new Set());

  useEffect(() => {
    setProducts(props.data || []); 
  }, [props.data]);

  const navigationToProductDetailsPage = (spiceDetails) => {
    navigate("/productDetails", { state: { spiceDetails } });
  };

  const toggleWishlist = async (productId, isInWishlist) => {
    // Prevent multiple clicks while processing
    if (loadingWishlist.has(productId)) return;
    
    try {
      // Add to loading state
      setLoadingWishlist(prev => new Set([...prev, productId]));
      
      // Optimistically update UI first
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, in_wishlist: !isInWishlist } : p
        )
      );

      if (isInWishlist) {
        await deleteWishlistRoute(productId);
        toast.success('Product removed from wishlist', { position: 'bottom-center' });
      } else {
        await addWishlistRoute(productId);
        toast.success('Product added to wishlist', { position: 'bottom-center' });
      }
      
    } catch (error) {
      // Revert the optimistic update on error
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, in_wishlist: isInWishlist } : p
        )
      );
      
      const errorMessage = error?.response?.data?.error || 'Failed to update wishlist';
      console.error('Wishlist error:', errorMessage);
      toast.error(errorMessage, { position: 'bottom-center' });
    } finally {
      // Remove from loading state
      setLoadingWishlist(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{props.category}</h2>
          {!products?.length && (
            <p className="text-gray-500">{`No ${props.category.toLowerCase()} available`}</p>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {products ? products?.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 ease-in-out border border-gray-200"
            >
              <div className="relative aspect-w-1 aspect-h-1 bg-gray-200 rounded-t-lg overflow-hidden">
                <img
                  src={`${baseurl}/${product.product_img1}`}
                  alt={product.title}
                  className="w-full h-64 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Wishlist Button - Top Right */}
                {user_id && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id, product.in_wishlist);
                    }}
                    disabled={loadingWishlist.has(product.id)}
                    className={`absolute top-3 right-3 p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full shadow-sm hover:bg-opacity-100 transition-all duration-200 z-10 ${
                      loadingWishlist.has(product.id) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                    aria-label={product.in_wishlist ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart
                      className={`w-5 h-5 transition-all duration-200 ${
                        product.in_wishlist
                          ? "fill-red-500 text-red-500 scale-110"
                          : "text-gray-600 hover:text-red-500"
                      } ${loadingWishlist.has(product.id) ? 'animate-pulse' : ''}`}
                    />
                  </button>
                )}

                {/* View Product Button - Center (appears on hover) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-20">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigationToProductDetailsPage(product);
                    }}
                    className="bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>

                {/* Stock Status Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.total_stock > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.total_stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div 
                className="p-4 cursor-pointer"
                onClick={() => navigationToProductDetailsPage(product)}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-green-700">
                      {product.starting_price
                        ? `₹${product.starting_price}`
                        : "Price unavailable"}
                    </p>
                    {product.total_stock > 0 && (
                      <p className="text-sm text-gray-500">
                        {product.total_stock} available
                      </p>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigationToProductDetailsPage(product);
                    }}
                    disabled={product.total_stock === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      product.total_stock > 0
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {product.total_stock > 0 ? "View Product" : "Unavailable"}
                  </button>
                </div>
              </div>
            </div>
          )):<></>}
        </div>

        {/* Empty State */}
        {products && products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Heart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500">
              {`No ${props.category.toLowerCase()} are currently available.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductView;