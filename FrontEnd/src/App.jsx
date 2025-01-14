import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Index from './pages/User/Index/Index'
import Login from './pages/User/Login/Login'
import SignupPage from './pages/User/SignupPage/SignupPage'
import ForgetPassword from './pages/User/SignupPage/ForgetPassword'
import ResetPassword from './pages/User/SignupPage/ResetPassword'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "@fortawesome/fontawesome-free/css/all.min.css";
import HomePage from './pages/User/HomePage/HomePage'
import ProductDetails from './pages/User/productDetails/ProductDetails'
import AdminDashboard from './pages/Admin/AdminDashboard/AdminDashboard'
import UserManage from './pages/Admin/UserManage/UserManage'
import CategoryManage from './pages/Admin/CategoryManage/CategoryManage'
import ProductManage from './pages/Admin/ProductManage/ProductManage'
import ProductAdd from './pages/Admin/ProductManage/ProductAdd'
import ProductEdit from './pages/Admin/ProductManage/ProductEdit'
import CategoryAdd from './pages/Admin/CategoryManage/CategoryAdd'
import CategoryUpdate from './pages/Admin/CategoryManage/CategoryUpdate'
import ProductVarientManage from './pages/Admin/ProductVarientManage/ProductVarientManage'
import ProductVarientEdit from './pages/Admin/ProductVarientManage/ProductVarientEdit'
import ProductVarientAdd from './pages/Admin/ProductVarientManage/ProductVarientAdd'
import Review from './pages/User/Review/Review'
import UserProfile from './pages/User/UserProfile/UserProfile'
import { useEffect } from 'react'
import { setUserDetails } from './store/UserDetailsSlice'
import { useDispatch } from 'react-redux'
import CheckoutPage from './pages/User/CheckoutPage/CheckoutPage'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OrderManagement from './pages/Admin/OrderManagement/OrderManagement'
import axiosInstance from './axiosconfig'

const fetchUserDetails = async (dispatch) => {
  try {
      const response = await axiosInstance.get("/getUserDetailsForAuthentication", {
          withCredentials: true, // Ensure cookies are included in the request
      });
      dispatch(setUserDetails(response.data));
  } catch (error) {
      console.error("Error fetching user details:", error);
  }
};

function App() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    fetchUserDetails(dispatch);
  }, []);

  return (

    <BrowserRouter>
      <ToastContainer />
    <Routes>
      <Route path='/'  element={<Index/>}/>
      <Route path='/signup'  element={<SignupPage/>}/>
      <Route path='/forgetPassword'  element={<ForgetPassword/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/HomePage' element={<HomePage/>}/>
      <Route path='/productDetails' element={<ProductDetails/>}/>
      <Route path='/ResetPassword' element={<ResetPassword/>}/>
      <Route path='/AdminDashboard' element={<AdminDashboard/>}/>
      <Route path='/UserManage' element={<UserManage/>}/>
      <Route path='/CategoryManage' element={<CategoryManage/>}/>
      <Route path='/CategoryAdd' element={<CategoryAdd/>}/>
      <Route path='/CategoryUpdate' element={<CategoryUpdate/>}/>
      <Route path='/ProductManage' element={<ProductManage/>}/>
      <Route path='/ProductAdd' element={<ProductAdd/>}/>
      <Route path='/ProductEdit' element={<ProductEdit/>}/>
      <Route path='/ProductVarientManage' element={<ProductVarientManage/>}/>
      <Route path='/ProductVarientEdit' element={<ProductVarientEdit/>}/>
      <Route path='/ProductVarientAdd' element={<ProductVarientAdd/>}/>
      <Route path='/userReviews/:id' element={<Review/>}/>
      <Route path='/userProfile' element={<UserProfile/>}/>
      <Route path='/checkoutPage' element={<CheckoutPage/>}/>
      <Route path='/orderManagement' element={<OrderManagement/>}/>

      <Route></Route>
    </Routes>
    
    </BrowserRouter>
  )
}

export default App
