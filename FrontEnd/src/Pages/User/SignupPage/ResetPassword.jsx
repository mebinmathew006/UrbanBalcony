import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import publicaxiosconfig from "../../../Publicaxiosconfig";
import Header from "../../../Components/Header/Header";
import Footer from "../../../Components/Footer/Footer";
import { toast } from "react-toastify";

function ResetPassword() {
  const location = useLocation();
  const email = location.state?.email;
  
  const [otp, setOtp] = useState();
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [errorForPassword, setErrorForPassword] = useState("");
  const [backendErrors, setBackendErrors] = useState({
    wrongotp: ''
  });
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
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
    if (password === confirmpassword) {
      try {
        const response = await publicaxiosconfig.post("/resetPassword", {
          otp,
          password,
          email
        });
        toast.success('Password Reset Successfull You can Login now!', {position: 'bottom-center'});
        navigate('/login');
      } catch (error) { 
        toast.error(`Unable to Reset Password! ${error.response.data.errors.password}`, {position: 'bottom-center'});
        console.log(error);
      }
    } else {
      setErrorForPassword("Password and Confirm password should be same!");
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
      <Header/>
      <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom p-24">
        <div className="card p-4 shadow">
          <h2 className="text-center text-[#073801] mb-4 ms-24 fw-bold">Reset Password</h2>
          <p>OTP is send to your email : {email}</p>
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
            {errorForPassword && <p className="text-red-400">{errorForPassword}</p>}
            <button type="submit" className="rounded text-white w-100 bg-[#467927]">
              Reset Password
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
                className="text-[#467927] font-semibold hover:text-[#35661e] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-0 bg-transparent"
              >
                {isResending ? 'Resending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default ResetPassword;