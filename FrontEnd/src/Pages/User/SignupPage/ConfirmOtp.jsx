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
  <Header />
  <div className="flex min-h-screen items-center justify-center bg-[#FCF4D2] px-4 sm:px-6">
    <div className="w-full max-w-md p-6 sm:p-8 bg-[#E8D7B4] shadow-lg rounded-xl">
      <h2 className="text-center text-[#073801] text-xl sm:text-2xl font-bold mb-4">
        Confirm OTP
      </h2>
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <input
            type="number"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#467927]"
            placeholder="Enter OTP"
            onChange={(event) => setOtp(event.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 text-white bg-[#467927] rounded-lg hover:bg-[#35661e] transition duration-300"
        >
          Confirm OTP
        </button>
      </form>
    </div>
  </div>
  <Footer />
</div>

  );
}

export default ConfirmOtp;
