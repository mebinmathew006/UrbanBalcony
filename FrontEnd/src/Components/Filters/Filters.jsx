import React, { useState } from "react";
import { Star, X, ChevronDown, ChevronUp } from "lucide-react";

const Filters = ({ onFilterChange }) => {
  const [selectedSort, setSelectedSort] = useState("menu_order");
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    price: true,
    categories: true,
    rating: true
  });
  
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);



  const handlePriceChange = (newRange) => {
    setPriceRange(newRange);
    onFilterChange({ sort: selectedSort, priceRange: newRange, categories: selectedCategories });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    const newCategories = selectedCategories.includes(value)
      ? selectedCategories.filter(cat => cat !== value)
      : [...selectedCategories, value];
    
    setSelectedCategories(newCategories);
    onFilterChange({ sort: selectedSort, priceRange, categories: newCategories });
  };

  const handleSortChange = (e) => {
    const sortOption = e.target.value;
    setSelectedSort(sortOption);
    onFilterChange({ type: sortOption });
  };

  const FilterSection = ({ title, expanded, onToggle, children }) => (
    <div className="border-b border-gray-200 py-4">
      <div 
        className="flex items-center justify-between cursor-pointer mb-2"
        onClick={onToggle}
      >
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      {expanded && children}
    </div>
  );

  return (
    <>
    {/* Toggle Button for Mobile */}
    <button
      className="fixed bottom-4 left-4 z-50 p-3 bg-green-700 text-white rounded-full shadow-lg lg:hidden flex items-center justify-center"
      onClick={() => setIsOpen(!isOpen)}
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
      </svg>
      <span className="ml-2">{isOpen ? "Hide Filters" : "Filters"}</span>
    </button>

    {/* Sidebar */}
    <div
      className={`fixed inset-y-0 left-0 z-50 lg:z-auto w-72 bg-white shadow-2xl p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out lg:sticky lg:top-20 lg:h-screen lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
        <button
          className="lg:hidden p-2 rounded-full hover:bg-gray-200"
          onClick={() => setIsOpen(false)}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Sort By</h3>
        <select
          value={selectedSort}
          onChange={handleSortChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="popularity">Most Popular</option>
          <option value="menu_order">Default sorting</option>
          <option value="rating">Highest Rated</option>
          <option value="date">Newest First</option>
          <option value="price">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
        <div className="flex items-center justify-between mb-2">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
        <div className="px-2">
          {/* This would be a price range slider component in a real app */}
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-green-500 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
        <div className="space-y-2">
          {['Whole Spices', 'Ground Spices', 'Blends', 'Organic', 'Premium'].map((category) => (
            <div key={category} className="flex items-center">
              <input
                id={`category-${category}`}
                name={`category-${category}`}
                type="checkbox"
                value={category}
                checked={selectedCategories.includes(category)}
                onChange={handleCategoryChange}
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor={`category-${category}`} className="ml-3 text-sm text-gray-700">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Filters Button (Mobile Only) */}
      <button 
        className="lg:hidden w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        onClick={() => setIsOpen(false)}
      >
        Apply Filters
      </button>
    </div>

    {/* Overlay when sidebar is open on small screens */}
    {isOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
        onClick={() => setIsOpen(false)}
      ></div>
    )}
  </>
  );
};

export default Filters;