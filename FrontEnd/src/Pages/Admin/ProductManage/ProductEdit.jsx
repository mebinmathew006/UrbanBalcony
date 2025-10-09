import React, { useEffect, useRef, useState } from "react";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useLocation, useNavigate } from "react-router-dom";
import Cropper from "react-cropper";
import { useForm } from "react-hook-form";
import "cropperjs/dist/cropper.css";
import Sidebar from "../../../Components/Admin/Sidebar/Sidebar";

function ProductEdit() {
  const cropperRefs = useRef({});
  const baseUrl = import.meta.env.VITE_BASE_URL_FOR_IMAGE;

  const [croppedImages, setCroppedImages] = useState({});
  const [imageNames, setImageNames] = useState({});
  const [categories, setCategories] = useState([]);
  const [errorsFromBackend, setErrorsFromBackend] = useState({
    commonError: "",
  });

  const location = useLocation();
  const productDetails = location.state;
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors: validationErrors },
  } = useForm();

  useEffect(() => {
    fetchCategory();
    Object.keys(productDetails).forEach((key) => {
      if (
        key !== "product_img1" &&
        key !== "product_img2" &&
        key !== "product_img3"
      ) {
        setValue(key, productDetails[key]);
      }
    });
  }, []);

  async function fetchCategory() {
    try {
      const response = await adminaxiosInstance.get("/categorymanage");
      setCategories(response.data.results);
    } catch (error) {
      setErrorsFromBackend({ commonError: "Failed to fetch categories" });
    }
  }

  const handleImageChange = (event, fieldName) => {
    const file = event.target.files[0];
    if (file) {
      setImageNames((prev) => ({
        ...prev,
        [fieldName]: file.name,
      }));
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

  const handleZoom = (fieldName, delta) => {
    const cropper = cropperRefs.current[fieldName]?.cropper;
    if (cropper) {
      cropper.zoom(delta);
    }
  };

  const handleRotate = (fieldName, degree) => {
    const cropper = cropperRefs.current[fieldName]?.cropper;
    if (cropper) {
      cropper.rotate(degree);
    }
  };

  const handleReset = (fieldName) => {
    const cropper = cropperRefs.current[fieldName]?.cropper;
    if (cropper) {
      cropper.reset();
    }
  };

  const removeImage = (fieldName) => {
    setCroppedImages((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
    setImageNames((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  };

  const updateProduct = async (data) => {
    const formData = new FormData();
    formData.append("id", productDetails.id);
    data.title && formData.append("title", data.title);
    data.category && formData.append("category_id", data.category.id);
    data.available_quantity &&
      formData.append("available_quantity", data.available_quantity);
    data.description && formData.append("description", data.description);
    data.shelf_life && formData.append("shelf_life", data.shelf_life);
    data.price && formData.append("price", data.price);

    for (const fieldName of ["product_img1", "product_img2", "product_img3"]) {
      const croppedImageBlob = await getCroppedImage(fieldName);
      if (croppedImageBlob) {
        formData.append(fieldName, croppedImageBlob, `${fieldName}.jpg`);
      }
    }

    try {
      console.log(formData)
      await adminaxiosInstance.post("/admineditProduct", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/ProductManage");
    } catch (error) {
      console.log(error);
      setErrorsFromBackend({
        commonError: error.response?.data?.error || "An error occurred"
      });
    }
  };

  return (
    <div className="d-flex vh-100 bg-light h-full">
      <div className="h-full">
        <Sidebar />
      </div>
      <div className="d-flex flex-column flex-grow-1 overflow-auto">
        <main className="bg-light py-4">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="mb-1 ms-7 fw-bold" style={{ color: "#2c3e50" }}>
                  Edit Product
                </h2>
                <p className="text-muted mb-0">Update your product details</p>
              </div>
              <button
                className="btn btn-primary px-4 py-2 shadow-sm"
                style={{
                  borderRadius: "8px",
                  fontWeight: "500",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                }}
                onClick={() => navigate("/ProductAdd")}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add New Product
              </button>
            </div>
            <div className="d-flex justify-content-center align-items-start p-10">
              <div className="card shadow-lg border-0 w-full">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit(updateProduct)}>
                    {/* Product Title */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-secondary small">
                        Product Title <span className="text-danger">*</span>
                      </label>
                      <input
                        {...register("title", {
                          required: "Title is required",
                        })}
                        type="text"
                        className="form-control form-control-lg shadow-sm"
                        placeholder="Enter product title"
                        style={{ borderRadius: "8px" }}
                      />
                      {validationErrors.title && (
                        <div className="text-danger small mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {validationErrors.title.message}
                        </div>
                      )}
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-secondary small">
                        Category <span className="text-danger">*</span>
                      </label>
                      <select
                        {...register("category", {
                          required: "Category is required",
                        })}
                        className="form-control form-control-lg shadow-sm"
                        style={{ borderRadius: "8px" }}
                      >
                        <option value={productDetails.category?.id || ""} selected>
                          {productDetails.category?.name || "Select a category"}
                        </option>
                        {categories && categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.category && (
                        <div className="text-danger small mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {validationErrors.category.message}
                        </div>
                      )}
                    </div>

                    {/* Two Column Layout */}
                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-semibold text-secondary small">
                          Available Quantity <span className="text-danger">*</span>
                        </label>
                        <input
                          {...register("available_quantity", {
                            required: "Available quantity is required",
                            valueAsNumber: true,
                          })}
                          type="number"
                          className="form-control form-control-lg shadow-sm"
                          placeholder="Quantity"
                          style={{ borderRadius: "8px" }}
                        />
                        {validationErrors.available_quantity && (
                          <div className="text-danger small mt-1">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {validationErrors.available_quantity.message}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-semibold text-secondary small">
                          Price (₹) <span className="text-danger">*</span>
                        </label>
                        <input
                          {...register("price", {
                            required: "Price is required",
                            valueAsNumber: true,
                          })}
                          type="number"
                          className="form-control form-control-lg shadow-sm"
                          placeholder="Price"
                          style={{ borderRadius: "8px" }}
                        />
                        {validationErrors.price && (
                          <div className="text-danger small mt-1">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {validationErrors.price.message}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shelf Life */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-secondary small">
                        Shelf Life <span className="text-danger">*</span>
                      </label>
                      <input
                        {...register("shelf_life", {
                          required: "Shelf life is required",
                        })}
                        type="text"
                        className="form-control form-control-lg shadow-sm"
                        placeholder="e.g., 6 months, 1 year"
                        style={{ borderRadius: "8px" }}
                      />
                      {validationErrors.shelf_life && (
                        <div className="text-danger small mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {validationErrors.shelf_life.message}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-secondary small">
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        {...register("description", {
                          required: "Description is required",
                        })}
                        className="form-control shadow-sm"
                        placeholder="Enter product description"
                        rows="4"
                        style={{ borderRadius: "8px" }}
                      ></textarea>
                      {validationErrors.description && (
                        <div className="text-danger small mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {validationErrors.description.message}
                        </div>
                      )}
                    </div>

                    {/* Images Section */}
                    <div className="mb-4">
                      <label className="form-label fw-bold text-dark d-flex align-items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="currentColor"
                          className="bi bi-images me-2"
                          viewBox="0 0 16 16"
                        >
                          <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                          <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z" />
                        </svg>
                        Product Images
                      </label>
                      <p className="text-muted small mb-3">
                        Upload up to 3 images (JPG, JPEG, or PNG)
                      </p>

                      {["product_img1", "product_img2", "product_img3"].map(
                        (fieldName, index) => (
                          <div key={index} className="mb-4">
                            <div
                              className="card border shadow-sm"
                              style={{ borderRadius: "12px" }}
                            >
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <label className="form-label fw-semibold mb-0">
                                    Image {index + 1}
                                  </label>
                                  {(croppedImages[fieldName] || productDetails[`product_img${index + 1}`]) && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => removeImage(fieldName)}
                                      style={{ borderRadius: "6px" }}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        className="bi bi-trash me-1"
                                        viewBox="0 0 16 16"
                                      >
                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                      </svg>
                                      Remove
                                    </button>
                                  )}
                                </div>

                                <input
                                  type="file"
                                  className="form-control shadow-sm"
                                  accept=".jpg,.jpeg,.png"
                                  onChange={(e) => handleImageChange(e, fieldName)}
                                  style={{ borderRadius: "8px" }}
                                />

                                {imageNames[fieldName] && (
                                  <div className="mt-2 small text-muted">
                                    <i className="bi bi-file-image me-1"></i>
                                    {imageNames[fieldName]}
                                  </div>
                                )}

                                {croppedImages[fieldName] ? (
                                  <div className="mt-3">
                                    <div
                                      className="border rounded"
                                      style={{
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                      }}
                                    >
                                      <Cropper
                                        src={croppedImages[fieldName]}
                                        style={{ height: 300, width: "100%" }}
                                        aspectRatio={1}
                                        guides={true}
                                        viewMode={1}
                                        background={false}
                                        responsive={true}
                                        autoCropArea={1}
                                        checkOrientation={false}
                                        ref={(ref) =>
                                          (cropperRefs.current[fieldName] = ref)
                                        }
                                      />
                                    </div>

                                    {/* Cropper Controls */}
                                    <div className="mt-3 d-flex gap-2 flex-wrap justify-content-center">
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleZoom(fieldName, 0.1)}
                                        title="Zoom In"
                                        style={{ borderRadius: "6px" }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          fill="currentColor"
                                          className="bi bi-zoom-in"
                                          viewBox="0 0 16 16"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0"
                                          />
                                          <path d="M10.344 11.742q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1 6.5 6.5 0 0 1-1.398 1.4z" />
                                          <path
                                            fillRule="evenodd"
                                            d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleZoom(fieldName, -0.1)}
                                        title="Zoom Out"
                                        style={{ borderRadius: "6px" }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          fill="currentColor"
                                          className="bi bi-zoom-out"
                                          viewBox="0 0 16 16"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0"
                                          />
                                          <path d="M10.344 11.742q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1 6.5 6.5 0 0 1-1.398 1.4z" />
                                          <path
                                            fillRule="evenodd"
                                            d="M3 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => handleRotate(fieldName, -90)}
                                        title="Rotate Left"
                                        style={{ borderRadius: "6px" }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          fill="currentColor"
                                          className="bi bi-arrow-counterclockwise"
                                          viewBox="0 0 16 16"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"
                                          />
                                          <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466" />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => handleRotate(fieldName, 90)}
                                        title="Rotate Right"
                                        style={{ borderRadius: "6px" }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          fill="currentColor"
                                          className="bi bi-arrow-clockwise"
                                          viewBox="0 0 16 16"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
                                          />
                                          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-warning"
                                        onClick={() => handleReset(fieldName)}
                                        title="Reset"
                                        style={{ borderRadius: "6px" }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          fill="currentColor"
                                          className="bi bi-arrow-repeat"
                                          viewBox="0 0 16 16"
                                        >
                                          <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9" />
                                          <path
                                            fillRule="evenodd"
                                            d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ) : productDetails[`product_img${index + 1}`] && (
                                  <div className="mt-3 text-center">
                                    <p className="text-muted small mb-2">Current Image</p>
                                    <img
                                      src={`${baseUrl}${productDetails[`product_img${index + 1}`]}`}
                                      alt={`Product Image ${index + 1}`}
                                      className="img-thumbnail"
                                      style={{ 
                                        maxHeight: "300px", 
                                        objectFit: "contain",
                                        borderRadius: "8px"
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {errorsFromBackend.commonError && (
                      <div
                        className="alert alert-danger d-flex align-items-center"
                        role="alert"
                        style={{ borderRadius: "8px" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="currentColor"
                          className="bi bi-exclamation-triangle-fill me-2"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                        </svg>
                        {errorsFromBackend.commonError}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-flex gap-3 mt-4">
                      <button
                        type="button"
                        className="btn btn-lg btn-secondary flex-fill shadow"
                        onClick={() => navigate("/ProductManage")}
                        style={{ borderRadius: "8px" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-lg btn-primary flex-fill shadow"
                        style={{ borderRadius: "8px" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="currentColor"
                          className="bi bi-check-circle me-2"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                          <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
                        </svg>
                        Update Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProductEdit;