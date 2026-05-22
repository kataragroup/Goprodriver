const LIVE_BASE = 'http://13.206.124.146:7000/api';

/**
 * userApiFetch — Sirf User routes ke liye
 * Hamesha Live Server pe jaata hai
 * Driver ya Admin routes ko touch nahi karta
 */
const userApiFetch = async (url, options = {}) => {
  if (!url || typeof url !== 'string') return null;

  const token =
    localStorage.getItem('adminToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken');

  if (!token) {
    console.warn('[userApiFetch] No token found — redirecting to login');
    localStorage.clear();
    window.location.href = '/login';
    return null;
  }

  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const fullUrl  = `${LIVE_BASE}${cleanUrl}`;

  console.log(`[userApiFetch] ${options.method || 'GET'} ${fullUrl}`);

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
      console.error('[userApiFetch] 401 Unauthorized — token invalid ya expire ho gaya');
      localStorage.clear();
      window.location.href = '/login';
      return null;
    }

    if (!res.ok) {
      console.error(`[userApiFetch] HTTP ${res.status} → ${fullUrl}`);
      return null;
    }

    const data = await res.json().catch(() => null);
    return data;

  } catch (err) {
    console.error('[userApiFetch] Network Error:', err.message);
    return null;
  }
};

export default userApiFetch;