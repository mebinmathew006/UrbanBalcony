import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "../../../Components/Header/Header";
import Footer from "../../../Components/Footer/Footer";
import axiosInstance from "../../../axiosconfig";
import ProductView from "../../../Components/ProductView/ProductView";
import Filters from "../../../Components/Filters/Filters";
import { useLocation, useSearchParams } from "react-router-dom";
import { debounce } from "lodash";
import Banner from "../../../Components/Banner/Banner";

function HomePage() {
  const location = useLocation();
  let { category_id } = location.state || {};
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const [fiterType, setFilterType] = useState("");
  const [searchItem, setSearchItem] = useState("");
  
  // Handle Search
  const handleSearch = debounce((searchedString) => {
    setSearchItem(searchedString);
    category_id = "";
    setFilterType("");
  }, 500);

  // Handle filter change
  const handleFilterChange = (changedFilterDetails) => {
    setSearchItem("");
    category_id = "";
    setFilterType(changedFilterDetails.type);
  };
  
  // Fetch products with React Query
  const {
    data: productsData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["products", category_id, currentPage, fiterType, searchItem],
    queryFn: async () => {
      let url = "";
      if (category_id) {
        url = `/categoryBasedProductData/${category_id}?page=${currentPage}`;
      } else if (fiterType) {
        url = `/filterBasedProductData/${fiterType}?page=${currentPage}`;
      } else if (searchItem) {
        url = `/searchBasedProductData/${searchItem}?page=${currentPage}`;
        console.log(searchItem, "is serched", url);
      } else {
        url = `/?page=${currentPage}`;
      }
      const response = await axiosInstance.get(url);
      return response.data;
    },
    keepPreviousData: true, 
  });

  // Handle page change
  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center p-4">Error: {error.message}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        page="home"
        handleSearch={handleSearch}
        searchValue={searchItem}
      />
      <Banner />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block flex-shrink-0">
            <Filters onFilterChange={handleFilterChange} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Product Grid */}
            <ProductView 
              data={productsData?.results || []} 
              category="Products" 
            />

            {/* Pagination Controls */}
            {productsData?.count > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!productsData?.previous || isFetching}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    !productsData?.previous || isFetching
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-sm text-gray-600">Page</span>
                  <span className="font-bold text-green-600">{currentPage}</span>
                  <span className="text-sm text-gray-600">of</span>
                  <span className="font-bold text-gray-800">
                    {Math.ceil(productsData?.count / 12)}
                  </span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!productsData?.next || isFetching}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    !productsData?.next || isFetching
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  Next
                </button>
              </div>
            )}

            {/* Loading indicator */}
            {isFetching && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-green-600">
                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">Loading...</span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden">
            <Filters onFilterChange={handleFilterChange} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default HomePage;