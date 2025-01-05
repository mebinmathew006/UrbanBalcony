import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import './Singleproduct.css'
import axiosInstance from "../../axiosconfig";
function Singleprodct() {
  const location = useLocation();
  const productDetails = location.state.spiceDetails;

  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState();

  const fetchRating = async () => {
    try {
      const response = await axiosInstance.get(`/rating/${productDetails.id}`);
      setRating(response.data);
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
                <img src={`http://127.0.0.1:8000/media/${productDetails.product_img1}`}

                  alt=""
                  width={565}
                  height={400}
                />
                <div className="pt-3 d-flex align-items-center">
                  <img
                    className=" m-1"
                    src={`http://127.0.0.1:8000/media/${productDetails.product_img1}`}
                    alt="not found"
                    height={100}
                  />
                  <img
                    className=" m-2"
                    src={`http://127.0.0.1:8000/media/${productDetails.product_img2}`}
                    alt="not found"
                    height={100}
                  />
                  <img
                    className=" m-2"
                    src={`http://127.0.0.1:8000/media/${productDetails.product_img3}`}
                    alt="not found"
                    height={100}
                  />
                </div>
              </div>
              <div className="card-body col-5 ms-5">
                <h1 className="card-title">{productDetails.title}</h1>
                <p className="card-text">{productDetails.description} </p>
                <p className="card-text">Rating:{rating} </p>
                <p className="card-text">Reviews </p>

                
               
                <p className="card-text">Price:{productDetails.price} </p>
                <p className="card-text">Stock:{productDetails.available_quantity} </p>
                
                <div className=" d-flex ms-5"><label htmlFor="">Select the quantity</label><input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              style={{ width: '60px', textAlign: 'center' }}
              className="form-control ms-5"
            /></div>
                
                <button className="m-1">Add to Cart</button>
                <button className="m-1">wishlist</button>
                <button className="m-1">Buy Now</button>


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Singleprodct;
