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
      className="fixed top-25 left-4 z-50 p-2 bg-[#467927] text-white rounded-md lg:hidden"
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? "Close Filters" : "Open Filters"}
    </button>

    {/* Sidebar */}
    <div
      className={`fixed top-0 left-0 z-50 lg:z-auto w-64 bg-[#FCF4D2] rounded-lg p-6 h-screen transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
        <button
          className="lg:hidden bg-inherit text-red-800"
          onClick={() => setIsOpen(false)}
        >
          ✖
        </button>
      </div>

      {/* Filter Section */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Sort By</label>
        <select
          value={selectedSort}
          onChange={handleSortChange} // ✅ Keeps sidebar open on change
          className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#467927]"
        >
          <option value="popularity">Most Popular</option>
          <option value="menu_order">Default sorting</option>
          <option value="rating">Highest Rated</option>
          <option value="date">Newest First</option>
          <option value="price">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>

    {/* Overlay when sidebar is open on small screens */}
    {isOpen && (
      <div
        className="fixed inset-0 bg-black opacity-50 lg:hidden"
        onClick={() => setIsOpen(false)} // ✅ Close when clicking outside
      ></div>
    )}
  </>
  );
};

export default Filters;