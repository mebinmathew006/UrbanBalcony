import axios from 'axios';
import store from './store/store'; 
import { destroyDetails,setUserDetails } from './store/UserDetailsSlice'; // Adjust the path as needed
import history from './history';
import { toast } from "react-toastify";

const baseurl=import.meta.env.VITE_BASE_URL

const adminaxiosInstance = axios.create({
  baseURL: `${baseurl}/adminPanel/`,
  withCredentials: true,
});

// Attach the access token from Redux to the headers of each request
adminaxiosInstance.interceptors.request.use(
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
adminaxiosInstance.interceptors.response.use(
  (response) => response, // Pass successful responses directly
  async (error) => {
    const originalRequest = error.config;
    // Check if the error is due to an expired access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the access token using the refresh token stored in an HttpOnly cookie
        const response = await axios.post(`${baseurl}/user/refresh_token`, {}, {
          withCredentials: true, // Send cookies with the request
        });
        const userDetails=response.data.user
        store.dispatch(setUserDetails(userDetails));
        console.log(userDetails);
       
        // Update the original request's Authorization header with the new token
        originalRequest.headers['Authorization'] = `Bearer ${response.data.user.access_token}`;  
        console.log(originalRequest);
        

        // Retry the original request with the refreshed token
        return adminaxiosInstance(originalRequest);
      } catch (refreshError) {
        toast.error("Please Login again", {
                position: "bottom-center",
              });
        // If refresh fails, clear Redux state and redirect to login
        store.dispatch(destroyDetails());
        const response = await axios.post(`${baseurl}/user/userLogout`);
        history.push('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default adminaxiosInstance;


