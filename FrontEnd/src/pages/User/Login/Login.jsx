import React, { useState, useEffect } from "react";
import "./Login.css";
import axiosInstance from "../../../axiosconfig";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

function Login() {
  const clientId = "489008736122-if0fclbj37c8m0p04ksq1p71crng8g2k.apps.googleusercontent.com";
  const navigate = useNavigate();
  const [errorsFromBackend, setErrorsFromBackend] = useState({
    email: [],
    password: [],
    commonError: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors: validationErrors },
  } = useForm();

  useEffect(() => {
    // Load the Google Identity Services script
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse
        });

        // Render the button
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      };
    };

    loadGoogleScript();

    // Cleanup
    return () => {
      // Remove the script tag when component unmounts
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const backendResponse = await axiosInstance.post('/google_login', {
        credential: response.credential // Send the credential token to your backend
      });
      console.log('Backend Response:', backendResponse.data);
      // Handle successful login (e.g., save token, redirect)
      if (backendResponse.data.user.is_admin) {
        navigate("/AdminDashboard");
      } else {
        navigate("/HomePage");
      }
    } catch (error) {
      console.error('Error authenticating with backend:', error);
      setErrorsFromBackend({
        ...errorsFromBackend,
        commonError: "Google authentication failed. Please try again."
      });
    }
  };

  const loginSubmitHandler = async (data) => {
    try {
      const response = await axiosInstance.post("/userLogin", data);
      if (response.data.user.is_admin) {
        navigate("/AdminDashboard");
      } else {
        navigate("/HomePage");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorsFromBackend(error.response.data.error);
      } else {
        setErrorsFromBackend({
          email: [],
          password: [],
          commonError: "Something went wrong. Please try again later.",
        });
      }
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Sign In</h2>

        <form onSubmit={handleSubmit(loginSubmitHandler)}>
          {/* Email Input */}
          <div className="mb-3">
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              type="email"
              className="form-control input-custom"
              placeholder="Enter your email"
            />
            {validationErrors.email && (
              <p className="text-danger">{validationErrors.email.message}</p>
            )}
            {errorsFromBackend.email && (
              <p className="text-danger">{errorsFromBackend.email[0]}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-3">
            <input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              type="password"
              className="form-control input-custom"
              placeholder="Enter your password"
            />
            {validationErrors.password && (
              <p className="text-danger">{validationErrors.password.message}</p>
            )}
            {errorsFromBackend.password && (
              <p className="text-danger">{errorsFromBackend.password[0]}</p>
            )}
          </div>

          {/* Common Backend Error */}
          {errorsFromBackend.commonError && (
            <p className="text-danger">{errorsFromBackend.commonError}</p>
          )}

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-100">
            Sign in
          </button>
        </form>

        {/* Forgot Password */}
        <div className="text-center mt-3">
          <Link
            to="/ForgetPassword"
            className="text-decoration-none text-warning fw-bold"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-2">
          <p className="mb-0">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-decoration-none text-warning fw-bold"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Google Sign-In Button */}
        <div className="text-center mt-4">
          <div id="googleSignInDiv"></div>
        </div>
      </div>
    </div>
  );
}

export default Login;