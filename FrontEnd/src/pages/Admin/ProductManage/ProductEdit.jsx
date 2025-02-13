import React, { useEffect, useRef, useState } from "react";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useLocation, useNavigate } from "react-router-dom";
import Cropper from "react-cropper";
import { useForm } from "react-hook-form";
import "cropperjs/dist/cropper.css";

function ProductEdit() {
  const cropperRefs = useRef({});
  const baseUrl = import.meta.env.VITE_BASE_URL;
  console.log(baseUrl);
  
  const [croppedImages, setCroppedImages] = useState({});
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors: validationErrors },
  } = useForm();

  const [categories, setCategories] = useState([]);
  const [fileError, setFileError] = useState("");
  const [errorsFromBackend, setErrorsFromBackend] = useState({
    commonError: "",
  });

  const location = useLocation();
  const productDetails = location.state;

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategory();
    // Prepopulate form fields with product details
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
      setCategories(response.data);
    } catch (error) {
      setErrorsFromBackend({ commonError: "Failed to fetch categories" });
    }
  }

  const validateFile = (file) => {
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setFileError("Only JPG, JPEG, and PNG files are allowed");
        return false;
      }
    }
    setFileError("");
    return true;
  };

  const handleImageChange = (event, fieldName) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCroppedImages((prev) => ({
          ...prev,
          [fieldName]: reader.result, // Store the preview for Cropper
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
            resolve(blob); // Return the Blob
          },
          "image/jpeg", // Set image type
          0.9 // Set image quality
        );
      });
    }
    return null;
  };

  const updateProduct = async (data) => {
    const formData = new FormData();
    formData.append("id", productDetails.id);
    data.title && formData.append("title", data.title);
    data.category && formData.append("category_id", data.category);
    data.available_quantity &&
      formData.append("available_quantity", data.available_quantity);
    data.description && formData.append("description", data.description);
    data.ingredients && formData.append("ingredients", data.ingredients);
    data.shelf_life && formData.append("shelf_life", data.shelf_life);
    data.price && formData.append("price", data.price);

    for (const fieldName of ["product_img1", "product_img2", "product_img3"]) {
      const croppedImageBlob = await getCroppedImage(fieldName);
      if (croppedImageBlob) {
        formData.append(fieldName, croppedImageBlob, `${fieldName}.jpg`);
      }
    }
    console.log(data.category);
    try {
      await adminaxiosInstance.post("/admineditProduct", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/ProductManage");
    } catch (error) {
      console.log(error);

      setErrorsFromBackend(error.response.data.error);
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
              {...register("title", { required: "Title is required" })}
              type="text"
              className="form-control input-custom"
              placeholder="Enter product title"
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
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {validationErrors.category && (
              <p className="text-danger">{validationErrors.category.message}</p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("available_quantity", {
                required: "Quantity is required",
              })}
              type="number"
              className="form-control input-custom"
              placeholder="Available quantity"
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
              placeholder="Enter description"
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
              placeholder="Shelf life"
            />
            {validationErrors.shelf_life && (
              <p className="text-danger">
                {validationErrors.shelf_life.message}
              </p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("price", { required: "Price is required" })}
              type="number"
              className="form-control input-custom"
              placeholder="Price"
            />
            {validationErrors.price && (
              <p className="text-danger">{validationErrors.price.message}</p>
            )}
          </div>

          {["product_img1", "product_img2", "product_img3"].map(
            (fieldName, index) => (
              <div key={index} className="mb-3">
                <input
                  type="file"
                  className="form-control input-custom"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleImageChange(e, fieldName)}
                />
                {croppedImages[fieldName] && (
                  <Cropper
                    src={croppedImages[fieldName]}
                    style={{ height: 200, width: "100%" }}
                    aspectRatio={1} // Set aspect ratio
                    guides={true}
                    ref={(ref) => (cropperRefs.current[fieldName] = ref)}
                  />
                )}
                {/* existing image */}
                <img src={`${baseUrl}/${productDetails[`product_img${index + 1}`]}`} alt="Product Image" />


              </div>
            )
          )}

          {fileError && <p className="text-danger">{fileError}</p>}
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

export default ProductEdit;
