import axios from 'axios';
import store from './store/store';
import { destroyDetails,setUserDetails } from './store/UserDetailsSlice'; // Adjust the path as needed
import history from './history';
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/user/',
  withCredentials: true, // Ensures cookies are sent with requests
});

// Attach the access token from Redux to the headers of each request
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.userDetails?.access_token; // Adjust the path based on your Redux state structure

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error) 
);

// Handle responses and refresh token logic
axiosInstance.interceptors.response.use(
  (response) => response, // Pass successful responses directly
  async (error) => {
    const originalRequest = error.config;
    // Check if the error is due to an expired access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the access token using the refresh token stored in an HttpOnly cookie
        const response = await axios.post('http://localhost:8000/user/refresh_token', {}, {
          withCredentials: true, // Send cookies with the request
        });
        const userDetails=response.data.user
        store.dispatch(setUserDetails(userDetails));
        // Update the original request's Authorization header with the new token
        originalRequest.headers['Authorization'] = `Bearer ${userDetails.access_token}`;  

        // Retry the original request with the refreshed token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        toast.error("Session expired. Please log in again", {
                position: "bottom-center",
              });
        // If refresh fails, clear Redux state and redirect to login
        store.dispatch(destroyDetails());
        const response = await axios.post('http://localhost:8000/user/userLogout');
        history.push('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
