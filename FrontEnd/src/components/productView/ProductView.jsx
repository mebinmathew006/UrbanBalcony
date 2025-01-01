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
      <h4 className="d-flex">{props.category}</h4>
    <hr />
      {props.data.map((spice, index) => {
        return (
          <div className="col-2" key={index} onClick={() =>navigationToProductDetailsPage(spice)}>
            
            <div className="card">
              <img
                src={spice.image1}
                className="card-img-top"
                alt={spice.name}
              />
              <div className="card-body">
                <h5 className="card-title">{spice.name}</h5>
                <p className="card-text">{spice.description}</p>
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
