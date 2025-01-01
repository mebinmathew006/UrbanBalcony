import React, { useState } from 'react'
import { useLocation } from 'react-router-dom';
import Header from '../header/header';
import Footer from '../footer/Footer';

function Singleprodct() {
  const location = useLocation()
  const productDetails= location.state.spiceDetails

  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (event) => {
    setQuantity(Number(event.target.value));
  };

  const addToCart = () => {
    console.log('Add to Cart clicked with quantity:', quantity);
  };

  const buyNow = () => {
    console.log('Buy Now clicked');
  };

  return (
    
      <div className="container-fluid py-4">
      <div className="row">
        {/* Product Image Section */}
        <div className="col-md-6">
          <div className="product-image mb-4">
            <img
              src={productDetails.image1}
              alt={productDetails.name}
              className="img-fluid rounded shadow"
            />
          </div>
        </div>

        {/* Product Details Section */}
        <div className="col-md-6">
          <h1 className="mb-3">{productDetails.name}</h1>
          <p className="text-muted">{productDetails.description}</p>
          <p>
            <strong>Category:</strong> Seeds and Nuts
          </p>
          <p>
            <strong>Ingredients:</strong> White Sesame Seeds
          </p>
          <p>
            <strong>Price:</strong> ₹499.00
          </p>

          {/* Quantity Selector */}
          <div className="d-flex align-items-center mb-3">
            <label htmlFor="quantity" className="me-2">
              Quantity:
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              style={{ width: '60px', textAlign: 'center' }}
              className="form-control"
            />
          </div>

          {/* Action Buttons */}
          <div>
            <button className="btn btn-primary me-2" onClick={addToCart}>
              Add to Cart
            </button>
            <button className="btn btn-outline-primary" onClick={buyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
   
  )
}

export default Singleprodct
