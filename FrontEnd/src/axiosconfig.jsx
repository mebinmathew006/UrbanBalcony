import axios from "axios";
import store from "./store/store";
import { destroyDetails, setUserDetails } from "./store/UserDetailsSlice"; // Adjust the path as needed
import history from "./History";
import { toast } from "react-toastify";

const baseurl = import.meta.env.VITE_BASE_URL;

const axiosInstance = axios.create({
  baseURL: `${baseurl}/user/`,
});
const refreshAxios = axios.create({
  baseURL: `${baseurl}/user/`,
  withCredentials: true,
});


// Attach the access token from Redux to the headers of each request
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.userDetails?.access_token; // Adjust the path based on your Redux state structure

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
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

    // ===== Case 1: Access token expired (your existing flow) =====
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await refreshAxios.post(
          `refresh_token`,
          {},
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        const userDetails = response.data.user;
        store.dispatch(setUserDetails(userDetails));

        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${userDetails.access_token}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        toast.error("Session expired. Please log in again", {
          position: "bottom-center",
        });
        store.dispatch(destroyDetails());
        await axios.post(`${baseurl}/user/userLogout`);
        history.push("/login");
        return Promise.reject(refreshError);
      }
    }

    // ===== Case 2: User blocked by admin =====
    // Assume backend returns 403 Forbidden with { detail: "User blocked" }
    if (
      error.response?.status === 403 &&
      error.response?.data?.detail === "User blocked"
    ) {
      toast.error("Your account has been blocked by admin.", {
        position: "bottom-center",
      });
      // Clear Redux state & logout
      store.dispatch(destroyDetails());
      await axios.post(`${baseurl}/user/userLogout`);
      history.push("/login");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
