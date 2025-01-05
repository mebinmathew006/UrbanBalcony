import React from "react";
import { Link } from "react-router-dom";


const Sidebar = () => {
  return (
    <aside
      className="bg-light shadow-sm"
     
    >
      <div className="py-4 border-bottom">
        <h2 className="m-0">Admin Panel</h2>
      </div>
      <ul className="nav flex-column p-3">
        <li className="nav-item">
          <a className="nav-link" href="#">
            Dashboard
          </a>
        </li>
        <li className="nav-item">
          <Link to='/UserManage' className="nav-link" >
             Users
          </Link>
        </li>
        <li className="nav-item">
          <Link to='/ProductManage' className="nav-link" >
             Products
          </Link>
        </li>
        <li className="nav-item">
        <Link to='/CategoryManage' className="nav-link" >
        Category
          </Link>
             
        </li>
        <li className="nav-item">
          <a className="nav-link text-danger" href="#">
            Logout
          </a>
        </li>
      </ul>
    </aside>
  );
};

const styles = {};

export default Sidebar;
