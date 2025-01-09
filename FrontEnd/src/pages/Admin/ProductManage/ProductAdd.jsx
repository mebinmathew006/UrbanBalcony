import React, { useEffect, useState } from "react";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

function ProductAdd() {
  const [categories,setCategories]=useState()
  useEffect(()=>{
    fetchCategory()
  },[])
  async function  fetchCategory(){
  const response = await adminaxiosInstance.get('/categorymanage')
  setCategories(response.data)
  }
  const navigate = useNavigate();
  const [errorsFromBackend, setErrorsFromBackend] = useState({
    commonError: "",
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors: validationErrors },
  } = useForm();

  const validateFile = (file) => {
    if (file.length === 0) {
      return "No file selected.";
    }
    const allowedTypes = ["image/jpeg", "image/png"];
    const fileType = file[0]?.type; // Ensure we're accessing the first file
    console.log("File Type:", fileType);
  
    if (!allowedTypes.includes(fileType)) {
      return "Only JPG, JPEG, and PNG files are allowed.";
    }
    return true;
  };
  

  const sigupHandle = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("category_id", data.category);
    formData.append("available_quantity", data.available_quantity);
    formData.append("description", data.description);
    formData.append("shelf_life", data.shelf_life);
    formData.append("price", data.price);
    formData.append("product_img1", data.product_img1[0]);
    formData.append("product_img2", data.product_img2[0]);
    formData.append("product_img3", data.product_img3[0]);

    try {
      await adminaxiosInstance.post("/adminaddProduct", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/ProductManage");
    } catch (error) {
      console.log(error);
      
      setErrorsFromBackend({
        commonError: error.response?.data?.error || "An error occurred",
      });
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Add Product</h2>
        <form onSubmit={handleSubmit(sigupHandle)}>
          <div className="mb-3">
            <input
              {...register("title", { required: "Title is required" })}
              type="text"
              className="form-control input-custom"
              placeholder="Enter the title"
            />
            {validationErrors.title && (
              <p className="text-danger">{validationErrors.title.message}</p>
            )}
          </div>
          <div className="mb-3">
            <select
           
              {...register("category", { required: "Category is required" })}
              
              className="form-control input-custom"
            >
              <option value=""> Select category</option>
              {categories && categories.map((category)=>{
                console.log(category)
                return(<option key={category.id} value={category.id}>{category.name}</option>)
                 })}

            </select> 
            {validationErrors.category && (
              <p className="text-danger">{validationErrors.category.message}</p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("available_quantity", {
                required: "Available quantity is required",
                valueAsNumber: true,
              })}
              type="number"
              className="form-control input-custom"
              placeholder="Enter the available quantity"
            />
            {validationErrors.available_quantity && (
              <p className="text-danger">
                {validationErrors.available_quantity.message}
              </p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("description", { required: "Description is required" })}
              type="text"
              className="form-control input-custom"
              placeholder="Enter the description"
            />
            {validationErrors.description && (
              <p className="text-danger">
                {validationErrors.description.message}
              </p>
            )}
          </div>
          
          <div className="mb-3">
            <input
              {...register("shelf_life", { required: "Shelf life is required" })}
              type="text"
              className="form-control input-custom"
              placeholder="Enter the shelf life"
            />
            {validationErrors.shelf_life && (
              <p className="text-danger">
                {validationErrors.shelf_life.message}
              </p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("price", {
                required: "Price is required",
                valueAsNumber: true,
              })}
              type="number"
              className="form-control input-custom"
              placeholder="Enter the price"
            />
            {validationErrors.price && (
              <p className="text-danger">{validationErrors.price.message}</p>
            )}
          </div>
          <label htmlFor="">Add Images</label>
          <div className="mb-3">
            <input
              {...register("product_img1", {
                required: "Product image 1 is required",
                validate: validateFile,
              })}
              type="file"
              className="form-control input-custom"
              accept=".jpg,.jpeg,.png"
            />
            {validationErrors.product_img1 && (
              <p className="text-danger">
                {validationErrors.product_img1.message}
              </p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("product_img2", {
                required: "Product image 2 is required",
                validate: validateFile,
              })}
              type="file"
              className="form-control input-custom"
              accept=".jpg,.jpeg,.png"
            />
            {validationErrors.product_img2 && (
              <p className="text-danger">
                {validationErrors.product_img2.message}
              </p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("product_img3", {
                required: "Product image 3 is required",
                validate: validateFile,
              })}
              type="file"
              className="form-control input-custom"
              accept=".jpg,.jpeg,.png"
            />
            {validationErrors.product_img3 && (
              <p className="text-danger">
                {validationErrors.product_img3.message}
              </p>
            )}
          </div>
          {errorsFromBackend.commonError && (
            <p className="text-danger">{errorsFromBackend.commonError}</p>
          )}
          <button type="submit" className="btn btn-primary w-100">
            ADD
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProductAdd;
