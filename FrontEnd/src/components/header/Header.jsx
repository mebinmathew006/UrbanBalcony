import React from "react";
import { useNavigate } from "react-router-dom";

function Header(props) {
  const navigate = useNavigate();
  const profileIconHandler = (event) => {
    navigate(props.page === "index" ? "/login" : "userDashboard");
  };
  return (
    <header className="bg-light py-2 container-fluid" >
      <div className=" d-flex align-items-center justify-content-between">
        {/* Logo */}
        <div className="logo d-flex align-items-center">
          <h1
            className="m-0 text-primary"
            style={{ fontWeight: "bold", fontSize: "2rem" }}
          >
            UB
          </h1>
          <span className="ms-2 fw-bold">URBAN BALCONY</span>
        </div>

        {/* Search Bar */}
        <div className="search-bar w-50">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search"
              style={{ borderRadius: "20px 0 0 20px", borderColor: "#ddd" }}
            />
            <button
              className="btn btn-primary"
              style={{ borderRadius: "0 20px 20px 0" }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Icons */}
        <div className="icons d-flex align-items-center">
          {props.page === "home" && (
            <>
              <i
                className="fas fa-bell me-3"
                style={{ fontSize: "1.2rem", cursor: "pointer" }}
              ></i>
              <i
                className="fas fa-shopping-cart me-3"
                style={{ fontSize: "1.2rem", cursor: "pointer" }}
              ></i>
              <i
                className="fas fa-heart me-3"
                style={{ fontSize: "1.2rem", cursor: "pointer" }}
              ></i>
            </>
          )}
          <i
            className="fas fa-user"
            style={{ fontSize: "1.2rem", cursor: "pointer" }}
            onClick={profileIconHandler}
          ></i>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="mt-3">
        <div className="container d-flex justify-content-center">
          <ul className="nav">
            <li className="nav-item">
              <a className="nav-link text-dark" href="#">
                Home
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="#">
                Spice Powder
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="#">
                Tea & Coffee
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="#">
                Dry Fruits
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="#">
                Essential Oils
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="#">
                Masala Blends
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="#">
                Offers
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;
