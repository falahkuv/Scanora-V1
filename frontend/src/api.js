import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});



// ─── Silent auth ──────────────────────────────────────────────────────────────
/**
 * Ensures the current device has a valid JWT token.
 * 1. If a token exists in localStorage → assume valid (interceptor handles 401).
 * 2. Else → try login with device_id credentials.
 * 3. If login 401 → register (first time on this device).
 */
export const initializeAuth = async () => {
  let token = localStorage.getItem('token');

  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      const meRes = await api.get('/auth/me');
      if (meRes.data?.data) {
        localStorage.setItem('user', JSON.stringify(meRes.data.data));
      }
    } catch (_) {
      // Keep existing user cache if profile refresh fails
    }
    return true;
  }

  return false;
};

// ─── Request interceptor — inject fresh token ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — auto re-auth on 401 ──────────────────────────────
let _reAuthPromise = null; // deduplicate concurrent 401 re-auths

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/')) {
      originalRequest._retry = true;

      // Clear stale token so initializeAuth re-runs login/register
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];

      if (!_reAuthPromise) {
        _reAuthPromise = initializeAuth().finally(() => { _reAuthPromise = null; });
      }
      await _reAuthPromise;

      const newToken = localStorage.getItem('token');
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
