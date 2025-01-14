import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import UserAddressEdit from "./UserAddressEdit";
import UserAddressCreate from "./UserAddressCreate";

function UserAddress() {
  const user_id = useSelector((state) => state.userDetails.id);

  const [userAddress, setUserAddress] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const handleEditClick = (address) => {
    setSelectedAddress(address); // Set the selected address
    setIsModalOpen(true);
  };
  const handleDelete = async (id) => {
    try {
      const response = await axiosInstance.patch(`userAddress/${id}`);
      fetchUserAddress();
    } catch (error) {}
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

  const fetchUserAddress = async () => {
    const response = await axiosInstance.get(`userAddress/${user_id}`);
    setUserAddress(response.data);
  };

  return (
    <div className="address-content">
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
      <div className="d-flex gap-10 align-items-center justify-center">
        <h3>Address Management</h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
        >
          Add New Address
        </button>
      </div>

      {userAddress &&
        userAddress.map((address, index) => {
          return (
            <div className="card mb-3" key={index}>
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
            </div>
          );
        })}
    </div>
  );
}

export default UserAddress;
