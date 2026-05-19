import axios from 'axios';

const API = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/admin` });
API.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('adminToken'); 
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
export const fetchUsers = () => API.get('/users');
export const fetchBookings = () => API.get('/bookings');
export const verifyDriver = (data) => API.patch('/verify-driver', data);