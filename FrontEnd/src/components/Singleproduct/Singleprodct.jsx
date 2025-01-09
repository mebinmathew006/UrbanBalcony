import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Singleproduct.css";
import axiosInstance from "../../axiosconfig";
import ReactImageMagnify from "react-image-magnify";
import adminaxiosInstance from "../../adminaxiosconfig";
import ProductView from "../productView/ProductView";
function Singleprodct() {
  
   
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
  const fetchReviewAndRating = async () => {
    try {
      const response = await axiosInstance.get(
        `/reviewAndRating/${productDetails.id}`
      );
      setReviewAndRating(response.data);
    } catch (error) {
      console.log(error);
    }
  };
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

  const addToCart = () => {
    console.log("Add to Cart clicked with quantity:", quantity);
  };

  const buyNow = () => {
    console.log("Buy Now clicked");
  };

  return (
    <div className="conatiner-fluid">
      <div className="row m-2">
        <h4 className="d-flex"></h4>
        <hr />

        <div className="col-12">
          <div className="card">
            <div className="d-flex ">
              <div className="col-5 me-5">
                <div style={{ width: "400px" }}>
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
                <div className="pt-3 d-flex align-items-center">
                  <img
                    className="m-1 imageList"
                    src={`http://127.0.0.1:8000/media/${productDetails.product_img1}`}
                    alt="not found"
                    height={100}
                    onClick={() =>
                      setProduct_img(
                        `http://127.0.0.1:8000/media/${productDetails.product_img1}`
                      )
                    }
                  />
                  <img
                    className="m-2 imageList"
                    src={`http://127.0.0.1:8000/media/${productDetails.product_img2}`}
                    alt="not found"
                    height={100}
                    onClick={() =>
                      setProduct_img(
                        `http://127.0.0.1:8000/media/${productDetails.product_img2}`
                      )
                    }
                  />
                  <img
                    className="m-2 imageList"
                    src={`http://127.0.0.1:8000/media/${productDetails.product_img3}`}
                    alt="not found"
                    height={100}
                    onClick={() =>
                      setProduct_img(
                        `http://127.0.0.1:8000/media/${productDetails.product_img3}`
                      )
                    }
                  />
                </div>
              </div>
              <div className="card-body col-5 ms-5">
                <h1 className="card-title">{productDetails.title}</h1>
                <p className="card-text">{productDetails.description} </p>
                <p className="card-text">Rating:{rating} </p>
                <Link to={`/userReviews/${productDetails.id}`} className="card-text">Reviews </Link>
               {varientSpecificDetails&& <p className="card-text">Price:{varientSpecificDetails.variant_price
               } </p>} 
                { productVarientDetails && productVarientDetails.map((varients,index)=>{
                  return(
                    <button key={index} onClick={()=>ShowVarientDetails(index)} className="m-1">{varients.weight}</button>
                  )
                })}
              { productVarientDetails &&   <p className="card-text">
                  Stock:{varientSpecificDetails.stock}{" "}
                </p>}
                <p className="card-text">
                  Shelf Life:{productDetails.shelf_life}{" "}
                </p>

                <div className=" d-flex ms-5">
                  <label htmlFor="">Select the quantity</label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    style={{ width: "60px", textAlign: "center" }}
                    className="form-control ms-5"
                  />
                </div>
                { productVarientDetails &&
                <>
                <button className="m-1">Add to Cart</button>
                <button className="m-1">wishlist</button>
                <button className="m-1">Buy Now</button></>}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <ProductView data={sampleData} category='Similar Products'></ProductView>  */}

    </div>
    
  );
  
  
}

export default Singleprodct;
