import React, { useState } from 'react';
import adminaxiosInstance from '../../../adminaxiosconfig';
import Sidebar from '../../../Components/Admin/Sidebar/Sidebar';

const BannerManagement = ({ banners, toggleBannerStatus }) => {
    const handleAddBanner = async (formData) => {
        try {
          const response = await adminaxiosInstance.post('/bannerManagementView', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          // Handle success (e.g., refresh banner list)
        } catch (error) {
          // Handle error
        }
      };
      
      const handleUpdateBanner = async (id, formData) => {
        try {
          const response = await adminaxiosInstance.put(`/api/banners/${id}/`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          // Handle success (e.g., refresh banner list)
        } catch (error) {
          // Handle error
        }
      };
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image: null,
    is_active: true
  });

  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      image: null,
      is_active: banner.is_active
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e, isEdit) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    if (formData.image) {
      data.append('image', formData.image);
    }
    data.append('is_active', formData.is_active);

    if (isEdit) {
      await handleUpdateBanner(selectedBanner.id, data);
      setIsEditModalOpen(false);
    } else {
      await handleAddBanner(data);
      setIsAddModalOpen(false);
    }
    
    setFormData({ title: '', image: null, is_active: true });
  };

  const Modal = ({ isOpen, onClose, title, isEdit, onSubmit }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{title}</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={(e) => onSubmit(e, isEdit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner Image
              </label>
              <input
                type="file"
                onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                accept="image/*"
                required={!isEdit}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isEdit ? 'Update' : 'Add'} Banner
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-grow">
        <main className="p-6">
          <div className="container mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">Banner Management</h3>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Banner
              </button>
            </div>

            {/* Table */}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated At
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {banners && banners.map((banner, index) => (
                    <tr key={banner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {banner.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img 
                          src={`${import.meta.env.VITE_BASE_URL_WITH_MEDIA}/media/${banner.image}`} 
                          alt={banner.title}
                          className="h-12 w-20 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(banner.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(banner.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          banner.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {banner.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleBannerStatus(banner.id)}
                            className={`px-3 py-1 rounded-md text-white text-sm ${
                              banner.is_active
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {banner.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleEdit(banner)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            {/* Modals */}
            <Modal
              isOpen={isAddModalOpen}
              onClose={() => {
                setIsAddModalOpen(false);
                setFormData({ title: '', image: null, is_active: true });
              }}
              title="Add New Banner"
              isEdit={false}
              onSubmit={handleSubmit}
            />

            <Modal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setFormData({ title: '', image: null, is_active: true });
              }}
              title="Edit Banner"
              isEdit={true}
              onSubmit={handleSubmit}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default BannerManagement;