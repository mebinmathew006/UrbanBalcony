import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import { debounce } from "lodash";
import Header from "../../../Components/Header/Header";
import Footer from "../../../Components/Footer/Footer";
import ProductView from "../../../Components/ProductView/ProductView";
import Filters from "../../../Components/Filters/Filters";
import publicaxiosconfig from "../../../Publicaxiosconfig";
import Banner from "../../../Components/Banner/Banner";

function IndexPage() {
  const location = useLocation();
  let { category_id } = location.state || {};
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const [filterType, setFilterType] = useState("");
  const [searchItem, setSearchItem] = useState("");

  // Handle search
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
    queryKey: ["products", category_id, currentPage, filterType, searchItem],
    queryFn: async () => {
      let url = "/indexPage";
      if (category_id) {
        url = `/categoryBasedProductData/${category_id}?page=${currentPage}`;
      } else if (filterType) {
        url = `/filterBasedProductData/${filterType}?page=${currentPage}`;
      } else if (searchItem) {
        url = `/searchBasedProductData/${searchItem}?page=${currentPage}`;
      } else {
        url = `/indexPage?page=${currentPage}`;
      }
      const response = await publicaxiosconfig.get(url);
      return response.data;
    },
    keepPreviousData: true,
  });

  // Handle page change
  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
  };
  // a static page
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
      
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center p-4">Error: {error.message}</div>
    );
  }

  return (
    <div className="min-h-screen ">
      <Header
        page="home"
        handleSearch={handleSearch}
        searchValue={searchItem}
      />
      <Banner/>
      <div className="flex  ">
        <Filters onFilterChange={handleFilterChange} />
        
        <div className="flex-1">
          <ProductView data={productsData?.results || []} category="Premium Spices" />

          {/* Pagination Controls */}
          <div className="flex justify-center items-center py-8 ">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px " aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!productsData?.previous || isFetching}
                className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
                  !productsData?.previous || isFetching
                    ? "border-gray-300 bg-gray-100 text-gray-400"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              {/* Page Numbers - Basic version */}
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700">
                Page {currentPage} of {Math.ceil(productsData?.count / 12)}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!productsData?.next || isFetching}
                className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
                  !productsData?.next || isFetching
                    ? "border-gray-300 bg-gray-100 text-gray-400"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </nav>
          </div>

          {/* Loading indicator */}
          {isFetching && (
            <div className="flex justify-center items-center py-4">
              <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default IndexPage;
