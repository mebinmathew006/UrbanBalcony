import axios from 'axios';
const publicaxiosconfig = axios.create({
  baseURL: 'http://localhost:8000/user/',
  
  
});

export default publicaxiosconfig;