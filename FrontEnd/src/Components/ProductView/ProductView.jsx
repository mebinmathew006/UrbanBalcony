import React from "react";
import { useNavigate } from "react-router-dom";

function ProductView(props) {
  const navigate =useNavigate()

  const navigationToProductDetailsPage=(spiceDetails)=>{
    navigate('/productDetails',{state:{spiceDetails}})
  }
  
  
  return (
    <div className="conatiner-fluid bg-[#FCF4D2]">
    <div className="row m-2">
      <h3 className="d-flex ">{props.category}</h3>
    {/* <hr /> */}

    {props.data.length === 0 && <h3>{ `No ${props.category} available`}</h3>}

      {props.data.map((spice, index) => {
        return (
          <div className="col-3 "  key={index} onClick={() =>navigationToProductDetailsPage(spice)}>
            
            <div className="card max-h-96 min-h-96 "  style={{ backgroundColor: '#E8D7B4'}}>
              <img src={`http://127.0.0.1:8000/media/${spice.product_img1}`} alt="Product Image" style={{maxHeight:'120px'}}
              />
              <div className="card-body ">
                <h5 className="card-title">{spice.title}</h5>
                <p className="card-text line-clamp-2">{spice.description}</p>
                <h6 className="card-title text-success">{spice.starting_price ? `Price ₹ ${spice.starting_price}`:``}</h6>

                <h6 className="card-title text-danger">{spice.total_stock>0 ? `Stock ${spice.total_stock}`:`Out of Stock`}</h6>
                  <button className="rounded bg-[#073801] text-white">More Details</button>

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
