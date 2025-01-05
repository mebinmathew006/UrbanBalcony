import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import adminaxiosInstance from "../../../adminaxiosconfig";

function CategoryUpdate() {
  const location = useLocation();
  const CategoryDetails = location.state;
  const navigate = useNavigate();

  const [errorsFromBackend, setErrorsFromBackend] = useState({
    title: [],
    commonError: [],
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors: validationErrors },
  } = useForm({
    defaultValues: {
      title: CategoryDetails.name,
    },
  });

  const categoryUpdateHandler = async (data) => {
    const { title } = data;
    try {
      const response = await adminaxiosInstance.post("/adminUpdateCategory", {
        name: title,
        id: CategoryDetails.id,
      });
      navigate("/CategoryManage");
    } catch (error) {
      console.error(error.response.data.error);
      setErrorsFromBackend(error.response.data.error); // Update backend error state
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Update Category</h2>
        <form onSubmit={handleSubmit(categoryUpdateHandler)}>
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
              placeholder="Enter category title"
            />
            {validationErrors.title && (
              <p className="text-danger">{validationErrors.title.message}</p>
            )}
            {errorsFromBackend.name && (
              <p className="text-danger">{errorsFromBackend.name}</p>
            )}
          </div>
          {errorsFromBackend.commonError && (
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

export default CategoryUpdate;
