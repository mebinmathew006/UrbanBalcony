import React, { useState } from "react";
import "./Login.css";
import axiosInstance from "../../axiosconfig";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const updateEmail = async (event) => {
    setEmail(event.target.value);
  };

  const updatePassword = async (event) => {
    setPassword(event.target.value);
  };
  const navigatetoSignup = (event) => {
    navigate("/signup");
  };

  const loginSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosInstance.post("/userLogin", {
        email,
        password,
      });
      navigate("/HomePage");
    } catch (error) {
      alert(error);
    }
  };
  return (
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Sign In</h2>

        <form onSubmit={loginSubmitHandler}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control input-custom"
              placeholder="Enter your email"
              onChange={updateEmail}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control input-custom"
              placeholder="Enter your password"
              onChange={updatePassword}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Sign in
          </button>
        </form>

        <div className="text-center mt-3">
          <Link to='/ForgetPassword' className="text-decoration-none text-warning fw-bold">
            Forgot Password?
          </Link>
        </div>
        <div className="text-center mt-2 cursor-pointer">
          <p className="mb-0">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className=" text-decoration-none text-warning fw-bold"
            >
              Sign up
            </Link>
          </p>
        </div>
        <div className="text-center mt-4">
          <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center google-btn">
            <i className="fa-brands fa-google me-3"></i>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
