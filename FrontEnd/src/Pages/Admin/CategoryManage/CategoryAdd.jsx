import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import adminaxiosInstance from "../../../adminaxiosconfig";

function CategoryAdd() {
  const navigate = useNavigate();
  const [errorsFromBackend, setErrorsFromBackend] = useState({
    title: [],
    commonError: [],
  });

  const {
    register,
    handleSubmit,
    formState: { errors: validationErrors },
  } = useForm();

  const categoryAddHandler = async (data) => {
    try {
      const response = await adminaxiosInstance.post("/adminaddCategory", data);
      navigate("/CategoryManage");
    } catch (error) {
      console.error(error.response.data.error);
      setErrorsFromBackend(error.response.data.error); // Capture backend errors
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Add Category</h2>
        <form onSubmit={handleSubmit(categoryAddHandler)}>
          <div className="mb-3">
            <input
              {...register("name", {
                required: "Category name is required",
                pattern: {
                  value: /^[A-Za-z\s]*$/,
                  message: "Category name can only contain letters and spaces",
                },
                maxLength: {
                  value: 100,
                  message: "Category name cannot exceed 100 characters",
                },
              })}
              type="text"
              className="form-control input-custom"
              placeholder="Enter the title"
            />
            {validationErrors.name && (
              <p className="text-danger">{validationErrors.name.message}</p>
            )}
            {errorsFromBackend.name && (
              <p className="text-danger">{errorsFromBackend.name}</p>
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

export default CategoryAdd;
