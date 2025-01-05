import React from "react";
import { useNavigate } from "react-router-dom";

function ProductView(props) {
  const navigate =useNavigate()

  const navigationToProductDetailsPage=(spiceDetails)=>{
    navigate('/productDetails',{state:{spiceDetails}})
  }
  return (
    <div className="conatiner-fluid">
    <div className="row m-2">
      <h4 className="d-flex">Products</h4>
    <hr />
      {props.data.map((spice, index) => {
        return (
          <div className="col-2" key={index} onClick={() =>navigationToProductDetailsPage(spice)}>
            
            <div className="card">
              <img src={`http://127.0.0.1:8000/media/${spice.product_img1}`} alt="Product Image" 
              />
              <div className="card-body">
                <h5 className="card-title">{spice.title}</h5>
                <p className="card-text">{spice.description}</p>
                <p className="card-text">Stock:{spice.available_quantity}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
}

export default ProductView;
