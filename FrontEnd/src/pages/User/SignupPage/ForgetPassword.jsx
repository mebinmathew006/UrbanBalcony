import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import publicaxiosconfig from '../../../publicaxiosconfig'

function ForgetPassword() {
  const [email,setEmail]=useState('')
  const navigate =useNavigate()

  const ForgetPasswordHandler=async (event)=>{
    event.preventDefault()
    try {
      console.log(email);
      const response= await publicaxiosconfig.post('/forgetPassword',{email})
      navigate('/ResetPassword',{state:{email}}) 
    } catch (error) {
      console.log(error);
      
    }
         
  }

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom">
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Forget Password</h2>
        <form onSubmit={ForgetPasswordHandler}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control input-custom"
              placeholder="Enter your email"
              value={email}
              onChange={(event)=>setEmail(event.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Send OTP
          </button>
        </form>
        
      </div>
    </div>
  )
}

export default ForgetPassword
