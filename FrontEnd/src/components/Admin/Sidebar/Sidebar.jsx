import React from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { destroyDetails } from "../../../store/UserDetailsSlice";
import axiosInstance from "../../../axiosconfig";

const Sidebar = () => {
  const dispatch = useDispatch()
  const navigate =useNavigate()
  return (
    <aside className="bg-light shadow-sm h-full">
      <div className="py-4 border-bottom ">
        <h2 className="m-0">Admin Panel</h2>
      </div>
      <ul className="nav flex-column p-3">
        <li className="nav-item">
          <a className="nav-link" href="#">
            Dashboard
          </a>
        </li>
        <li className="nav-item">
          <Link to="/UserManage" className="nav-link">
            Users
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/ProductManage" className="nav-link">
            Products
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/CategoryManage" className="nav-link">
            Category
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/orderManagement" className="nav-link">
            Order
          </Link>
        </li>
        <li className="nav-item">
          <button
            className="nav-link text-danger"
            
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
    </aside>
  );
};

const styles = {};

export default Sidebar;
