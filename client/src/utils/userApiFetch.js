const LIVE_BASE  = 'http://13.206.124.146:7000/api';
const LOCAL_BASE = 'http://localhost:7000/api';

const LOCAL_ROUTES = [
  '/feedback',
  '/admin/feedback',
];

const isLocalRoute = (url) =>
  LOCAL_ROUTES.some(route => url.startsWith(route));

// ── Core fetch helper (internal) ──────────────────────────────────────────────
const _fetch = async (url, options = {}) => {
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
  const local    = isLocalRoute(cleanUrl);
  const base     = local ? LOCAL_BASE : LIVE_BASE;
  const fullUrl  = `${base}${cleanUrl}`;

  console.log(`[userApiFetch] ${options.method || 'GET'} ${fullUrl} | Live: ${!local}`);

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
      if (local) {
        console.warn('[userApiFetch] 401 on LOCAL route — logout nahi karega:', fullUrl);
        throw new Error('401: Unauthorized (local)');
      }
      console.error('[userApiFetch] 401 LIVE — token expire ho gaya, logging out');
      localStorage.clear();
      window.location.href = '/login';
      return null;
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[userApiFetch] HTTP ${res.status} → ${fullUrl}`, errText);
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    return await res.json().catch(() => null);

  } catch (err) {
    console.error('[userApiFetch] Error:', err.message);
    throw err;
  }
};

// ── default export (GET) ──────────────────────────────────────────────────────
const userApiFetch = (url, options = {}) => _fetch(url, options);

export default userApiFetch;

// ── named export: apiFetch  (UserRides.jsx ke liye) ───────────────────────────
// token param optional hai — agar pass nahi kiya toh localStorage se lega
export const apiFetch = (url, _token) => _fetch(url, {});

// ── named export: apiPost  (UserLogin.jsx ke liye) ────────────────────────────
// Login pe token nahi hota, isliye Authorization header skip karta hai
export const apiPost = async (url, body = {}) => {
  if (!url || typeof url !== 'string') return null;

  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const local    = isLocalRoute(cleanUrl);
  const base     = local ? LOCAL_BASE : LIVE_BASE;
  const fullUrl  = `${base}${cleanUrl}`;

  console.log(`[apiPost] POST ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Login route pe 401 = wrong credentials, logout mat karo
    if (res.status === 401) {
      const data = await res.json().catch(() => ({}));
      return { success: false, message: data.message || 'Unauthorized' };
    }

    return await res.json().catch(() => null);

  } catch (err) {
    console.error('[apiPost] Error:', err.message);
    throw err;
  }
};

// ── named export: fmtDate  (UserRides.jsx ke liye) ────────────────────────────
export const fmtDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
};