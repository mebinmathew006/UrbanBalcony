// UserProfile.jsx
import React, { useState } from 'react';
import './UserProfile.css';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  const user = {
    name: "Sarah Wilson",
    email: "sarah@example.com",
    phone: "+1 234 567 890",
    location: "New York, USA",
    avatar: "/api/placeholder/150/150"
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 sidebar">
          <div className="profile-sidebar">
            <div className="profile-image">
              <img src={user.avatar} alt="profile" className="rounded-circle" />
            </div>
            <div className="profile-name text-center mt-3">
              <h4>{user.name}</h4>
            </div>
            <div className="profile-menu">
              <ul className="nav flex-column">
                <li className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}>
                  <button 
                    className="nav-link" 
                    onClick={() => setActiveTab('profile')}
                  >
                    Profile
                  </button>
                </li>
                <li className={`nav-item ${activeTab === 'address' ? 'active' : ''}`}>
                  <button 
                    className="nav-link" 
                    onClick={() => setActiveTab('address')}
                  >
                    Address
                  </button>
                </li>
                <li className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}>
                  <button 
                    className="nav-link" 
                    onClick={() => setActiveTab('orders')}
                  >
                    Orders
                  </button>
                </li>
                <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}>
                  <button 
                    className="nav-link" 
                    onClick={() => setActiveTab('settings')}
                  >
                    Settings
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 main-content">
          {activeTab === 'profile' && (
            <div className="profile-content">
              <h3>Profile Information</h3>
              <div className="card">
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <h6 className="mb-0">Full Name</h6>
                    </div>
                    <div className="col-sm-9 text-secondary">
                      {user.name}
                    </div>
                  </div>
                  <hr />
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <h6 className="mb-0">Email</h6>
                    </div>
                    <div className="col-sm-9 text-secondary">
                      {user.email}
                    </div>
                  </div>
                  <hr />
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <h6 className="mb-0">Phone</h6>
                    </div>
                    <div className="col-sm-9 text-secondary">
                      {user.phone}
                    </div>
                  </div>
                  <hr />
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <h6 className="mb-0">Location</h6>
                    </div>
                    <div className="col-sm-9 text-secondary">
                      {user.location}
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-sm-12">
                      <button className="btn btn-primary">Edit Profile</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="address-content">
              <h3>Address Management</h3>
              <div className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">Home Address</h5>
                  <p className="card-text">123 Main Street, Apt 4B<br />New York, NY 10001</p>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-primary">Edit</button>
                    <button className="btn btn-sm btn-outline-danger">Delete</button>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary">Add New Address</button>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-content">
              <h3>Order History</h3>
              <p>No orders found.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-content">
              <h3>Account Settings</h3>
              <p>Settings page under construction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;