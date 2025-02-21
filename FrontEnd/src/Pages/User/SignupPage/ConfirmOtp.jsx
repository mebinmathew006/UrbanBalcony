import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import publicaxiosconfig from "../../../Publicaxiosconfig";
import Header from "../../../Components/Header/Header";
import Footer from "../../../Components/Footer/Footer";
import { toast } from "react-toastify";

function ConfirmOtp() {
  const location = useLocation()
  const email =location.state?.email
  
  const [otp, setOtp] = useState();
  console.log(email);
  
  const navigate = useNavigate()

  const handleResetPassword = async (event) => {
    event.preventDefault()
    
      try {
        const response = await publicaxiosconfig.post("/confirmOtp", {
          otp,
          email
        });
        toast.success('Your Email Verified, You can Login now!',{position:'bottom-center'})
        navigate('/login')
      } catch (error) { 
        toast.error('Unable to Verify OTP!',{position:'bottom-center'})

        console.log(error);
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
        <h2 className="text-center text-[#073801] mb-4 fw-bold">Confirm OTP</h2>
        <form onSubmit={handleResetPassword}>
          <div className="mb-3">
            <input
              type="number"
              className="form-control input-custom"
              placeholder="Enter OTP"
              onChange={(event) => setOtp(event.target.value)}
            />
          </div>
          
          
          <button type="submit" className="rounded text-white w-100 bg-[#467927]">
            Confirm OTP
          </button>
        </form>
      </div>
    </div>
    <Footer/>

    </div>
  );
}

export default ConfirmOtp;
