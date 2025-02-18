import React, { useState } from "react";
import { Star, X, ChevronDown, ChevronUp } from "lucide-react";

const Filters = ({ onFilterChange }) => {
  const [selectedSort, setSelectedSort] = useState("menu_order");
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
    <div className="w-64 bg-[#FCF4D2] rounded-lg p-6 h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
       
      </div>

      <FilterSection 
        title="Sort By" 
        expanded={expandedSections.sort}
       
      >
        <select
          value={selectedSort}
          onChange={handleSortChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="popularity">Most Popular</option>
          <option value="menu_order">Default sorting</option>
          <option value="rating">Highest Rated</option>
          <option value="date">Newest First</option>
          <option value="price">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </FilterSection>

      {/* <FilterSection 
        title="Price Range" 
        expanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="1000"
            value={priceRange[1]}
            onChange={handlePriceChange}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </FilterSection> */}

      {/* <FilterSection 
        title="Categories" 
        expanded={expandedSections.categories}
        onToggle={() => toggleSection('categories')}
      >
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </FilterSection> */}

      {/* <FilterSection 
        title="Rating" 
        expanded={expandedSections.rating}
        onToggle={() => toggleSection('rating')}
      >
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`flex items-center w-full p-2 rounded-md transition-colors  bg-white ${
                selectedRating === rating 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex">
                {[...Array(rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-yellow-400 fill-current"
                  />
                ))}
                {[...Array(5 - rating)].map((_, i) => (
                  <Star
                    key={i + rating}
                    size={16}
                    className="text-gray-300"
                  />
                ))}
              </div>
              <span className="ml-2 text-sm">& Up</span>
            </button>
          ))}
        </div>
      </FilterSection> */}
    </div>
  );
};

export default Filters;