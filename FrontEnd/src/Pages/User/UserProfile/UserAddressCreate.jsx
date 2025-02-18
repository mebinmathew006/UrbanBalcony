// tailwindcss
import React from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

const UserAddressCreate = ({ isOpen, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    onSave(data); // Handle save logic for creating the new address
    onClose(); // Close the modal
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 bg-white hover:text-black-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Create New Address</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Type
            </label>
            <input
              {...register("address_type", {
                required: "Address Type is required",
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
            />
            {errors.address_type && (
              <p className="text-red-500 text-sm mt-1">
                {errors.address_type.message}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              {...register("city", { required: "City is required" })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">
                {errors.city.message}
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              {...register("state", { required: "State is required" })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">
                {errors.state.message}
              </p>
            )}
          </div>

          {/* Pin Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pin Code
            </label>
            <input
              {...register("pin_code", {
                required: "Pincode is required",
                pattern: {
                  value: /^\d{6}$/,
                  message: "Pin Code must be 6 digits",
                },
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
            />
            {errors.pin_code && (
              <p className="text-red-500 text-sm mt-1">
                {errors.pin_code.message}
              </p>
            )}
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Landmark
            </label>
            <input
              {...register("land_mark", {
                required: "Landmark is required",
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
            />
            {errors.land_mark && (
              <p className="text-red-500 text-sm mt-1">
                {errors.land_mark.message}
              </p>
            )}
          </div>

          {/* Alternate Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alternate Number
            </label>
            <input
              {...register("alternate_number", {
                required: "Alternate Number is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Alternate Number must be 10 digits",
                },
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
            />
            {errors.alternate_number && (
              <p className="text-red-500 text-sm mt-1">
                {errors.alternate_number.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Create Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAddressCreate;
