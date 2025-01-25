import React, { useEffect, useState } from "react";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

function EditOffer() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors: validationErrors },
  } = useForm();

  const [errorsFromBackend, setErrorsFromBackend] = useState({
    commonError: "",
  });
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const offerDetails = location.state;

  const navigate = useNavigate();

  useEffect(() => {
    // Prepopulate form fields with offer details
    Object.keys(offerDetails).forEach((key) => {
      setValue(key, offerDetails[key]);
    });
    async function fetchProducts() {
      try {
        const response = await adminaxiosInstance.get("/productmanage");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, []);

  const updateOffer = async (data) => {
    try {
      console.log(data);

      await adminaxiosInstance.post(`/offerManage`, data);
      navigate("/OfferManage");
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data.error) {
        setErrorsFromBackend({ commonError: error.response.data.error });
      }
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Edit Offer</h2>
        <form onSubmit={handleSubmit(updateOffer)}>
        <div className="mb-3">
            <select
              {...register("product", {
                required: "Product is required",
              })}
              className="form-control input-custom"
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))}
            </select>
            {validationErrors.product_id && (
              <p className="text-danger">{validationErrors.product_id.message}</p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("discount_percentage", {
                required: "Discount percentage is required",
                min: { value: 1, message: "Minimum value is 1" },
                max: { value: 100, message: "Maximum value is 100" },
              })}
              type="number"
              className="form-control input-custom"
              placeholder="Enter discount percentage"
            />
            {validationErrors.discount_percentage && (
              <p className="text-danger">
                {validationErrors.discount_percentage.message}
              </p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("expire_date", { required: "Expire date is required" })}
              type="date"
              className="form-control input-custom"
            />
            {validationErrors.expire_date && (
              <p className="text-danger">{validationErrors.expire_date.message}</p>
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

export default EditOffer;
