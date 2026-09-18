// src/auth/axiosInstance.js
import axios from "axios";
import { getStaffLoginPath } from "../config/appEnvironment";
import { API_BASE_URL } from "../config/runtimeConfig";

const instance = axios.create({
  baseURL: API_BASE_URL,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

instance.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem("authTokens") || "null");
    if (tokens?.access) {
      config.headers["Authorization"] = `Bearer ${tokens.access}`;
    }

    const skipBranchHeader = config.skipBranchHeader;
    delete config.skipBranchHeader;

    if (!skipBranchHeader) {
      const activeBranch = JSON.parse(
        localStorage.getItem("activeBranch") || "null",
      );
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const branchId =
        activeBranch?.id ||
        user?.active_branch?.id ||
        user?.active_branch_id ||
        null;

      if (branchId) {
        config.headers["X-Branch-ID"] = branchId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const tokens = JSON.parse(localStorage.getItem("authTokens") || "null");
      if (!tokens?.refresh) {
        // no refresh token: logout
        localStorage.removeItem("authTokens");
        localStorage.removeItem("user");
        window.location.href = getStaffLoginPath();
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return axios(originalRequest);
          })
          .catch((e) => Promise.reject(e));
      }

      isRefreshing = true;
      try {
        const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
          refresh: tokens.refresh,
        });
        const newAccess = response.data.access;
        const newTokens = {
          access: newAccess,
          refresh: response.data.refresh || tokens.refresh,
        };
        localStorage.setItem("authTokens", JSON.stringify(newTokens));
        processQueue(null, newAccess);
        originalRequest.headers["Authorization"] = "Bearer " + newAccess;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("authTokens");
        localStorage.removeItem("user");
        window.location.href = getStaffLoginPath();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  },
);

export default instance;
