import axios from 'axios';

// In production on Vercel, VITE_API_URL points to the deployed Render backend (e.g. https://attendance-api.onrender.com/api)
// In local development, falls back to http://localhost:5000/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let unauthorizedHandler = () => {};

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isLoginRequest = url.includes('/auth/login');

    if (status === 401 && !isLoginRequest) {
      unauthorizedHandler();
    }

    return Promise.reject(error);
  }
);

export default api;
