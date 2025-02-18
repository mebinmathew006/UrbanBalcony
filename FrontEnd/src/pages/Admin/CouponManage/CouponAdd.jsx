import React, { useState } from "react";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

function CouponAdd() {
  const navigate = useNavigate();
  const [errorsFromBackend, setErrorsFromBackend] = useState({
    commonError: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors: validationErrors },
  } = useForm();

  const addCoupon = async (data) => {
    try {
      await adminaxiosInstance.post("/couponManage", data);
      navigate("/CouponManage");
    } catch (error) {
      console.log(error);
      setErrorsFromBackend({
        commonError: error.response?.data?.error || "An error occurred",
      });
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Add Coupon</h2>
        <form onSubmit={handleSubmit(addCoupon)}>
          <div className="mb-3">
            <input
              {...register("code", { required: "Coupon code is required" })}
              type="text"
              className="form-control input-custom"
              placeholder="Enter the coupon code"
            />
            {validationErrors.code && (
              <p className="text-danger">{validationErrors.code.message}</p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("coupon_percent", {
                required: "Coupon percentage is required",
                valueAsNumber: true,
                min: { value: 1, message: "Minimum value is 1" },
                max: { value: 100, message: "Maximum value is 100" },
              })}
              type="number"
              className="form-control input-custom"
              placeholder="Enter the coupon percentage"
            />
            {validationErrors.coupon_percent && (
              <p className="text-danger">{validationErrors.coupon_percent.message}</p>
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
            ADD
          </button>
        </form>
      </div>
    </div>
  );
}

export default CouponAdd;
