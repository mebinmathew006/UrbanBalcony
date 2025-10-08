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
    
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex-shrink-0 cursor-pointer"
            onClick={() => navigate(user_id ? "/HomePage" : "/")}
          >
            <img
              className="h-10 w-auto"
              src="/spice new.png"
              alt="Spice Store"
            />
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-lg mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Search for spices, herbs..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(search)}
              />
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex space-x-8">
            <Link to={user_id ? "/Homepage" : "/"} className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium">
              Home
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={user_id ? "/Homepage" : "/"}
                state={{ category_id: category.id }}
                className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium"
              >
                {category.name}
              </Link>
            ))}
            <Link to="/offers" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium">
              Offers
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center">
            {user_id  && (
              <>
                <button className="p-2 rounded-full text-gray-500 hover:text-green-600 focus:outline-none">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                </button>

                {user_id && (
                  <>
                    <button 
                      className="p-2 ml-2 rounded-full text-gray-500 hover:text-green-600 focus:outline-none"
                      onClick={() => navigate("/userProfile", { state: { tab: "cart" } })}
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                      </svg>
                    </button>
                    <button 
                      className="p-2 ml-2 rounded-full text-gray-500 hover:text-green-600 focus:outline-none"
                      onClick={() => navigate("/userProfile", { state: { tab: "wishlist" } })}
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                    </button>
                  </>
                )}
              </>
            )}
            
            <button 
              className="p-2 ml-2 rounded-full text-gray-500 hover:text-green-600 focus:outline-none"
              onClick={profileIconHandler}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-green-600 focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg
                className={`${menuOpen ? 'hidden' : 'block'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${menuOpen ? 'block' : 'hidden'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className={`${menuOpen ? 'block' : 'hidden'} md:hidden px-4 pb-4`}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Search for spices, herbs..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(search)}
          />
          <button 
            className="absolute inset-y-0 right-0 px-4 text-green-600 font-medium"
            onClick={() => handleSearch(search)}
          >
            Search
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`${menuOpen ? 'block' : 'hidden'} md:hidden bg-white`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to={user_id ? "/Homepage" : "/"} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            Home
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={user_id ? "/Homepage" : "/"}
              state={{ category_id: category.id }}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              {category.name}
            </Link>
          ))}
          <Link to="/offers" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            Offers
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
