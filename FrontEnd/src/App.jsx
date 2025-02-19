import './App.css'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import IndexPage from '../src/Pages/User/IndexPage/IndexPage'
import Login from './Pages/User/Login/Login'
import SignupPage from './Pages/User/SignupPage/SignupPage'
import ForgetPassword from './Pages/User/SignupPage/ForgetPassword'
import ResetPassword from './Pages/User/SignupPage/ResetPassword'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "@fortawesome/fontawesome-free/css/all.min.css";
import HomePage from './Pages/User/HomePage/HomePage'
import ProductDetails from './Pages/User/ProductDetails/ProductDetails'
import UserManage from './Pages/Admin/UserManage/UserManage'
import CategoryManage from './Pages/Admin/CategoryManage/CategoryManage'
import ProductManage from './Pages/Admin/ProductManage/ProductManage'
import ProductAdd from './Pages/Admin/ProductManage/ProductAdd'
import ProductEdit from './Pages/Admin/ProductManage/ProductEdit'
import CategoryAdd from './Pages/Admin/CategoryManage/CategoryAdd'
import CategoryUpdate from './Pages/Admin/CategoryManage/CategoryUpdate'
import ProductVarientManage from './Pages/Admin/ProductVarientManage/ProductVarientManage'
import ProductVarientEdit from './Pages/Admin/ProductVarientManage/ProductVarientEdit'
import ProductVarientAdd from './Pages/Admin/ProductVarientManage/ProductVarientAdd'
import Review from './Pages/User/Review/Review'
import UserProfile from './Pages/User/UserProfile/UserProfile'
import { useEffect } from 'react'
import { setUserDetails } from './store/UserDetailsSlice'
import { useDispatch } from 'react-redux'
import CheckoutPage from './Pages/User/CheckoutPage/CheckoutPage'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OrderManagement from './Pages/Admin/OrderManagement/OrderManagement'
import UserSingleOrderDetailsPage from './Pages/User/UserProfile/UserSingleOrderDetailsPage'
import ReturnedProducts from './Pages/Admin/OrderManagement/ReturnedProducts'
import CouponManage from './Pages/Admin/CouponManage/CouponManage'
import CouponAdd from './Pages/Admin/CouponManage/CouponAdd'
import CouponEdit from './Pages/Admin/CouponManage/CouponEdit'
import OfferManage from './Pages/Admin/OfferManage/OfferManage'
import AddOffer from './Pages/Admin/OfferManage/AddOffer'
import EditOffer from './Pages/Admin/OfferManage/EditOffer'
import SalesReport from './Pages/Admin/SalesReport/SalesReport'
import UserWallet from './Pages/User/UserProfile/UserWallet'
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import history from './History'
import publicaxiosconfig from './Publicaxiosconfig'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UserChat from './Pages/User/UserProfile/UserChat'
import AdminChat from './Pages/Admin/AdminChat/AdminChat'
import BannerManagement from './Pages/Admin/BannerManagement/BannerManagement'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})




// Separate component for the routes
function AppRoutes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // fetchUserDetails(dispatch, navigate);
  }, [dispatch]);

  return (
    <QueryClientProvider client={queryClient}>
    <Routes>
      <Route path='/'  element={<PublicRoute><IndexPage/></PublicRoute>}/>
      <Route path='/signup'  element={<SignupPage/>}/>
      <Route path='/forgetPassword'  element={<ForgetPassword/>}/>
      <Route path='/login' element={<PublicRoute><Login/></PublicRoute>}/>
      <Route path='/HomePage' element={ <ProtectedRoute><HomePage/></ProtectedRoute>}/>
      <Route path='/productDetails' element={<ProductDetails/>}/>
      <Route path='/ResetPassword' element={<ResetPassword/>}/>
      {/* <Route path='/AdminDashboard' element={<AdminDashboard/>}/> */}
      <Route path='/UserManage' element={<UserManage/>}/> 
      <Route path='/CategoryManage' element={<CategoryManage/>}/>
      <Route path='/CategoryAdd' element={<CategoryAdd/>}/>
      <Route path='/CategoryUpdate' element={<CategoryUpdate/>}/>
      <Route path='/ProductManage' element={<ProtectedRoute><ProductManage/></ProtectedRoute>}/>
      <Route path='/ProductAdd' element={<ProductAdd/>}/>
      <Route path='/ProductEdit' element={<ProductEdit/>}/>
      <Route path='/couponManage' element={<CouponManage/>}/>
      <Route path='/couponAdd' element={<CouponAdd/>}/>
      <Route path='/couponEdit' element={<CouponEdit/>}/>
      <Route path='/offerManage' element={<OfferManage/>}/>
      <Route path='/addOffer' element={<AddOffer/>}/>
      <Route path='/editOffer' element={<EditOffer/>}/>
      <Route path='/ProductVarientManage' element={<ProductVarientManage/>}/>
      <Route path='/ProductVarientEdit' element={<ProductVarientEdit/>}/>
      <Route path='/ProductVarientAdd' element={<ProductVarientAdd/>}/>
      <Route path='/userReviews/:id' element={<Review/>}/>
      <Route path='/userProfile' element={<ProtectedRoute><UserProfile/></ProtectedRoute>}/>
      <Route path='/checkoutPage' element={<CheckoutPage/>}/>
      <Route path='/orderManagement' element={<OrderManagement/>}/>
      <Route path='/orderDetailsPage' element={<UserSingleOrderDetailsPage/>}/>
      <Route path='/returned' element={<ReturnedProducts/>}/>
      <Route path='/salesReport' element={<ProtectedRoute><SalesReport/></ProtectedRoute>}/>
      <Route path='/userWallet' element={<UserWallet/>}/>
      <Route path='/userChat' element={<UserChat/>}/>
      <Route path='/adminChat' element={<AdminChat/>}/>
      <Route path='/bannerManagement' element={<BannerManagement/>}/>
    </Routes>
    </QueryClientProvider>
  );
}

// Main App component
function App() {
  return (
    <HistoryRouter history={history}>
      <ToastContainer />
      <AppRoutes />
      </HistoryRouter>
  );
}

export default App;
