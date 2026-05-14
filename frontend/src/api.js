import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// ─── Device ID helpers ────────────────────────────────────────────────────────
// Strategy: localStorage (persists across sessions) → sessionStorage (tab-level
// fallback if localStorage is blocked/cleared) → fresh UUID (last resort).
// This minimises duplicate guest rows in the database.

const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem('device_id') || sessionStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = uuidv4();
  }
  // Always persist to both so each layer can fall back on the other
  try { localStorage.setItem('device_id', deviceId); } catch (_) { /* blocked */ }
  try { sessionStorage.setItem('device_id', deviceId); } catch (_) { /* blocked */ }
  return deviceId;
};

// ─── Silent auth ──────────────────────────────────────────────────────────────
/**
 * Ensures the current device has a valid JWT token.
 * 1. If a token exists in localStorage → assume valid (interceptor handles 401).
 * 2. Else → try login with device_id credentials.
 * 3. If login 401 → register (first time on this device).
 */
export const initializeAuth = async () => {
  const deviceId = getOrCreateDeviceId();
  let token = localStorage.getItem('token');

  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return true;
  }

  const email    = `${deviceId}@scanora.app`;
  const password = deviceId;
  const name     = `Sobat ${deviceId.substring(0, 4).toUpperCase()}`;

  try {
    const loginRes = await api.post('/auth/login', { email, password });
    token = loginRes.data.data.token;
    const user  = loginRes.data.data.user;
    if (user) localStorage.setItem('user', JSON.stringify(user));
  } catch (loginErr) {
    // 401 / 404 → first time, register this device
    if (loginErr.response?.status === 401 || loginErr.response?.status === 404) {
      try {
        const regRes = await api.post('/auth/register', { name, email, password });
        token = regRes.data.data.token;
        const user = regRes.data.data.user;
        if (user) localStorage.setItem('user', JSON.stringify(user));
      } catch (regErr) {
        console.error('[Scanora] Failed to silently register device', regErr);
        return false;
      }
    } else {
      console.error('[Scanora] Unexpected auth error', loginErr);
      return false;
    }
  }

  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  return true;
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
