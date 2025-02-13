import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import publicaxiosconfig from "../../../publicaxiosconfig";
import Header from "../../../components/header/header";
import Footer from "../../../components/footer/Footer";
import { toast } from "react-toastify";

function ResetPassword() {
  const location = useLocation()
  const email =location.state?.email
  
  const [otp, setOtp] = useState();
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [errorForPassword,setErrorForPassword]=useState("")
  const [backendErrors,setBackendErrors]=useState({
    wrongotp:''
  })
  const navigate = useNavigate()

  const handleResetPassword = async (event) => {
    event.preventDefault()
    if (password === confirmpassword) {
      try {
        const response = await publicaxiosconfig.post("/resetPassword", {
          otp,
          password,
          email
        });
        toast.success('Password Reset Successfull You can Login now!')
        navigate('/login')
      } catch (error) { 
        console.log(error);
      }
    } else {
      setErrorForPassword("Password and Confirm password should be same!");
    }
  };

  return (
    <div className="flex-1">
       <Header/>
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom bg-[#FCF4D2]">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" ,backgroundColor: '#E8D7B4'
        }}
      >
        <h2 className="text-center text-[#073801] mb-4 fw-bold">Reset Password</h2>
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
          {errorForPassword && <p className="text-red-400">{errorForPassword} </p>}
          <button type="submit" className="rounded text-white w-100 bg-[#467927]">
            Reset Password
          </button>
        </form>
      </div>
    </div>
    <Footer/>

    </div>
  );
}

export default ResetPassword;
