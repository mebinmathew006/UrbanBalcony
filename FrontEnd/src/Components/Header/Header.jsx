import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import publicaxiosconfig from "../../Publicaxiosconfig";
import { useSelector } from "react-redux";
function Header(props) {
  const [menuOpen, setMenuOpen] = useState(false);
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
    <header className="bg-[#FCF4D2] py-2 w-full  top-0 z-50 ">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate(user_id ? "/HomePage" : "/")}
        >
          <img
            className="rounded-sm w-24 h-auto"
            src="/spice new.png"
            alt="Logo"
          />
        </div>

        {/* Search Bar (Hidden on xs, Visible from sm and up) */}
        <div className="hidden sm:block w-full px-4 sm:w-2/3 md:w-1/2 lg:w-1/3">
          <div className="flex">
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-l-2xl focus:outline-none focus:ring-2 focus:ring-[#467927]"
              placeholder="Search Here"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button
              className="px-4 py-2 text-white bg-[#467927] rounded-r-2xl hover:bg-[#35661e] transition duration-300"
              onClick={() => props.handleSearch(search)}
            >
              Search
            </button>
          </div>
        </div>

        {/* Icons & Hamburger Button */}
        <div className="flex items-center gap-x-4">
          {props.page === "home" && (
            <>
              <i className="fas fa-bell text-[#073801] text-lg cursor-pointer"></i>
              {user_id && (
                <>
                  <i
                    className="fas fa-shopping-cart text-[#073801] text-lg cursor-pointer"
                    onClick={() =>
                      navigate("/userProfile", { state: { tab: "cart" } })
                    }
                  ></i>
                  <i
                    className="fas fa-heart text-[#073801] text-lg cursor-pointer"
                    onClick={() =>
                      navigate("/userProfile", { state: { tab: "wishlist" } })
                    }
                  ></i>
                </>
              )}
            </>
          )}
          <i
            className="fas fa-user text-[#073801] text-lg cursor-pointer"
            onClick={profileIconHandler}
          ></i>

          {/* Mobile Menu Toggle Button */}
          <button
            className="block md:hidden text-[#073801] text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (Hidden on Desktop) */}
      {/* Search Bar (Hidden on sm, Visible on md and larger) */}
      <div className="sm:hidden w-full px-4 sm:w-2/3 md:w-1/2 lg:w-1/3">
        <div className="flex w-full">
          <input
            type="text"
            className="flex-grow p-2 border border-gray-300 rounded-l-2xl focus:outline-none focus:ring-2 focus:ring-[#467927]"
            placeholder="Search Here"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button
            className="px-4 py-2 text-white bg-[#467927] rounded-r-2xl hover:bg-[#35661e] transition duration-300"
            onClick={() => props.handleSearch(search)}
          >
            Search
          </button>
        </div>
      </div>

      {/* Navigation Links (Responsive) */}
      <nav className={`mt-3 ${menuOpen ? "block" : "hidden"} md:block`}>
        <div className="flex flex-col md:flex-row md:justify-center">
          <ul className="flex flex-col md:flex-row md:space-x-6 text-center">
            <li>
              <Link
                to={user_id ? "/Homepage" : "/"}
                className="no-underline text-green-900 block py-2"
              >
                Home
              </Link>
            </li>
            {categories.map((category, index) => (
              <li key={index}>
                <Link
                  to={user_id ? "/Homepage" : "/"}
                  state={{ category_id: category.id }}
                  className="no-underline text-green-900 block py-2"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="#" className="no-underline text-green-900 block py-2">
                Offers
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <hr />
    </header>
  );
}

export default Header;
