import React, { useEffect, useState, useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Sidebar from "../../../Components/Admin/Sidebar/Sidebar";

function ProductAdd() {
  const [categories, setCategories] = useState([]);
  const [croppedImages, setCroppedImages] = useState({});
  const cropperRefs = useRef({});

  useEffect(() => {
    fetchCategory();
  }, []);

  async function fetchCategory() {
    const response = await adminaxiosInstance.get("/categorymanage");
    setCategories(response.data);
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

  const handleImageChange = (event, fieldName) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCroppedImages((prev) => ({
          ...prev,
          [fieldName]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImage = async (fieldName) => {
    const cropper = cropperRefs.current[fieldName]?.cropper;
    if (cropper && cropper.getCroppedCanvas()) {
      return new Promise((resolve) => {
        cropper.getCroppedCanvas().toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          0.9
        );
      });
    }
    return null;
  };

  const sigupHandle = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("category_id", data.category);
    formData.append("available_quantity", data.available_quantity);
    formData.append("description", data.description);
    formData.append("shelf_life", data.shelf_life);
    formData.append("price", data.price);

    for (const fieldName of ["product_img1", "product_img2", "product_img3"]) {
      const croppedImageBlob = await getCroppedImage(fieldName);
      if (croppedImageBlob) {
        formData.append(fieldName, croppedImageBlob, `${fieldName}.jpg`);
      }
    }

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
    <div className="d-flex vh-100 bg-light h-full">
      <div className="h-full">
        <Sidebar />
      </div>
      <div className="d-flex flex-column flex-grow-1">
        <main className="bg-light">
          <div className="container py-4">
            <div className="d-flex justify-content-center align-items-center">
              <div
                className="card p-4 shadow"
                style={{ width: "500px", borderRadius: "12px" }}
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
                      <option value="">Select category</option>
                      {categories &&
                        categories.map((category) => {
                          return (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          );
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
                    <textarea
                      {...register("description", {
                        required: "Description is required",
                      })}
                      className="form-control input-custom"
                      placeholder="Enter the description"
                      rows="3"
                    ></textarea>
                    {validationErrors.description && (
                      <p className="text-danger">
                        {validationErrors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <input
                      {...register("shelf_life", {
                        required: "Shelf life is required",
                      })}
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
                  <label className="form-label fw-bold">Add Images</label>
                  {["product_img1", "product_img2", "product_img3"].map(
                    (fieldName, index) => (
                      <div key={index} className="mb-3">
                        <label className="form-label">Image {index + 1}</label>
                        <input
                          type="file"
                          className="form-control input-custom"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleImageChange(e, fieldName)}
                        />
                        {croppedImages[fieldName] && (
                          <div className="mt-2">
                            <Cropper
                              src={croppedImages[fieldName]}
                              style={{ height: 200, width: "100%" }}
                              aspectRatio={1}
                              guides={true}
                              ref={(ref) => (cropperRefs.current[fieldName] = ref)}
                            />
                          </div>
                        )}
                      </div>
                    )
                  )}
                  {errorsFromBackend.commonError && (
                    <p className="text-danger">{errorsFromBackend.commonError}</p>
                  )}
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary flex-fill"
                      onClick={() => navigate("/ProductManage")}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary flex-fill">
                      ADD
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProductAdd;