import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from 'react-toastify';
import publicaxiosconfig from "../../../Publicaxiosconfig";
import Footer from "../../../Components/Footer/Footer";
import Header from "../../../Components/Header/Header";

function SignupPage() {
  
  // useEffect(()=>{},[])

  const navigate = useNavigate();
  const [errorsFromBackend, setErrorsFromBackend] = useState({
    email: [],
    password: [],
    commonError: "",
  });
  const [fileError, setFileError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors: validationErrors },
  } = useForm();

  const handleFileValidation = (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Only JPG, JPEG, and PNG files are allowed");
      return false;
    }
    setFileError("");
    return true;
  };

  const signupHandle = async (data) => {
    if (data.password !== data.confirmpassword) {
      setErrorsFromBackend({
        ...errorsFromBackend,
        commonError: "Password and Confirm Password must be the same.",
      });
      return;
    }

    if (!data.profilepicture[0] || !handleFileValidation(data.profilepicture[0])) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("first_name", data.firstname);
      formData.append("last_name", data.lastname);
      formData.append("phone_number", data.phonenumber);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("profile_picture", data.profilepicture[0]); // Attach file

      await publicaxiosconfig.post("/userSignup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success('Signup successful! Please check your email.');
      navigate("/login");
    } catch (error) {
      console.log(error);
      setErrorsFromBackend(error.response.data.error);
      
    }
  };

  return (
    <div className="flex-1">
       <Header/>
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Sign Up</h2>
        <form onSubmit={handleSubmit(signupHandle)}>
          <div className="mb-3">
            <input
              {...register("firstname", { required: "First Name is required" })}
              type="text"
              className="form-control input-custom"
              placeholder="Enter your first name"
            />
            {validationErrors.firstname && (
              <p className="text-danger">{validationErrors.firstname.message}</p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("lastname", { required: "Last Name is required" })}
              type="text"
              className="form-control input-custom"
              placeholder="Enter your last name"
            />
            {validationErrors.lastname && (
              <p className="text-danger">{validationErrors.lastname.message}</p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("phonenumber", {
                required: "Phone Number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit phone number",
                },
              })}
              type="number"
              className="form-control input-custom"
              placeholder="Enter your phone number"
            />
            {validationErrors.phonenumber && (
              <p className="text-danger">{validationErrors.phonenumber.message}</p>
            )}
          </div>
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
          </div>
          <div className="mb-3">
            <input
              {...register("confirmpassword", {
                required: "Confirm Password is required",
              })}
              type="password"
              className="form-control input-custom"
              placeholder="Confirm your password"
            />
            {validationErrors.confirmpassword && (
              <p className="text-danger">
                {validationErrors.confirmpassword.message}
              </p>
            )}
          </div>
          <div className="mb-3">
            <input
              {...register("profilepicture", {
                required: "Profile Picture is required",
                validate: {
                  validFile: (value) =>
                    value.length === 0 || handleFileValidation(value[0]),
                },
              })}
              type="file"
              className="form-control input-custom"
              accept=".jpg,.jpeg,.png"
            />
            {validationErrors.profilepicture && (
              <p className="text-danger">{validationErrors.profilepicture.message}</p>
            )}
            {fileError && <p className="text-danger">{fileError}</p>}
          </div>
          {errorsFromBackend.commonError && (
            <p className="text-danger">{errorsFromBackend.commonError}</p>
          )}
          <button type="submit" className="btn btn-primary w-100">
            Sign Up
          </button>
        </form>
      </div>
    </div>
    <Footer/>
    </div>
  );
}

export default SignupPage;
