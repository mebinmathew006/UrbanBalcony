import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import { debounce } from "lodash";
import Header from "../../../Components/Header/Header";
import Footer from "../../../Components/Footer/Footer";
import ProductView from "../../../Components/ProductView/ProductView";
import Filters from "../../../Components/Filters/Filters";
import publicaxiosconfig from "../../../Publicaxiosconfig";

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
      // <div className="flex justify-center items-center min-h-screen">
      //   <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      // </div>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 p-6">
            <h1 className="text-3xl font-bold text-white text-center">
              Spice Lush
            </h1>
          </div>

          <div className="p-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Our Website is Coming Soon
              </h2>
              <p className="text-gray-600">
                We're working hard to bring you an amazing experience. Stay
                tuned!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  About Us
                </h3>
                <p className="text-gray-600 mb-3">
                  Founded in 2025, Spice Lush is dedicated to revolutionizing
                  the spice industry by delivering premium-quality, sustainably
                  sourced spices that inspire culinary creativity. Our team of
                  seasoned experts brings decades of experience in agriculture,
                  food science, and global trade to craft products that elevate
                  flavors and make a meaningful impact in kitchens worldwide. At
                  Spice Lush, we are committed to innovation, authenticity, and
                  sustainability, ensuring that every spice we offer tells a
                  story of rich heritage and unmatched quality. Whether you're a
                  home cook or a professional chef, our spices are designed to
                  transform your dishes into unforgettable experiences.
                </p>
                <p className="text-gray-600">
                Welcome to <b>Spice Lush </b> – where tradition meets innovation, and every flavor tells a story.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Our Services
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    • Service 1: Retail
                  </li>
                  <li>
                    • Service 2: Wholesale
                  </li>
                  <li>
                    • Service 3: Exporting
                  </li>
                  <li>
                    • Service 4: Importing
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 mb-2">
                    <strong>Email:</strong> lushspices@gmail.com
                  </p>
                  <p className="text-gray-600 mb-2">
                    <strong>Phone:</strong> +91 807 8876 693
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2">
                    <strong>Address:</strong> Vellaramkunnu P.O Kumily,Thekkady,Kerala ,India
                  </p>
                  <p className="text-gray-600">
                    <strong>Hours:</strong> Sunday-Saturday, 9AM-9PM
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Stay Connected
              </h3>
              <div className="flex justify-center space-x-4 mb-6">
                <a href="https://www.facebook.com/profile.php?id=61573502279442" target="blank" className="p-2 bg-blue-500 text-white rounded-full">
                  Facebook
                </a>
                <a href="https://x.com/spice_lush" target="blank" className="p-2 bg-blue-400 text-white rounded-full">
                  Twitter
                </a>
                <a href="https://www.instagram.com/spice._.lush/" target="blank" className="p-2 bg-pink-500 text-white rounded-full">
                  Instagram
                </a>
                <a href="www.linkedin.com/in/spice-lush-565169353" target="blank" className="p-2 bg-blue-700 text-white rounded-full">
                  LinkedIn
                </a>
              </div>

              {/* <div className="mb-6">
                <p className="text-gray-600 mb-3">
                  
                </p>
                <div className="flex max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg">
                    Subscribe
                  </button>
                </div>
              </div> */}
            </div>
          </div>

          <div className="bg-gray-800 text-white p-4 text-center">
            <p>&copy; 2025 Spice Lush. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      // <div className="text-red-500 text-center p-4">Error: {error.message}</div>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 p-6">
            <h1 className="text-3xl font-bold text-white text-center">
              Spice Lush
            </h1>
          </div>

          <div className="p-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Our Website is Coming Soon
              </h2>
              <p className="text-gray-600">
                We're working hard to bring you an amazing experience. Stay
                tuned!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  About Us
                </h3>
                <p className="text-gray-600 mb-3">
                  Founded in 2024, Spice Lush is dedicated to revolutionizing
                  the spice industry by delivering premium-quality, sustainably
                  sourced spices that inspire culinary creativity. Our team of
                  seasoned experts brings decades of experience in agriculture,
                  food science, and global trade to craft products that elevate
                  flavors and make a meaningful impact in kitchens worldwide. At
                  Spice Lush, we are committed to innovation, authenticity, and
                  sustainability, ensuring that every spice we offer tells a
                  story of rich heritage and unmatched quality. Whether you're a
                  home cook or a professional chef, our spices are designed to
                  transform your dishes into unforgettable experiences.
                </p>
                <p className="text-gray-600">
                Welcome to <b>Spice Lush </b> – where tradition meets innovation, and every flavor tells a story.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Our Services
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    • Service 1: Retail
                  </li>
                  <li>
                    • Service 2: Wholesale
                  </li>
                  <li>
                    • Service 3: Exporting
                  </li>
                  <li>
                    • Service 4: Importing
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 mb-2">
                    <strong>Email:</strong> lushspices@gmail.com
                  </p>
                  <p className="text-gray-600 mb-2">
                    <strong>Phone:</strong> +91 807 8876 693
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2">
                    <strong>Address:</strong> Vellaramkunnu P.O Kumily,Thekkady,Kerala ,India
                  </p>
                  <p className="text-gray-600">
                    <strong>Hours:</strong> Sunday-Saturday, 9AM-9PM
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Stay Connected
              </h3>
              <div className="flex justify-center space-x-4 mb-6">
                <a href="https://www.facebook.com/profile.php?id=61573502279442" className="p-2 bg-blue-500 text-white rounded-full">
                  Facebook
                </a>
                <a href="https://x.com/spice_lush" className="p-2 bg-blue-400 text-white rounded-full">
                  Twitter
                </a>
                <a href="https://www.instagram.com/spice._.lush/" className="p-2 bg-pink-500 text-white rounded-full">
                  Instagram
                </a>
                <a href="www.linkedin.com/in/spice-lush-565169353" className="p-2 bg-blue-700 text-white rounded-full">
                  LinkedIn
                </a>
              </div>

              {/* <div className="mb-6">
                <p className="text-gray-600 mb-3">
                  
                </p>
                <div className="flex max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg">
                    Subscribe
                  </button>
                </div>
              </div> */}
            </div>
          </div>

          <div className="bg-gray-800 text-white p-4 text-center">
            <p>&copy; 2025 Spice Lush. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        page="index"
        handleSearch={handleSearch}
        searchValue={searchItem}
      />
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

export default IndexPage;
