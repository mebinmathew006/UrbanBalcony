import React, { useEffect, useState } from "react";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Sidebar from "../../../Components/Admin/Sidebar/Sidebar";

function CouponEdit() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors: validationErrors },
  } = useForm();

  const [errorsFromBackend, setErrorsFromBackend] = useState({
    commonError: "",
  });

  const location = useLocation();
  const couponDetails = location.state;

  const navigate = useNavigate();

  useEffect(() => {
    // Prepopulate form fields with coupon details
    Object.keys(couponDetails).forEach((key) => {
      setValue(key, couponDetails[key]);
    });
  }, []);

  const updateCoupon = async (data) => {
    try {
        console.log(data);
        
      await adminaxiosInstance.post(`/couponManage`, data);
      navigate("/CouponManage");
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data.error) {
        setErrorsFromBackend({ commonError: error.response.data.error });
      }
    }
  };

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar />
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Edit Coupon</h2>
        <form onSubmit={handleSubmit(updateCoupon)}>
          <div className="mb-3">
            <input
              {...register("code", { required: "Coupon code is required" })}
              type="text"
              className="form-control input-custom"
              placeholder="Enter coupon code"
            />
            {validationErrors.code && (
              <p className="text-danger">{validationErrors.code.message}</p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("coupon_percent", {
                required: "Coupon percentage is required",
                min: { value: 1, message: "Minimum value is 1" },
                max: { value: 100, message: "Maximum value is 100" },
              })}
              type="number"
              className="form-control input-custom"
              placeholder="Enter coupon percentage"
            />
            {validationErrors.coupon_percent && (
              <p className="text-danger">{validationErrors.coupon_percent.message}</p>
            )}
          </div>
          {/* <div className="mb-3">
            <input
              {...register("expire_date", { required: "Expire date is required" })}
              type="date"
              className="form-control input-custom"
            />
            {validationErrors.expire_date && (
              <p className="text-danger">{validationErrors.expire_date.message}</p>
            )}
          </div> */}
          {errorsFromBackend.commonError && (
            <p className="text-danger">{errorsFromBackend.commonError}</p>
          )}
          
          <div className="d-flex">
              <button type="submit" className="btn btn-primary w-100 m-2">
              Update
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

export default CouponEdit;
