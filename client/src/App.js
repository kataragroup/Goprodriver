import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/pages/Login';
import Dashboard from './components/Dashboard';
import axios from 'axios';

// Local server
axios.defaults.baseURL = 'http://localhost:7000/api';

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isAuthCall = error.config?.url?.includes('/admin/login');
            if (!isAuthCall) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    return !token ? children : <Navigate to="/dashboard" replace />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;