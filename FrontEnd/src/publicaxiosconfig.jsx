import axios from 'axios';

const publicaxiosconfig = axios.create({
  baseURL: 'http://localhost:8000/user/',
  withCredentials: true,
  
});
export default publicaxiosconfig;

