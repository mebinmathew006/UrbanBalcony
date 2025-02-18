import React, { useEffect, useState } from "react";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

function ProductVarientEdit() {
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors: validationErrors },
  } = useForm();

  const [categories, setCategories] = useState([]);
  const [fileError, setFileError] = useState("");
  const [errorsFromBackend, setErrorsFromBackend] = useState({
    commonError: " ",
  });

  const location = useLocation();
  const productVarientDetails = location.state;
  const product_id=productVarientDetails.product.id;

  useEffect(() => {
      // Prepopulate form fields with product details
      Object.keys(productVarientDetails).forEach((key) => {
          setValue(key, productVarientDetails[key]);
        }
      );
    }, []);
  const navigate = useNavigate();
  const updateProduct = async (data) => {
    const formData = new FormData();
    formData.append("product_id", product_id);
    formData.append("id", productVarientDetails.id);
    formData.append("weight", data.weight);
    formData.append("variant_price", data.variant_price);
    formData.append("stock", data.stock);

    try {
      await adminaxiosInstance.put("/productVarientmanage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/ProductVarientManage",{state:product_id});
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorsFromBackend(error.response.data.error);
      } else {
        setErrorsFromBackend({
          commonError: "Something went wrong. Please try again.",
        });
      }
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Edit Product</h2>
        <form onSubmit={handleSubmit(updateProduct)}>
          <div className="mb-3">
            <input
              {...register("weight", { required: "weight is required" })}
              type="text"
              className="form-control input-custom"
              placeholder="Enter product weight"
            />
            {validationErrors.title && (
              <p className="text-danger">{validationErrors.title.message}</p>
            )}
          </div>
          
          <div className="mb-3">
            <input
              {...register("variant_price", {
                required: "Price is required",
              })}
              type="number"
              className="form-control input-custom"
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
            />
            {validationErrors.stock && (
              <p className="text-danger">{validationErrors.stock.message}</p>
            )}
          </div>
         
          {errorsFromBackend && errorsFromBackend.commonError &&(
            <p className="text-danger">{errorsFromBackend.commonError}</p>
          )}
          <button type="submit" className="btn btn-primary w-100">
            Update
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProductVarientEdit;
