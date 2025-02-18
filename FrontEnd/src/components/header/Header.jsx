import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import publicaxiosconfig from "../../Publicaxiosconfig";
import { useSelector } from "react-redux";
function Header(props) {
  const [categories, setCategories] = useState([]);
  const user_id = useSelector((state) => state.userDetails.id);
  const [search, setSearch] = useState(props.searchValue);
  const navigate = useNavigate();
  async function fetchCategories() {
    try {
      const response = await publicaxiosconfig.get("/getCategories");

      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);
  const profileIconHandler = (event) => {
    navigate(user_id ? "/userProfile" : "/login");
  };
  return (
    <header className="bg-[#FCF4D2] py-2 container-fluid sticky ">
      {/* bg-[#6D8D3C] */}

      <div className=" d-flex align-items-center justify-content-between">
        {/* Logo */}
        <div className="d-flex align-items-center hover:cursor-pointer">
          <img
            className="rounded-sm"
            src="../public\spice new.png"
            alt="notFound"
            width={100}
            height={200}
            onClick={() => navigate(user_id ? "/HomePage" : "/")}
          />
          {/* <span
            onClick={() => navigate(user_id ? "/HomePage" : "/" )}
            className="ms-2 fw-bold "
          >
          </span> */}
        </div>

        <div className="search-bar w-50">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search Here"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ borderRadius: "20px 0px 0px 20px", borderColor: "#ddd" }}
            />
            <button
              className=" bg-[#467927] text-white"
              style={{ borderRadius: "0 20px 20px 0" }}
              onClick={(event) => {
                props.handleSearch(search);
              }}
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
                className="fas fa-bell me-3 text-[#073801]"
                style={{ fontSize: "1.2rem", cursor: "pointer" }}
              ></i>
              {/* cart */}
              {user_id && (
                <i
                  className="fas fa-shopping-cart me-3 text-[#073801]"
                  onClick={() =>
                    navigate("/userProfile", { state: { tab: "cart" } })
                  }
                  style={{ fontSize: "1.2rem", cursor: "pointer" }}
                ></i>
              )}
              {/* wishlist */}
              {user_id && (
                <i
                  className="fas fa-heart me-3 text-[#073801]"
                  style={{ fontSize: "1.2rem", cursor: "pointer" }}
                  onClick={() =>
                    navigate("/userProfile", { state: { tab: "wishlist" } })
                  }
                ></i>
              )}
            </>
          )}
          <i
            className="fas fa-user text-[#073801]"
            style={{ fontSize: "1.2rem", cursor: "pointer" }}
            onClick={profileIconHandler}
          ></i>
        </div>
      </div>

      {/* Navigation Links */}
      {props.page != "userprofile" && (
        <nav className="mt-3">
          <div className="container d-flex justify-content-center">
            <ul className="nav">
              <li className="nav-item">
                <Link
                  to={user_id ? "/Homepage" : "/"}
                  className="nav-link text-[#467927]"
                >
                  Home
                </Link>
              </li>
              {categories.map((category, index) => {
                return (
                  <li className="nav-item" key={index}>
                    <Link
                      to={user_id ? "/Homepage" : "/"}
                      state={{ category_id: category.id }}
                      className="nav-link text-[#467927]"
                    >
                      {" "}
                      {category.name}{" "}
                    </Link>
                  </li>
                );
              })}

              <li className="nav-item">
                <a className="nav-link text-[#467927]" href="#">
                  Offers
                </a>
              </li>
            </ul>
          </div>
        </nav>
      )}
      <hr />
    </header>
  );
}

export default Header;
