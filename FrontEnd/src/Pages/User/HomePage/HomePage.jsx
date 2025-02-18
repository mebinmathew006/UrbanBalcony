import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "../../../Components/Header/Header";
import Footer from "../../../Components/Footer/Footer";
import axiosInstance from "../../../axiosconfig";
import ProductView from "../../../Components/ProductView/ProductView";
import Filters from "../../../Components/Filters/Filters";
import { useLocation, useSearchParams } from "react-router-dom";
import { debounce } from "lodash";

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
    category_id=''
    setFilterType('')
  }, 500);

  // Handle filter change
  const handleFilterChange = (changedFilterDetails) => {
    setSearchItem('')
    category_id=''
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
        console.log(searchItem,'is serched',url);
        
      } else {
        url =`/?page=${currentPage}`;
      }
      const response = await axiosInstance.get(url);
      
      return response.data;
    },
    keepPreviousData: true, // Keep previous page's data while fetching next page
  });

  // Handle page change
  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
  };

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
    <div>
      <Header page="home" handleSearch={handleSearch} searchValue={searchItem} />
      <div className="flex  bg-[#FCF4D2]">
        <Filters onFilterChange={handleFilterChange} />
        <div className="flex-1">
          <ProductView data={productsData?.results || []} category="Products" />

          {/* Pagination Controls */}
          <div className="flex justify-center gap-2 my-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!productsData?.previous || isFetching}
              className={`px-4 py-2 rounded ${
                !productsData?.previous || isFetching
                  ? "bg-gray-400"
                  : "bg-[#467927] hover:bg-green-500 text-white"
              }`}
            >
              Previous
            </button>

            <span className="px-4 py-2">
              Page {currentPage} of {Math.ceil(productsData?.count / 12)}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!productsData?.next || isFetching}
              className={`px-4 py-2 rounded ${
                !productsData?.next || isFetching
                  ? "bg-gray-400"
                  : "bg-[#467927] hover:bg-green-500 text-white"
              }`}
            >
              Next
            </button>
          </div>

          {/* Loading indicator for next page */}
          {isFetching && (
            <div className="text-center text-gray-500">Loading more...</div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default HomePage;
