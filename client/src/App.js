import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/pages/Login';
import Dashboard from './components/Dashboard';
import RideFeedbacks from './components/Dashboard/RideFeedbacks';
import AllComplaints from './components/Dashboard/AllComplaints';
import NotificationLogs from './components/Dashboard/NotificationLogs';
import axios from 'axios';

// Local server — feedback bhi yahan hai
axios.defaults.baseURL = 'http://localhost:7000/api';

// ── Request Interceptor ───────────────────────────────────────────────────────
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';

      const isAuthCall     = url.includes('/admin/login');
      const isFeedbackCall = url.includes('/feedback');   // ← LOCAL route, logout nahi
      const isComplaintsCall = url.includes('/admin/complaints');  
      const isNotificationCall = url.includes('/admin/notifications');

      if (!isAuthCall && !isFeedbackCall && !isComplaintsCall && !isNotificationCall) {
        console.warn('[axios] 401 detected — logging out. URL:', url);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      } else {
        console.warn('[axios] 401 on safe route — logout skipped. URL:', url);
      }
    }
    return Promise.reject(error);
  }
);

// ── Route Guards ──────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return !token ? children : <Navigate to="/dashboard" replace />;
};

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* FIX: ProtectedRoute ke andar daala — pehle yeh bahar tha */}
        <Route path="/admin/feedbacks" element={<ProtectedRoute><RideFeedbacks /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute><NotificationLogs /></ProtectedRoute>} />
        <Route path="/complaints" element={<ProtectedRoute><AllComplaints /></ProtectedRoute>} />
        <Route path="/admin/complaints" element={<ProtectedRoute><AllComplaints /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;