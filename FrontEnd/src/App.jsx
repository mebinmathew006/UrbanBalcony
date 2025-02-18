import './App.css'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import IndexPage from '../src/Pages/User/IndexPage/IndexPage'
import Login from './pages/User/Login/Login'
import SignupPage from './pages/User/SignupPage/SignupPage'
import ForgetPassword from './pages/User/SignupPage/ForgetPassword'
import ResetPassword from './pages/User/SignupPage/ResetPassword'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "@fortawesome/fontawesome-free/css/all.min.css";
import HomePage from './pages/User/HomePage/HomePage'
import ProductDetails from './pages/User/productDetails/ProductDetails'
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
import UserSingleOrderDetailsPage from './pages/User/UserProfile/UserSingleOrderDetailsPage'
import ReturnedProducts from './pages/Admin/OrderManagement/ReturnedProducts'
import CouponManage from './pages/Admin/CouponManage/CouponManage'
import CouponAdd from './pages/Admin/CouponManage/CouponAdd'
import CouponEdit from './pages/Admin/CouponManage/CouponEdit'
import OfferManage from './pages/Admin/OfferManage/OfferManage'
import AddOffer from './pages/Admin/OfferManage/AddOffer'
import EditOffer from './pages/Admin/OfferManage/EditOffer'
import SalesReport from './pages/Admin/SalesReport/SalesReport'
import UserWallet from './pages/User/UserProfile/UserWallet'
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import history from './History'
import publicaxiosconfig from './Publicaxiosconfig'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UserChat from './pages/User/UserProfile/UserChat'
import AdminChat from './pages/Admin/AdminChat/AdminChat'
import BannerManagement from './pages/Admin/BannerManagement/BannerManagement'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const fetchUserDetails = async (dispatch,navigate) => {
  try {
      const response = await publicaxiosconfig.get("/getUserDetailsForAuthentication", {
          withCredentials: true, // Ensure cookies are included in the request
      });
      dispatch(setUserDetails(response.data.user));
  } catch (error) {
      dispatch(setUserDetails(null)); 
      navigate('/login')
  }
};


// Separate component for the routes
function AppRoutes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails(dispatch, navigate);
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
