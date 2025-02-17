import React, { useEffect, useState } from "react";
import "./UserProfile.css";
import Header from "../../../components/header/header";
import ProfileDetails from "./ProfileDetails";
import UserAddress from "./UserAddress";
import { useDispatch, useSelector } from "react-redux";
import UserOrderDetails from "./UserOrderDetails";
import UserCart from "./UserCart";
import { useLocation, useNavigate } from "react-router-dom";
import { destroyDetails } from "../../../store/UserDetailsSlice";
import axiosInstance from "../../../axiosconfig";
import UserSingleOrderDetailsPage from "./UserSingleOrderDetailsPage";
import UserWishlist from "./UserWishlist";
import UserWallet from "./UserWallet";
import UserChat from "./UserChat";
import Footer from "../../../components/footer/Footer";

const UserProfile = () => {
  const baseurl = import.meta.env.VITE_BASE_URL;

  const location = useLocation();
  const user_id = useSelector((state) => state.userDetails.id);
  const [activeTab, setActiveTab] = useState(location.state?.tab || "profile");
  const [user, setUser] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
    const fetchUserDetails = async () => {
      const response = await axiosInstance.get(`userDetails/${user_id}`);

      setUser(response.data);
    };

    fetchUserDetails();
  }, [location.state]);

  // Component mapping for tabs
  const tabComponents = {
    profile: <ProfileDetails />,
    address: <UserAddress />,
    orders: <UserOrderDetails />,
    cart: <UserCart />,
    orderDetails: <UserSingleOrderDetailsPage />,
    wishlist: <UserWishlist />,
    userWallet: <UserWallet />,
    chat: <UserChat />,
  };

  return (
    <div className="container-fluid sticky bg-[#FCF4D2]">
      <div className="row ">
        <Header page="userprofile" />
        <div
          className="col-md-3 shadow "
          style={{ backgroundColor: "#FCF4D2" }}
        >
          <div className="profile-sidebar">
            <div className="profile-image">
              <img
                src={`${baseurl}${user.profile_picture}`}
                alt="profile"
                className="rounded-circle"
              />
            </div>
            <div className="profile-name text-center mt-3">
              <h4>
                {user.first_name} {user.last_name}
              </h4>
            </div>
            <div className="profile-menu">
              <ul className="nav flex-column">
                <li
                  className={`nav-item ${
                    activeTab === "profile" ? "active" : ""
                  }`}
                >
                  <button
                    className="nav-link"
                    onClick={() => setActiveTab("profile")}
                  >
                    Profile
                  </button>
                </li>
                <li
                  className={`nav-item ${
                    activeTab === "address" ? "active" : ""
                  }`}
                >
                  <button
                    className="nav-link"
                    onClick={() => setActiveTab("address")}
                  >
                    Address
                  </button>
                </li>
                <li
                  className={`nav-item ${
                    activeTab === "orders" ? "active" : ""
                  }`}
                >
                  <button
                    className="nav-link"
                    onClick={() => setActiveTab("orders")}
                  >
                    Orders
                  </button>
                </li>
                {/* cart */}
                <li
                  className={`nav-item ${activeTab === "cart" ? "active" : ""}`}
                >
                  <button
                    className="bg-[#073801] nav-link"
                    onClick={() => setActiveTab("cart")}
                  >
                    Cart
                  </button>
                </li>
                {/* wishlist */}
                <li
                  className={`nav-item ${
                    activeTab === "wishlist" ? "active" : ""
                  }`}
                >
                  <button
                    className="nav-link"
                    onClick={() => setActiveTab("wishlist")}
                  >
                    Wishlist
                  </button>
                </li>
                {/* userWallet */}
                <li
                  className={`nav-item ${
                    activeTab === "userWallet" ? "active" : ""
                  }`}
                >
                  <button
                    className="nav-link"
                    onClick={() => setActiveTab("userWallet")}
                  >
                    Wallet
                  </button>
                </li>
                {/* Chat */}
                <li
                  className={`nav-item ${activeTab === "chat" ? "active" : ""}`}
                >
                  <button
                    className="nav-link"
                    onClick={() => setActiveTab("chat")}
                  >
                    Customer Care
                  </button>
                </li>
                {/* Logout */}
                <li className={`nav-item ${activeTab === " " ? "active" : ""}`}>
                  <button
                    className="nav-link"
                    onClick={() => {
                      dispatch(destroyDetails());
                      try {
                        const response = axiosInstance.post("/userLogout");
                        navigate("/login");
                      } catch (error) {}
                    }}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 main-content">{tabComponents[activeTab]}</div>
        <Footer />
      </div>
    </div>
  );
};

export default UserProfile;
