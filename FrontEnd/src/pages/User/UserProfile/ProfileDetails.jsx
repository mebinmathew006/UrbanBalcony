import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axiosconfig";
import UserEditDetails from "./UserEditDetails";
import { Component } from "lucide-react";
function ProfileDetails() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // save the updated user data from the modal
  const handleSave = async (updatedUserData) => {
    // Handle the updated user data here
    const formData = new FormData();

    // Append other fields
    formData.append("first_name", updatedUserData.first_name);
    formData.append("last_name", updatedUserData.last_name);
    formData.append("email", updatedUserData.email);
    formData.append("phone_number", updatedUserData.phone_number);

    // Append the file (profile picture)
    if (
      updatedUserData.profile_picture &&
      updatedUserData.profile_picture.length > 0
    ) {
      formData.append("profile_picture", updatedUserData.profile_picture[0]);
    }
    // sending the updated user data to the backend
    try {
      const response = await axiosInstance.put(
        `userDetails/${user_id}`,
        formData
      );
    } catch (error) {
      console.error(error);
    }
  };

  const user_id = useSelector((state) => state.userDetails.id);
  const [user, setUser] = useState({});

  

  useEffect(() => {
    
    const fetchUserDetails = async () => {
      const response = await axiosInstance.get(`userDetails/${user_id}`);
      setUser(response.data);
    };
      fetchUserDetails();
  }, []);

  return (
    <div className="p-6 bg-gray-50 rounded-md shadow-md">
      <UserEditDetails
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onSave={handleSave}
      />

      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Profile Information
      </h3>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <div className="flex justify-center items-center mb-4">
          <div className="flex flex-col items-center">
            <img
              src={`http://localhost:8000/${user.profile_picture}`}
              className="w-24 h-24 rounded-full border-2 border-gray-300"
              alt="Profile"
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center">
            <h6 className="text-sm font-medium text-gray-600">Full Name</h6>
            <p className="text-gray-800">
              {user.first_name} {user.last_name}
            </p>
          </div>
        </div>
        <hr className="border-gray-200 my-4" />
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <h6 className="text-sm font-medium text-gray-600">Email</h6>
            <p className="text-gray-800">{user.email}</p>
          </div>
        </div>
        <hr className="border-gray-200 my-4" />
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <h6 className="text-sm font-medium text-gray-600">Phone</h6>
            <p className="text-gray-800">{user.phone_number}</p>
          </div>
        </div>
        <hr className="border-gray-200 my-4" />

        <hr className="border-gray-200 my-4" />
        <div className="text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileDetails;
