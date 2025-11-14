// src/api/auth.jsx
import axios from "axios";

 

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});
const API_URL = import.meta.env.VITE_API_URL;


export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;

  try {
    const res = await axios.post(`${API_URL}/customer/token/refresh/`, {
      refresh,
    });
    localStorage.setItem("access_token", res.data.access);
    return res.data.access;
  } catch (err) {
    console.error("Token refresh failed:", err);
    logoutCustomer(); 
    return null;
  }
};


api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest); 
      }
    }

    return Promise.reject(error);
  }
);


export const signupCustomer = async (data) => {
  return await api.post("/customer/signup/", data);
};

export const loginCustomer = async (data) => {
  return await api.post("/customer/login/", data);
};

export const getProfile = async () => {
  return await api.get("/customer/profile");
};

export const logoutCustomer = () => {
  localStorage.removeItem("customer")
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  
};

export default api;
