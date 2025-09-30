import React, { useEffect, useRef, useState } from "react";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useLocation, useNavigate } from "react-router-dom";
import Cropper from "react-cropper";
import { useForm } from "react-hook-form";
import "cropperjs/dist/cropper.css";
import Sidebar from "../../../Components/Admin/Sidebar/Sidebar";

function ProductEdit() {
  const cropperRefs = useRef({});
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [croppedImages, setCroppedImages] = useState({});
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors: validationErrors },
  } = useForm();

  const [categories, setCategories] = useState([]);
  const [errorsFromBackend, setErrorsFromBackend] = useState({
    commonError: "",
  });

  const location = useLocation();
  const productDetails = location.state;

  const navigate = useNavigate();

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
      setCategories(response.data);
    } catch (error) {
      setErrorsFromBackend({ commonError: "Failed to fetch categories" });
    }
  }

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
    
    try {
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
      <div className="d-flex flex-column flex-grow-1">
        <main className="bg-light">
          <div className="container py-4">
            <div className="d-flex justify-content-center align-items-center">
              <div
                className="card p-4 shadow"
                style={{ width: "500px", borderRadius: "12px" }}
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
                      <option value={productDetails.category?.id || ""}>
                        {productDetails.category?.name || "Select category"}
                      </option>
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

                  <label className="form-label fw-bold">Product Images</label>
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
                        {croppedImages[fieldName] ? (
                          <div className="mt-2">
                            <Cropper
                              src={croppedImages[fieldName]}
                              style={{ height: 200, width: "100%" }}
                              aspectRatio={1}
                              guides={true}
                              ref={(ref) => (cropperRefs.current[fieldName] = ref)}
                            />
                          </div>
                        ) : (
                          <div className="mt-2">
                            <img
                              src={`${baseUrl}/${productDetails[`product_img${index + 1}`]}`}
                              alt={`Product Image ${index + 1}`}
                              className="img-thumbnail"
                              style={{ maxHeight: "200px", objectFit: "contain" }}
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
                      Update
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

export default ProductEdit;