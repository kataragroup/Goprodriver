const LIVE_BASE = 'http://13.206.124.146:7000/api';
const LOCAL_BASE = 'http://localhost:7000/api';

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

  // Sab admin/ride/kyc/driver related → Live Server
  const isLive = url.includes('admin') || 
                 url.includes('ride') || 
                 url.includes('kyc') || 
                 url.includes('driver') ||
                 url.includes('dashboard');

  const BASE = isLive ? LIVE_BASE : LOCAL_BASE;

  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${BASE}${cleanUrl}`;

  console.log(`[apiFetch] ${options.method || 'GET'} ${fullUrl} | Live: ${isLive}`);

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
      console.error('[apiFetch] 401 Unauthorized');
      localStorage.clear();
      window.location.href = '/login';
      return null;
    }

    if (!res.ok) {
      console.error(`[apiFetch] HTTP ${res.status} → ${fullUrl}`);
      return null;
    }

    const data = await res.json().catch(() => null);
    return data;
  } catch (err) {
    console.error(`[apiFetch] Error:`, err.message);
    return null;
  }
};

export default apiFetch;