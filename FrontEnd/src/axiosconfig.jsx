import axios from 'axios';
import store  from './store/store'; 
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/user/',
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().userDetails.access_token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;