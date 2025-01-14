import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Singleproduct.css";
import axiosInstance from "../../axiosconfig";
import ReactImageMagnify from "react-image-magnify";
import adminaxiosInstance from "../../adminaxiosconfig";
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
function Singleprodct() {
  
  const user_id=useSelector((state)=>state.userDetails.id)
  const location = useLocation();
  const productDetails = location.state.spiceDetails;
  const [varientSpecificDetails, setVarientSpecificDetails] = useState(''); 

  function ShowVarientDetails(index){
    setVarientSpecificDetails(productVarientDetails[index])
  }
  const [product_img, setProduct_img] = useState(
    `http://127.0.0.1:8000/media/${productDetails.product_img1}`
  );

  const [quantity, setQuantity] = useState(1);
  const [reviewAndRating, setReviewAndRating] = useState();
  const [productVarientDetails, setProductVarientDetails] = useState('');
  const rating = reviewAndRating
    ? reviewAndRating.reduce((acc, obj) => acc + obj.rating) /
      reviewAndRating.length
    : 0;
  console.log("Rating:", rating);

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
      console.log('error');
    } catch (error) {
      
    }
  },[productDetails.id])

  // fetch product varients from admin panel
  const fetchProductVarients = async () => {
    try {
      const response = await adminaxiosInstance.get(
        `/productVarientmanage/${productDetails.id}`
      );
      setProductVarientDetails(response.data);
      console.log("Product Varient Details:", response.data);
      
    } catch (error) {
      console.log(error);
    }
  };

  const handleQuantityChange = (event) => {
    setQuantity(Number(event.target.value));
  };

// addtocart
  const addToCart = async () => {
    if (!varientSpecificDetails) { // Check the specific variant details instead of productVarientDetails
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
      await axiosInstance.post("/userCart", formData, );
      toast.error("Added to Cart!", {
        position: "bottom-center", // Ensure this position is valid
      });
    } catch (error) {
      console.log(error);
      
    }
  };

  const buyNow = () => {
    console.log("Buy Now clicked");
  };

  return (
    <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
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
                width: 1500,
                height: 1800,
              },
              enlargedImageContainerStyle: { zIndex: 1000 },
            }}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <img
            className="w-24 h-24 border rounded cursor-pointer"
            src={`http://127.0.0.1:8000/media/${productDetails.product_img1}`}
            alt="not found"
            onClick={() =>
              setProduct_img(
                `http://127.0.0.1:8000/media/${productDetails.product_img1}`
              )
            }
          />
          <img
            className="w-24 h-24 border rounded cursor-pointer"
            src={`http://127.0.0.1:8000/media/${productDetails.product_img2}`}
            alt="not found"
            onClick={() =>
              setProduct_img(
                `http://127.0.0.1:8000/media/${productDetails.product_img2}`
              )
            }
          />
          <img
            className="w-24 h-24 border rounded cursor-pointer"
            src={`http://127.0.0.1:8000/media/${productDetails.product_img3}`}
            alt="not found"
            onClick={() =>
              setProduct_img(
                `http://127.0.0.1:8000/media/${productDetails.product_img3}`
              )
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{productDetails.title}</h1>
        <p className="text-gray-600">{productDetails.description}</p>
        <p className="text-gray-600">Rating: {rating}</p>
        <Link
          to={`/userReviews/${productDetails.id}`}
          className="text-blue-500 hover:underline"
        >
          Reviews
        </Link>

        {varientSpecificDetails && (
          <p className="text-lg font-semibold">
            Price: {varientSpecificDetails.variant_price}
          </p>
        )}

        {productVarientDetails &&
          productVarientDetails.map((varients, index) => (
            <button
              key={index}
              onClick={() => ShowVarientDetails(index)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded m-1"
            >
              {varients.weight}
            </button>
          ))}

        {productVarientDetails && (
          <p className="text-gray-600">Stock: {varientSpecificDetails.stock}</p>
        )}

        <p className="text-gray-600">
          Shelf Life: {productDetails.shelf_life}
        </p>

        <div className="flex items-center gap-4">
          <div>
            
          </div>
          <label htmlFor="quantity" className="text-gray-600 m-auto">
            Select the quantity:
          </label>
          <div> <input
            id="quantity"
            type="number"
            min="1"
            max={varientSpecificDetails.stock}
            value={quantity}
            onChange={handleQuantityChange}
            className="bg-gray-200 w-16 text-center border border-gray-300 rounded py-1"
          /></div>
         
        </div>

        {productVarientDetails && (
          <div className="flex gap-4 m-5 ">
            <button className="bg-green-300 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" onClick={addToCart}>
              Add to Cart
            </button>
            <button className="bg-blue-800 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Wishlist
            </button>
            <button className="bg-red-800 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
              Buy Now
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
    
  );
  
  
}

export default Singleprodct;
