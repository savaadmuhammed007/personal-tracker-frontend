import axios from 'axios';

// Determine API base URL
// 1. If user set a custom backend preference in localStorage (e.g. forced local or forced cloud), use it
// 2. In dev mode, use '/api' to leverage Vite's proxy (works on both localhost and mobile LAN)
// 3. In production, use VITE_API_URL or fallback to Render cloud
export const getActiveBackendUrl = () => {
  if (import.meta.env.DEV) {
    return '/api';
  }
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('active_backend_target') : null;
  if (saved === 'cloud') {
    return 'https://personal-tracker-backend-mr9z.onrender.com/api';
  }
  if (saved === 'local') {
    return 'http://127.0.0.1:8000/api';
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
    if (err.response && (err.response.status === 200 || err.response.status === 401)) {
      return { ok: true, status: err.response.status, latency: Date.now() - start, target };
    }
    return { ok: false, error: err.message, latency: Date.now() - start, target };
  }
};

// Request interceptor: attach JWT access token if present
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

// Response interceptor: auto-refresh access token on 401 using refresh_token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh') && !originalRequest.url?.includes('/auth/register')) {
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshUrl = `${API_URL}/auth/refresh/`;
          const res = await axios.post(refreshUrl, { refresh: refreshToken });
          const newAccessToken = res.data.access;

          localStorage.setItem('access_token', newAccessToken);
          if (res.data.refresh) {
            localStorage.setItem('refresh_token', res.data.refresh);
          }

          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
