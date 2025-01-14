import React, { useState } from "react";
import "./UserProfile.css";
import Header from "../../../components/header/header";
import ProfileDetails from "./ProfileDetails";
import UserAddress from "./UserAddress";
import { useSelector } from "react-redux";
import UserOrderDetails from "./UserOrderDetails";
import UserCart from "./UserCart";
import { useLocation } from "react-router-dom";

const UserProfile = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');
  const user = useSelector((state) => state.userDetails);
  

  // Component mapping for tabs
  const tabComponents = {
    profile: <ProfileDetails />,
    address: <UserAddress />,
    orders: <UserOrderDetails />,
    cart: <UserCart />,
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Header page="userprofile" />
        {/* Sidebar */}
        <div className="col-md-3 sidebar">
          <div className="profile-sidebar">
            <div className="profile-image">
              <img
                src={`http://localhost:8000/${user.profile_picture}`}
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
                <li
                  className={`nav-item ${
                    activeTab === "cart" ? "active" : ""
                  }`}
                >
                  <button
                    className="nav-link"
                    onClick={() => setActiveTab("cart")}
                  >
                    Cart
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 main-content">{tabComponents[activeTab]}</div>
      </div>
    </div>
  );
};

export default UserProfile;
