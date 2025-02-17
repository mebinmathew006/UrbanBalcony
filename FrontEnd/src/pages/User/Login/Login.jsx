import React, { useState, useEffect } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {setUserDetails} from '../../../store/UserDetailsSlice'
import publicaxiosconfig from "../../../publicaxiosconfig";
import { toast } from "react-toastify";
import Header from "../../../components/header";
import Footer from "../../../components/footer/Footer";


function Login() {
  const isAuthenticated = useSelector((state) => state.userDetails);
  
  const dispatch = useDispatch();
  
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
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
      const backendResponse = await publicaxiosconfig.post('/google_login', {
        credential: response.credential // Send the credential token to your backend
      });
      
      const userDetailsGoogle=backendResponse.data.user
      dispatch(setUserDetails(userDetailsGoogle));
      toast.success("Login Successful.", {
        position: "bottom-center",
      });
      // Handle successful login (e.g., save token, redirect)
      if (backendResponse.data.user.is_admin) {
        navigate("/salesReport");
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
      const response = await publicaxiosconfig.post("/userLogin", data);

      // setting the user details in redux store
      const userDetails = response.data.user;
    
      
      dispatch(setUserDetails(userDetails));
      // localStorage.setItem('userDetails',JSON.stringify(userDetails));
      toast.success("Login Successful.", {
        position: "bottom-center",
      });
      if (response.data.user.is_admin) {
                      
        navigate("/salesReport");
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
    <div className="flex-1">
       <Header/>
  
    <div className="container-fluid d-flex justify-content-center align-items-center bg-[#FCF4D2] h-[70vh]">
   
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" ,backgroundColor: '#E8D7B4'
 }}
      >
        <h2 className="text-center mb-4 fw-bold text-[#073801]">Sign In</h2>

        <form onSubmit={handleSubmit(loginSubmitHandler)} >
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
          <button type="submit" className="rounded bg-[#467927] text-white w-100">
            Sign in
          </button>
        </form>

        {/* Forgot Password */}
        <div className="text-center mt-3">
          <Link
            to="/ForgetPassword"
            className="text-[#BF923F] fw-bold"
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
              className="text-decoration-none text-[#BF923F] fw-bold"
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
    <Footer/>
    </div>
  );
}

export default Login;