import React from "react";
import { useNavigate } from "react-router-dom";

function ProductView(props) {
  const navigate =useNavigate()

  const navigationToProductDetailsPage=(spiceDetails)=>{
    navigate('/productDetails',{state:{spiceDetails}})
  }
  
  // if (!props.data) {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }
  return (
    <div className="conatiner-fluid">
    <div className="row m-2">
      <h4 className="d-flex">{props.category}</h4>
    <hr />
      {props.data.map((spice, index) => {
        return (
          <div className="col-2"  key={index} onClick={() =>navigationToProductDetailsPage(spice)}>
            
            <div className="card max-h-96 min-h-96"  >
              <img src={`http://127.0.0.1:8000/media/${spice.product_img1}`} alt="Product Image" style={{maxHeight:'100px'}}
              />
              <div className="card-body">
                <h5 className="card-title">{spice.title}</h5>
                <p className="card-text">{spice.description}</p>
                {/* {spice.available_quantity>0?<p className="card-text">Stock:{spice.available_quantity}</p>:<p className="card-text text-red-500">Out of Stock</p>} */}
               
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
