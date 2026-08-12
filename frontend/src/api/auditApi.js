import instance from "./axiosInstance";

export const getAuditLogs = (params = {}) =>
  instance.get("/audit-logs/", { params });

