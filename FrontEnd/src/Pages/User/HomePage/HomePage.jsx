import React, { useEffect, useState } from "react";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const [filterType, setFilterType] = useState("menu_order");
  const [searchItem, setSearchItem] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [filterDetails, setFilterDetails] = useState({
    type: "menu_order",
    priceRange: [0, 1000],
    categories: [],
  });

  // Update categoryId when location state changes
  useEffect(() => {
    if (location.state?.category_id) {
      setCategoryId(location.state.category_id);
      setSearchItem(""); // Clear search when category is selected
      setFilterType("menu_order"); // Reset filter
      setSearchParams({ page: "1" }); // Reset to page 1
    }
  }, [location.state?.category_id, setSearchParams]);

  // Handle Search
  const handleSearch = debounce((searchedString) => {
    setSearchItem(searchedString);
    setCategoryId(""); // Clear category when searching
    setFilterType("");
    setSearchParams({ page: "1" }); // Reset to page 1
  }, 500);

  // Handle filter change
  const handleFilterChange = (changedFilterDetails) => {
    console.log("Filter changed:", changedFilterDetails);
    setSearchItem("");
    setCategoryId("");
    setFilterType(changedFilterDetails.type);
    setFilterDetails(changedFilterDetails);
    setSearchParams({ page: "1" });
  };

  const {
    data: productsData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: [
      "products",
      categoryId,
      currentPage,
      filterType,
      searchItem,
      JSON.stringify(filterDetails),
    ],
    queryFn: async () => {
      let url = "";
      let method = "get";
      let requestData = null;

      // Priority: search > category > filter > default
      if (searchItem) {
        url = `/searchBasedProductData/${searchItem}?page=${currentPage}`;
      } else if (categoryId) {
        url = `/categoryBasedProductData/${categoryId}?page=${currentPage}`;
      } else if (
        filterType !== "menu_order" ||
        filterDetails.categories.length > 0 ||
        filterDetails.priceRange[0] !== 0 ||
        filterDetails.priceRange[1] !== 1000
      ) {
        // Use filter endpoint when any filter is applied
        url = `/filterBasedProductData?page=${currentPage}`;
        method = "post";
        requestData = filterDetails;
      } else {
        url = `indexPage?page=${currentPage}`;
      }

      const response =
        method === "post"
          ? await axiosInstance.post(url, requestData)
          : await axiosInstance.get(url);

      console.log(response);
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
                  <span className="font-bold text-green-600">
                    {currentPage}
                  </span>
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