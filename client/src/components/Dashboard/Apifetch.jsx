const API_BASE = 'http://localhost:7000/api';

const apiFetch = async (url, options = {}) => {
  if (!url || typeof url !== 'string') return null;

  const token = localStorage.getItem('adminToken');
  if (!token) return null;

  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${API_BASE}${cleanUrl}`;

  console.log(`[apiFetch] ${options.method || 'GET'} ${fullUrl}`);

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
      localStorage.clear();
      window.location.href = '/login';
      return null;
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    return await res.json().catch(() => null);
  } catch (err) {
    console.error(`[apiFetch] Error:`, err.message);
    throw err;
  }
};

export default apiFetch;