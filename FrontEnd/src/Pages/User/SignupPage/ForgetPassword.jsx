import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import publicaxiosconfig from '../../../Publicaxiosconfig'
import Header from '../../../Components/Header/Header'
import Footer from '../../../Components/Footer/Footer'

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
    <div className="flex-1 ">
       <Header/>
    <div className="container-fluid d-flex justify-content-center align-items-center bg-light-custom pt-24 pb-24 w-screen">
      <div
        className="card p-32 shadow"
        style={{ width: "400px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-5 fw-bold">Forget Password</h2>
        <form onSubmit={ForgetPasswordHandler}>
          <div className="mb-4">
            <input
              type="email"
              className="form-control input-custom"
              placeholder="Enter your email"
              value={email}
              onChange={(event)=>setEmail(event.target.value)}
            />
          </div>
          <button type="submit" className="bg-[#467927] rounded text-white w-100 mb-5">
            Send OTP
          </button>
        </form>
        
      </div>
    </div>
    <Footer/>
    </div>
  )
}

export default ForgetPassword
