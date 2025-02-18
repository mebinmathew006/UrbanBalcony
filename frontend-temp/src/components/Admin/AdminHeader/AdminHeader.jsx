import React from 'react'

function AdminHeader(props) {
  return (
    <header className="bg-white shadow-sm py-2 px-3">
            <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0">Welcome, Admin</h4>
                <div className="d-flex align-items-center">
                    <a href="#" className="btn btn-light mx-1">
                        <i className="fas fa-bell"></i>
                    </a>
                    <a href="#" className="btn btn-light mx-1">
                        <i className="fas fa-user-circle"></i>
                    </a>
                </div>
            </div>
        </header>
  )
}

export default AdminHeader
