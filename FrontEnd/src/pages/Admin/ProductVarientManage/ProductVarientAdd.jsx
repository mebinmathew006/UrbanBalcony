import React, { useEffect, useState } from "react";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

function ProductVarientAdd() {
  const location =useLocation()
  const product_id=location.state
  console.log(product_id)
  const [categories,setCategories]=useState()
  useEffect(()=>{
    fetchCategory()
  },[])
  async function  fetchCategory(){
  const response = await adminaxiosInstance.get(`/productVarientmanage/${product_id}`);
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
    formData.append("product_id", product_id);
    formData.append("weight", data.weight);
    formData.append("variant_price", data.variant_price);
    formData.append("stock", data.stock);
   

    try {
      await adminaxiosInstance.post("/productVarientmanage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/ProductVarientManage",{state:product_id});
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
              {...register("weight", { required: "weight is required" })}
              type="text"
              className="form-control input-custom"
              placeholder="Enter the weight"
            />
            {validationErrors.weight && (
              <p className="text-danger">{validationErrors.weight.message}</p>
            )}
          </div>
          
          <div className="mb-3">
            <input
              {...register("variant_price", {
                required: "price is required",
                valueAsNumber: true,
              })}
              type="number"
              className="form-control input-custom"
              placeholder="Enter the price"
            />
            {validationErrors.variant_price && (
              <p className="text-danger">
                {validationErrors.variant_price.message}
              </p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("stock", { required: "stock is required" })}
              type="number"
              className="form-control input-custom"
              placeholder="Enter the stock"
            />
            {validationErrors.stock && (
              <p className="text-danger">
                {validationErrors.stock.message}
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

export default ProductVarientAdd;
