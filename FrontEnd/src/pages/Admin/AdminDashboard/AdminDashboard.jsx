import React from 'react'
import Sidebar from '../../../Components/Admin/Sidebar'
import './AdminDashboard.css'
import DashboardBody from '../../../Components/Admin/DashboardBody'

function AdminDashboard() {
  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar /> 
      <div className="d-flex flex-column flex-grow-1">
        <DashboardBody />
      </div>
    </div>
  );
}

export default AdminDashboard;
