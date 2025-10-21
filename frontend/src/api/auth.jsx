// src/api/auth.js
import axios from "axios";

const API_URL = "http://127.0.0.1:8000"; // Django backend base

export const api = axios.create({
  baseURL: API_URL,
});

// Add JWT token automatically to requests
api.interceptors.request.use((config) => {
  const access = localStorage.getItem("access");
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// Try to refresh token if access expires
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/api/token/refresh/`, {
            refresh,
          });
          localStorage.setItem("access", res.data.access);
          original.headers.Authorization = `Bearer ${res.data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("username");
        }
      }
    }
    return Promise.reject(err);
  }
);
