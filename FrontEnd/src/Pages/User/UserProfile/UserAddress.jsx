import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import UserAddressEdit from "./UserAddressEdit";
import UserAddressCreate from "./UserAddressCreate";
import { toast } from "react-toastify";
import Pagination from "../../../Components/Pagination/Pagination";
import Swal from "sweetalert2";

function UserAddress() {
  const user_id = useSelector((state) => state.userDetails.id);

  const [userAddress, setUserAddress] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Items per page

  const fetchUserAddress = async (page = 1) => {
    const response = await axiosInstance.get(
      `userAddress/${user_id}?page=${page}`
    );
    // setUserAddress(response.data);
    setUserAddress(response.data.results);
    setTotalCount(response.data.count);
    setTotalPages(Math.ceil(response.data.count / pageSize));
    setCurrentPage(page);
  };

  const handleEditClick = (address) => {
    setSelectedAddress(address); // Set the selected address
    setIsModalOpen(true);
  };
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Delete Address",
        text: "Are you sure?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        customClass: {
          popup: "rounded-2xl shadow-2xl backdrop-blur-sm",
          header: "border-b-0 pb-2",
          title: "text-2xl font-bold text-gray-900 mb-2",
          htmlContainer: "text-gray-600 leading-relaxed text-base",
          actions: "gap-3 mt-6",
          confirmButton:
            "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-8 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 border-0",
          cancelButton:
            "bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-8 py-3 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 border-0",
          icon: "border-4 border-blue-100 text-blue-500",
        },
        buttonsStyling: false, 
        backdrop: `
            rgba(0,0,0,0.5)
            left top
            no-repeat
          `,
        showClass: {
          popup: "animate-fade-in-up",
        },
        hideClass: {
          popup: "animate-fade-out",
        },
        width: "28rem",
        padding: "2rem",
        color: "#1f2937",
        background: "#ffffff",
      });
      if (!result.isConfirmed) return;

      const response = await axiosInstance.patch(`userAddress/${id}`);
      toast.success("Address Deleted Successfully", {
        position: "bottom-center",
      });

      fetchUserAddress();
    } catch (error) {
      toast.error("Unable to Delete the Address", {
        position: "bottom-center",
      });
    }
  };
  const handleUserCreation = async (newAddress) => {
    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("address_type", newAddress.address_type);
    formData.append("city", newAddress.city);
    formData.append("state", newAddress.state);
    formData.append("pin_code", newAddress.pin_code);
    formData.append("land_mark", newAddress.land_mark);
    formData.append("alternate_number", newAddress.alternate_number);

    try {
      const response = await axiosInstance.post(`userAddress`, formData);
      console.log(response);

      if (response.status === 201) {
        fetchUserAddress(); // Refresh the address list
        setIsCreateModalOpen(false); // Close the modal
      }
      toast.success("Address Added Successfully", {
        position: "bottom-center",
      });
    } catch (error) {
      console.error(error);
    }
  };
  // save the updated user data from the modal
  const handleSave = async (updatedAddress) => {
    // Handle the updated user data here
    const formData = new FormData();
    // Append other fields
    formData.append("id", updatedAddress.id);
    formData.append("address_type", updatedAddress.address_type);
    formData.append("city", updatedAddress.city);
    formData.append("state", updatedAddress.state);
    formData.append("pin_code", updatedAddress.pin_code);
    formData.append("land_mark", updatedAddress.land_mark);
    formData.append("alternate_number", updatedAddress.alternate_number);

    // sending the updated address to the backend

    try {
      const response = await axiosInstance.put(
        `userAddress/${updatedAddress.id}`,
        formData
      );
      if (response.status === 200) {
        // or whatever success status your API returns
        fetchUserAddress(); // Refresh the address list
        setIsModalOpen(false); // Close the modal
      }
    } catch (error) {
      console.error(error);
    }
  };
  // ----------------------------------

  useEffect(() => {
    fetchUserAddress();
  }, []);

  const handlePageChange = (page) => {
    fetchUserAddress(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="address-content  rounded-xl">
      <UserAddressCreate
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleUserCreation}
      />

      <UserAddressEdit
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAddress(null); // Clear selection when closing
        }}
        userAddress={selectedAddress} // Pass the selected address instead of the array
        onSave={handleSave}
      />
      <div className="flex items-center justify-between px-6 py-4 rounded-lg   mb-6">
        <h3 className="text-2xl  font-semibold text-gray-800">
          Address Management
        </h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-[#467927] hover:bg-[#386020] text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          New Address
        </button>
      </div>
      {userAddress &&
        userAddress.map((address, index) => {
          return (
            <div className="card mb-3 " key={index}>
              <div className="card-body ">
                <h5 className="card-title">{address.address_type} Address</h5>
                <p className="card-text">
                  {address.city} {address.state}
                  <br />
                  {address.land_mark} {address.pin_code}
                  <br />
                  {address.alternate_number}
                </p>
                <div className="btn-group">
                  <button
                    onClick={() => handleEditClick(address)} // Pass the specific address
                    className="btn btn-sm btn-outline-primary"
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(address.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <hr />
            </div>
          );
        })}

      {/* Pagination Component */}
      <div className="px-4 pb-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          maxPageButtons={10 / 2}
          size="md"
        />
      </div>
    </div>
  );
}

export default UserAddress;
