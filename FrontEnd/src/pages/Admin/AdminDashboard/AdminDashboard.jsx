import React from 'react'
import Sidebar from '../../../components/Admin/Sidebar'
import './AdminDashboard.css'
import DashboardBody from '../../../components/Admin/DashboardBody'

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
