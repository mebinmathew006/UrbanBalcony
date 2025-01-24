import axios from 'axios';
import axiosInstance from './axiosconfig';
import store from './store/store'; 


const adminaxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/adminPanel/',
  withCredentials: true,
});

adminaxiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().userDetails.access_token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default adminaxiosInstance;


