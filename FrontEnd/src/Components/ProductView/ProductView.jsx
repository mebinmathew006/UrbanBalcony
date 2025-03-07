import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ProductView(props) {
  const navigate =useNavigate()
  const [selectedCategories, setSelectedCategories] = useState([]);
  const baseurl=import.meta.env.VITE_BASE_URL_WITH_MEDIA
  const navigationToProductDetailsPage=(spiceDetails)=>{
    navigate('/productDetails',{state:{spiceDetails}})
  }
  
  
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{props.category}</h2>
          {!props.data && (
            <p className="text-gray-500">{`No ${props.category.toLowerCase()} available`}</p>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {props.data.map((product) => (
            <div 
              key={product.id} 
              className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 ease-in-out"
              onClick={() => navigationToProductDetailsPage(product)}
            >
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-t-lg overflow-hidden group-hover:opacity-90 transition-opacity duration-300">
                <img
                  src={`${baseurl}/${product.product_img1}`}
                  alt={product.title}
                  className="w-full h-64 object-cover object-center"
                />
                {/* Quick Action Buttons */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white bg-opacity-90 p-1 rounded-full">
                    <button className="p-2 text-gray-500 hover:text-green-600 focus:outline-none" title="Add to wishlist">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-lg font-medium text-green-700">
                      {product.starting_price ? `₹${product.starting_price}` : 'Price unavailable'}
                    </p>
                    <p className={`text-sm ${product.total_stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.total_stock > 0 ? `${product.total_stock} in stock` : 'Out of Stock'}
                    </p>
                  </div>
                  <button className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  
  );
}

export default ProductView;
