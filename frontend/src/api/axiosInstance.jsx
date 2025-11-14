// src/auth/axiosInstance.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;
const instance = axios.create({
  baseURL: BASE_URL,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

instance.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem('authTokens') || 'null');
  if (tokens?.access) {
    config.headers['Authorization'] = `Bearer ${tokens.access}`;
  }
  return config;
}, (error) => Promise.reject(error));

instance.interceptors.response.use((res) => res, async (err) => {
  const originalRequest = err.config;
  if (err.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    const tokens = JSON.parse(localStorage.getItem('authTokens') || 'null');
    if (!tokens?.refresh) {
      // no refresh token: logout
      localStorage.removeItem('authTokens');
      localStorage.removeItem('user');
      window.location.href = '/staff-login';
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise(function(resolve, reject) {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        return axios(originalRequest);
      }).catch(e => Promise.reject(e));
    }

    isRefreshing = true;
    try {
      const response = await axios.post(`${BASE_URL}/users/token/refresh/`, {
        refresh: tokens.refresh,
      });
      const newAccess = response.data.access;
      const newTokens = { access: newAccess, refresh: tokens.refresh };
      localStorage.setItem('authTokens', JSON.stringify(newTokens));
      processQueue(null, newAccess);
      originalRequest.headers['Authorization'] = 'Bearer ' + newAccess;
      return axios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem('authTokens');
      localStorage.removeItem('user');
      window.location.href = '/staff-login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
  return Promise.reject(err);
});

export default instance;
