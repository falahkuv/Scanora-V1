import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Setup silent auth using device_id
export const initializeAuth = async () => {
  let deviceId = localStorage.getItem('device_id');
  let token = localStorage.getItem('token');

  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('device_id', deviceId);
  }

  if (!token) {
    const email = `${deviceId}@scanora.app`;
    const password = deviceId;
    const name = `Sobat ${deviceId.substring(0, 4)}`;

    try {
      // Try to login first
      const loginRes = await api.post('/auth/login', { email, password });
      token = loginRes.data.data.token;
    } catch (err) {
      // If login fails, try to register
      try {
        const regRes = await api.post('/auth/register', { name, email, password });
        token = regRes.data.data.token;
      } catch (regErr) {
        console.error("Failed to silently authenticate", regErr);
        return false;
      }
    }
    
    if (token) {
      localStorage.setItem('token', token);
    }
  }

  // Set default header
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  return true;
};

// Add interceptor to handle token injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
