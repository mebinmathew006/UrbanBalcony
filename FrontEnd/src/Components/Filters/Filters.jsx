import React, { useState } from "react";
import { SlidersHorizontal, X, ChevronDown, TrendingUp, DollarSign, Grid, Star, RotateCcw, Check } from "lucide-react";

const Filters = ({ onFilterChange }) => {
  const [selectedSort, setSelectedSort] = useState("menu_order");
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    price: true,
    categories: true,
  });
  
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  // Track if there are pending changes
  const [hasChanges, setHasChanges] = useState(false);

  // Store applied filters to compare against
  const [appliedFilters, setAppliedFilters] = useState({
    sort: "menu_order",
    priceRange: [0, 1000],
    categories: []
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceInput = (type, value) => {
    const numValue = parseInt(value) || 0;
    
    if (type === 'min') {
      setMinPrice(numValue);
    } else {
      setMaxPrice(numValue);
    }
    setHasChanges(true);
  };

  const handlePriceBlur = () => {
    const newRange = [minPrice, maxPrice];
    setPriceRange(newRange);
    setHasChanges(true);
  };

  const handleCategoryChange = (category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(cat => cat !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    setHasChanges(true);
  };

  const handleSortChange = (sortOption) => {
    setSelectedSort(sortOption);
    setHasChanges(true);
  };

  const applyFilters = () => {
    const filters = {
      type: selectedSort,
      priceRange,
      categories: selectedCategories
    };
    
    setAppliedFilters(filters);
    onFilterChange(filters);
    setHasChanges(false);
    setIsOpen(false); // Close mobile sidebar after applying
  };

  const resetFilters = () => {
    setSelectedSort("menu_order");
    setPriceRange([0, 1000]);
    setMinPrice(0);
    setMaxPrice(1000);
    setSelectedCategories([]);
    setHasChanges(false);
    
    const resetFiltersData = {
      type: "menu_order",
      priceRange: [0, 1000],
      categories: []
    };
    
    setAppliedFilters(resetFiltersData);
    onFilterChange(resetFiltersData);
  };

  const categories = [
    { name: 'Whole Spices', icon: '🌿' },
    { name: 'Ground Spices', icon: '🥄' },
    { name: 'Blends', icon: '🎨' },
    { name: 'Organic', icon: '🌱' },
    { name: 'Premium', icon: '⭐' }
  ];

  const sortOptions = [
    { value: 'menu_order', label: 'Default sorting', icon: <Grid className="w-4 h-4" /> },
    { value: 'popularity', label: 'Most Popular', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'rating', label: 'Highest Rated', icon: <Star className="w-4 h-4" /> },
    { value: 'date', label: 'Newest First', icon: <span className="text-base">🆕</span> },
    { value: 'price', label: 'Price: Low to High', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'price-desc', label: 'Price: High to Low', icon: <DollarSign className="w-4 h-4" /> },
  ];

  const FilterSection = ({ title, icon, expanded, section, children }) => (
    <div className="mb-6 ">
      <button 
        className="w-full flex items-center justify-between py-3 text-left  group bg-gradient-to-r from-green-700 to-green-900 rounded-lg"
        onClick={() => toggleSection(section)}
      >
        <div className="flex items-center gap-2">
          <div className="text-green-900">{icon}</div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">{title}</h3>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        expanded ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
      }`}>
        {children}
      </div>
    </div>
  );

  const activeFiltersCount = appliedFilters.categories.length + 
    (appliedFilters.priceRange[0] !== 0 || appliedFilters.priceRange[1] !== 1000 ? 1 : 0);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed bottom-6 right-6 z-50 p-4 bg-green-600 text-white rounded-full shadow-2xl lg:hidden hover:bg-green-700 transition-all duration-300 hover:scale-110"
        onClick={() => setIsOpen(!isOpen)}
      >
        <SlidersHorizontal className="w-6 h-6" />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl overflow-y-auto lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:translate-x-0 lg:block lg:w-72 xl:w-80 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">Filters</h2>
            </div>
            <button
              className="lg:hidden p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
              </span>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset all
              </button>
            </div>
          )}
        </div>

        <div className="p-6 pb-32 lg:pb-6">
          {/* Sort By Section */}
          <FilterSection 
            title="Sort By" 
            icon={<TrendingUp className="w-4 h-4" />}
            expanded={expandedSections.sort}
            section="sort"
          >
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left border ${
                    selectedSort === option.value
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <div className={`${selectedSort === option.value ? 'text-green-600' : 'text-gray-400'}`}>
                    {option.icon}
                  </div>
                  <span className="text-sm font-medium flex-1">{option.label}</span>
                  {selectedSort === option.value && (
                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Price Range Section */}
          <FilterSection 
            title="Price Range" 
            icon={<DollarSign className="w-4 h-4" />}
            expanded={expandedSections.price}
            section="price"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Min
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => handlePriceInput('min', e.target.value)}
                      onBlur={handlePriceBlur}
                      className="w-full pl-7 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      max={maxPrice}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Max
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => handlePriceInput('max', e.target.value)}
                      onBlur={handlePriceBlur}
                      className="w-full pl-7 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min={minPrice}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-green-700">
                  <span>₹{minPrice}</span>
                  <span className="text-green-500">—</span>
                  <span>₹{maxPrice}</span>
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Categories Section */}
          <FilterSection 
            title="Categories" 
            icon={<Grid className="w-4 h-4" />}
            expanded={expandedSections.categories}
            section="categories"
          >
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category.name}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                    selectedCategories.includes(category.name)
                      ? 'bg-green-50 border-green-500'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => handleCategoryChange(category.name)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                  />
                  <span className="text-lg">{category.icon}</span>
                  <span className={`text-sm font-medium flex-1 ${
                    selectedCategories.includes(category.name) ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        </div>

        {/* Apply Button - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 lg:sticky bg-white border-t border-gray-200 p-4 lg:w-72 xl:w-80 z-20">
          <button 
            onClick={applyFilters}
            disabled={!hasChanges}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              hasChanges 
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-5 h-5" />
            Apply Filters
          </button>
          {hasChanges && (
            <p className="text-xs text-center text-gray-500 mt-2">
              You have unsaved filter changes
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Filters;