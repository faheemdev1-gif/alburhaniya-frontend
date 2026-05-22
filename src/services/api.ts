// src/services/api.ts
// Central Axios instance used by all service files.

import axios from 'axios';
import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('communitas_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handler — redirect to login on 401
api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('communitas_token');
    }
    return Promise.reject(err);
  }
);

export default api;