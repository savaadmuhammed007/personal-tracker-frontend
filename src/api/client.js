import axios from 'axios';

// Determine API base URL
// 1. If user set a custom backend preference in localStorage (e.g. forced local or forced cloud), use it
// 2. In dev mode, use '/api' to leverage Vite's proxy (works on both localhost and mobile LAN)
// 3. In production, use VITE_API_URL or fallback to Render cloud
export const getActiveBackendUrl = () => {
  const saved = localStorage.getItem('active_backend_target');
  if (saved === 'cloud') {
    return 'https://personal-tracker-backend-mr9z.onrender.com/api';
  }
  if (saved === 'local') {
    return 'http://127.0.0.1:8000/api';
  }
  if (import.meta.env.DEV) {
    return '/api';
  }
  const prodUrl = import.meta.env.VITE_API_URL || 'https://personal-tracker-backend-mr9z.onrender.com';
  return prodUrl.endsWith('/api') ? prodUrl : `${prodUrl.replace(/\/$/, '')}/api`;
};

export const API_URL = getActiveBackendUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 45000, // 45 seconds to gracefully accommodate Render free-tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkBackendHealth = async (overrideUrl) => {
  const target = overrideUrl || API_URL;
  const start = Date.now();
  try {
    const res = await axios.get(`${target}/auth/me/`, { timeout: 8000 });
    return { ok: true, status: res.status, latency: Date.now() - start, target };
  } catch (err) {
    // 401 Unauthorized means the server IS connected and responding!
    if (err.response && err.response.status === 401) {
      return { ok: true, status: 401, latency: Date.now() - start, target };
    }
    return { ok: false, error: err.message, latency: Date.now() - start, target };
  }
};

// Request interceptor to attach JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh/`, { refresh: refreshToken });
          if (res.data?.access) {
            localStorage.setItem('access_token', res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          // Token expired or invalid -> clear tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
