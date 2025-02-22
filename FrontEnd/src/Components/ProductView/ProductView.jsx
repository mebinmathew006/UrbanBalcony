import React from "react";
import { useNavigate } from "react-router-dom";

function ProductView(props) {
  const navigate =useNavigate()
  const baseurl=import.meta.env.VITE_BASE_URL_WITH_MEDIA
  const navigationToProductDetailsPage=(spiceDetails)=>{
    navigate('/productDetails',{state:{spiceDetails}})
  }
  
  
  return (
    <div className="w-full bg-[#FCF4D2]">
    <div className="container mx-auto p-2">
      <h3 className="flex text-lg font-medium">{props.category}</h3>
      {/* Related Products */}
      {props.data.length === 0 && (
        <h3>{`No ${props.category} available`}</h3>
        
      )}
      <hr />
      {/* Responsive grid: 1 column on small screens, up to 4 columns on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {props.data.map((spice, index) => (
          <div
            key={index}
            className="cursor-pointer"
            onClick={() => navigationToProductDetailsPage(spice)}
          >
            <div className="max-h-96 min-h-96 pt-4 pb-2 rounded-xl " style={{ backgroundColor: '#E8D7B4' }}>
              <img
                src={`${baseurl}/${spice.product_img1}`}
                alt="Product Image"
                className="mx-auto rounded-xl w-56"
                style={{ maxHeight: '120px' }}
              />
              <div className="p-4">
                <h5 className="text-xl font-bold">{spice.title}</h5>
                <p className="line-clamp-2">{spice.description}</p>
                <h6 className="text-green-600">
                  {spice.starting_price ? `Price ₹ ${spice.starting_price}` : ''}
                </h6>
                <h6 className="text-red-600">
                  {spice.total_stock > 0 ? `Stock ${spice.total_stock}` : 'Out of Stock'}
                </h6>
                <button className="mt-2 rounded bg-[#073801] text-white  p-2 ">
                  More Details
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
