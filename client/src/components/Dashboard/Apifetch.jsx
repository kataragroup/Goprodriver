const LIVE_BASE  = 'http://13.206.124.146:7000/api';
const LOCAL_BASE = 'http://localhost:7000/api';

// Ye routes LOCAL server pe hain — inhe LIVE pe mat bhejo
const LOCAL_ROUTES = [
  '/ride-feedbacks',
  '/admin/ride-feedbacks',
  '/feedback',
  '/admin/feedback',
  '/complaints',
  '/admin/complaints',
  '/notifications',         // <-- FIX: Yeh add kiya
  '/admin/notifications',
];

const apiFetch = async (url, options = {}) => {
  if (!url || typeof url !== 'string') return null;

  const token = localStorage.getItem('adminToken') || 
                localStorage.getItem('token') || 
                localStorage.getItem('accessToken');

  if (!token) {
    console.warn('[apiFetch] No token found');
    localStorage.clear();
    window.location.href = '/login';
    return null;
  }

  const cleanUrl = url.startsWith('/') ? url : `/${url}`;

  // FIX: pehle LOCAL check karo, baad mein LIVE decide karo
  const isLocal = LOCAL_ROUTES.some(route => cleanUrl.includes(route));
  const BASE    = isLocal ? LOCAL_BASE : LIVE_BASE;
  const fullUrl = `${BASE}${cleanUrl}`;

  console.log(`[apiFetch] ${options.method || 'GET'} ${fullUrl} | Live: ${!isLocal}`);

  try {
    const res = await fetch(fullUrl, {
      method: options.method || 'GET',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    if (res.status === 401) {
      if (isLocal) {
        // LOCAL pe 401 = logout mat karo
        console.warn('[apiFetch] 401 LOCAL — logout skip:', fullUrl);
        return null;
      }
      // LIVE pe 401 = token expire, logout karo
      console.error('[apiFetch] 401 LIVE — logging out');
      localStorage.clear();
      window.location.href = '/login';
      return null;
    }

    if (!res.ok) {
      console.error(`[apiFetch] HTTP ${res.status} → ${fullUrl}`);
      return null;
    }

    return await res.json().catch(() => null);

  } catch (err) {
    console.error(`[apiFetch] Error:`, err.message);
    return null;
  }
};

export default apiFetch;