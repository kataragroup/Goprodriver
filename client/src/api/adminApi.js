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

// 1. Ride Feedbacks
export const fetchRideFeedbacks = () => API.get('/ride-feedbacks');

// 2. Complaints 
export const fetchComplaints = () => API.get('/complaints/getAll'); 
export const fetchComplaintById = (id) => API.get(`/complaints/${id}`);

// 3. Wallet Transactions
export const fetchWalletTransactions = () => API.get('/wallet/transaction');
export const fetchAllWallets = () => API.get('/wallet/getAllWallet');

// 4. Notifications
export const fetchAllNotifications = () => API.get('/notifications/getAll');

// 5. Address
export const fetchAllAddresses = () => API.get('/address/getAll');