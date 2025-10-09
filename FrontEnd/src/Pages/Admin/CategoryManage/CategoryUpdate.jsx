import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import adminaxiosInstance from "../../../adminaxiosconfig";
import Sidebar from "../../../Components/Admin/Sidebar/Sidebar";

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
      name: CategoryDetails.name,
    },
  });

  const categoryUpdateHandler = async (data) => {
    const { name } = data;
    try {
      const response = await adminaxiosInstance.post("/adminUpdateCategory", {
        name: name,
        id: CategoryDetails.id,
      });
      navigate("/CategoryManage");
    } catch (error) {
      console.error(error.response.data.error);
      setErrorsFromBackend(error.response.data.error);
    }
  };

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1">
        <main className="bg-light d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
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
                Update
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CategoryUpdate;