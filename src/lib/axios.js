import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? '/api/v1/' : '/api/v1/',
  timeout: 10000,
});

export default axiosInstance;
