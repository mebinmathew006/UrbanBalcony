import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosconfig";

function SignupPage() {
  const navigate = useNavigate();
  const [firstname, setFirstname] = useState();
  const [lastname, setLastname] = useState();
  const [phonenumber, setPhonenumber] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmpassword, setConfirmpassword] = useState();

  const sigupHandle = async(event) => {
    event.preventDefault();
    console.log(password,  confirmpassword);
    
    if (password!=confirmpassword){
      alert("Password and Confirm password should be same");
    }
    else{
      try{
        const response = await axiosInstance.post('/userSignup',{firstname,lastname,phonenumber,email,password})
        navigate('/login')

      }catch(error){
        console.log(error);
        
      }
    }
  };
  return (
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom ">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Sign up</h2>
        <form onSubmit={sigupHandle}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control input-custom"
              placeholder="Enter your firstname"
              required
              onChange={(event)=>setFirstname(event.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control input-custom"
              placeholder="Enter your lastname"
              required
              onChange={(event)=>setLastname(event.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="number"
              className="form-control input-custom"
              placeholder="Enter your Phonenumber"
              required
              onChange={(event)=>setPhonenumber(event.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="email"
              className="form-control input-custom"
              placeholder="Enter your email"
              required
              onChange={(event)=>setEmail(event.target.value)}

            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control input-custom"
              placeholder="Enter your password"
              required
              onChange={(event)=>setPassword(event.target.value)}

            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control input-custom"
              placeholder="Confirm your password"
              required
              onChange={(event)=>setConfirmpassword(event.target.value)}

            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
