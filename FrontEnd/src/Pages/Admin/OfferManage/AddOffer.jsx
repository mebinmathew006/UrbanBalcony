import React, { useEffect, useState } from "react";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Sidebar from "../../../Components/Admin/Sidebar/Sidebar";

function AddOffer() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [errorsFromBackend, setErrorsFromBackend] = useState({
    commonError: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors: validationErrors },
  } = useForm();

  // Fetch products for the dropdown
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await adminaxiosInstance.get("/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }

    fetchProducts();
  }, []);

  const addOffer = async (data) => {
    console.log(data);
    try {
      await adminaxiosInstance.post("/offerManage", data);
      navigate("/OfferManage");
    } catch (error) {
      console.error(error);
      setErrorsFromBackend({
        commonError: error.response?.data?.error || "An error occurred",
      });
    }
  };

  return (
    <div className="d-flex vh-100 bg-light">
      <div className="h-100">
        <Sidebar />
      </div>
      <div className="container-fluid d-flex justify-content-center align-items-center flex-grow-1">
        <div
          className="card p-4 shadow"
          style={{ width: "400px", borderRadius: "12px" }}
        >
          <h2 className="text-center mb-4 fw-bold">Add Offer</h2>
          <form onSubmit={handleSubmit(addOffer)}>
            <div className="mb-3">
              <select
                {...register("product", {
                  required: "Product is required",
                })}
                className="form-control input-custom"
              >
                <option value="">Select a product</option>
                {products && products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title}
                  </option>
                ))}
              </select>
              {validationErrors.product && (
                <p className="text-danger">{validationErrors.product.message}</p>
              )}
            </div>
            <div className="mb-3">
              <input
                {...register("discount_percentage", {
                  required: "Discount percentage is required",
                  valueAsNumber: true,
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
            {errorsFromBackend.commonError && (
              <p className="text-danger">{errorsFromBackend.commonError}</p>
            )}
             <div className="d-flex">
              <button type="submit" className="btn btn-primary w-100 m-2">
              Add
            </button>
            <button type="button" onClick={()=>navigate(-1)} className="btn btn-primary w-100 m-2">
              Cancel
            </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddOffer;