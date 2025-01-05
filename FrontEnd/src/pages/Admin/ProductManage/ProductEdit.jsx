import React, { useState } from 'react'
import adminaxiosInstance from '../../../adminaxiosconfig';
import { useLocation, useNavigate } from 'react-router-dom';

function ProductEdit(props) {

    const location = useLocation();
    const productDetails = location.state;
    console.log(productDetails);
    
    const navigate = useNavigate();
    const [title, setTitle] = useState(productDetails.title);
    const [category, setCategory] = useState(productDetails.category);
    const [available_quantity, setAvailable_quantity] = useState(productDetails.available_quantity);
    const [description, setDescription] = useState(productDetails.description);
    const [ingredients, setIngredients] = useState(productDetails.ingredients);
    const [shelf_life, setshelf_life] = useState(productDetails.shelf_life);
    const [price, setPrice] = useState(productDetails.price);
    const [product_img1, setProduct_img1] = useState(productDetails.product_img1);
    const [product_img2, setProduct_img2] = useState(productDetails.product_img2);
    const [product_img3, setProduct_img3] = useState(productDetails.product_img3);
    const [fileerror, setFileError] = useState();
  
    
    const handleFileChange1 = (e) => {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setProduct_img1(file);
        
      } else {
        e.target.value = ''; // Clear the file input
      }
    };
    const handleFileChange2 = (e) => {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setProduct_img2(file);
        
      } else {
        e.target.value = ''; // Clear the file input
      }
    };
    const handleFileChange3 = (e) => {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setProduct_img3(file);
        
      } else {
        e.target.value = ''; // Clear the file input
      }
    };
  
    // File validation
    const validateFile = (file) => {
      if (file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          setFileError("Only JPG, JPEG, and PNG files are allowed");
          return false;
        }
      }
      setFileError('');
      return true;
    };
  
  
    const sigupHandle = async(event) => {
      event.preventDefault();
      
      
        try{
          const formData = new FormData();
          formData.append('id', productDetails.id);
          formData.append('title', title);
          formData.append('category', category);
          formData.append('available_quantity', available_quantity);
          formData.append('description', description);
          formData.append('ingredients', ingredients);
          formData.append('shelf_life', shelf_life);
          formData.append('price', price);
          formData.append('product_img1', product_img1); // Add the file
          formData.append('product_img2', product_img2); // Add the file
          formData.append('product_img3', product_img3); // Add the file
  
          const response = await adminaxiosInstance.post('/admineditProduct', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        navigate('/ProductManage')

  
        }catch(error){
          alert(error.response.data.error);
          
        }
      
    };
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom ">
        <div
          className="card p-4 shadow"
          style={{ width: "400px", borderRadius: "12px" }}
        >
          <h2 className="text-center mb-4 fw-bold">Edit Product</h2>
          <form onSubmit={sigupHandle}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control input-custom"
                value={title}
                required
                onChange={(event)=>setTitle(event.target.value)}
              />
            </div>
            {/* <div className="mb-3">
              <input
                type="text"
                className="form-control input-custom"
                value={productDetails.name}
                required
                onChange={(event)=>setCategory(event.target.value)}
              />
            </div> */}
            <div className="mb-3">
              <input
                type="number"
                className="form-control input-custom"
                value={available_quantity}
                required
                onChange={(event)=>setAvailable_quantity(event.target.value)}
              />
            </div>
           
            <div className="mb-3">
              <input
                type="text"
                className="form-control input-custom"
                value={description}
                required
                onChange={(event)=>setDescription(event.target.value)}
              />
            </div>
           
            
            {/* <div className="mb-3">
              <input
                type="text"
                className="form-control input-custom"
                value={productDetails.ingredients}
                required
                onChange={(event)=>setIngredients(event.target.value)}
              />
            </div> */}
            
            <div className="mb-3">
              <input
                type="text"
                className="form-control input-custom"
                value={shelf_life}
                required
                onChange={(event)=>setshelf_life(event.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="number"
                className="form-control input-custom"
                value={price}
                required
                onChange={(event)=>setPrice(event.target.value)}
              />
            </div>
            
            <div className="mb-3">
              <input
                type="file"
                className="form-control input-custom"
                placeholder="Profile Picture"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange1}
  
              />
            </div>
            <div className="mb-3">
              <input
                type="file"
                className="form-control input-custom"
                placeholder="Profile Picture"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange2}
  
              />
            </div>
            <div className="mb-3">
              <input
                type="file"
                className="form-control input-custom"
                placeholder="Profile Picture"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange3}
  
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Update
            </button>
          </form>
        </div>
      </div>
    );
  }

export default ProductEdit
