import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // backend URL
  headers: { 'Content-Type': 'application/json' },
});

export default api;
