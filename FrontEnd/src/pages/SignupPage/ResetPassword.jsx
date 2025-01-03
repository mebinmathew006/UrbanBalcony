import React, { useState } from "react";
import axiosInstance from "../../axiosconfig";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [otp, setOtp] = useState();
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const navigate = useNavigate()

  const handleResetPassword = async (event) => {
    event.preventDefault()
    if (password === confirmpassword) {
      try {
        const response = await axiosInstance.post("/resetPassword", {
          otp,
          password,
        });
        navigate('/login')
      } catch (error) { 
        console.log(error);
      }
    } else {
      alert("Password and Confirm password should be same");
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Forget Password</h2>
        <form onSubmit={handleResetPassword}>
          <div className="mb-3">
            <input
              type="number"
              className="form-control input-custom"
              placeholder="Enter OTP"
              onChange={(event) => setOtp(event.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control input-custom"
              placeholder="Enter password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control input-custom"
              placeholder="Confirm password"
              onChange={(event) => setConfirmpassword(event.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
