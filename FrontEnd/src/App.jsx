import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Index from './pages/Index/Index'
import Login from './pages/Login/Login'
import SignupPage from './pages/SignupPage/SignupPage'
import ForgetPassword from './pages/SignupPage/ForgetPassword'
import ResetPassword from './pages/SignupPage/ResetPassword'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "@fortawesome/fontawesome-free/css/all.min.css";
import HomePage from './pages/HomePage/HomePage'
import ProductDetails from './pages/productDetails/ProductDetails'
function App() {

  return (

    <BrowserRouter>

    <Routes>
      <Route path='/'  element={<Index/>}/>
      <Route path='/signup'  element={<SignupPage/>}/>
      <Route path='/forgetPassword'  element={<ForgetPassword/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/HomePage' element={<HomePage/>}/>
      <Route path='/productDetails' element={<ProductDetails/>}/>
      <Route path='/ResetPassword' element={<ResetPassword/>}/>
      <Route></Route>
    </Routes>
    
    </BrowserRouter>
  )
}

export default App
