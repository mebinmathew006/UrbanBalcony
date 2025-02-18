import React from 'react'

function UserSidebar() {
  return (
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
  )
}

export default UserSidebar
