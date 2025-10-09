import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import publicaxiosconfig from "../../../Publicaxiosconfig";
import Header from "../../../Components/Header/Header";
import Footer from "../../../Components/Footer/Footer";
import { toast } from "react-toastify";

function ConfirmOtp() {
  const location = useLocation();
  const email = location.state?.email;
  
  const [otp, setOtp] = useState();
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  console.log(email);
  
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    
    return () => clearInterval(interval);
  }, [timer]);

  const handleResetPassword = async (event) => {
    event.preventDefault();
    
    try {
      const response = await publicaxiosconfig.post("/confirmOtp", {
        otp,
        email
      });
      toast.success('Your Email Verified, You can Login now!', {position: 'bottom-center'});
      navigate('/login');
    } catch (error) { 
      toast.error('Unable to Verify OTP!', {position: 'bottom-center'});
      console.log(error);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error('Email not found. Please try again.', {position: 'bottom-center'});
      return;
    }

    setIsResending(true);
    
    try {
      const response = await publicaxiosconfig.post("/otp", {
        email
      });
      toast.success('OTP has been resent to your email!', {position: 'bottom-center'});
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      toast.error('Failed to resend OTP. Please try again.', {position: 'bottom-center'});
      console.log(error);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1">
      <Header />
      <div className="flex min-h-screen items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md p-6 sm:p-8 shadow-lg rounded-xl">
          <h2 className="text-center text-[#073801] text-xl sm:text-2xl font-bold mb-4">
            Confirm OTP
          </h2>
          <p>
            OTP is send to your email : {email}
          </p>
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
              Confirm 
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            {!canResend ? (
              <p className="text-sm text-gray-500">
                Resend OTP in <span className="font-semibold text-[#467927]">{formatTime(timer)}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-[#467927] font-semibold hover:text-[#35661e] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Resending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ConfirmOtp;