import instance from "./axiosInstance";

export const getAuditLogs = (params = {}) =>
  instance.get("/audit-logs/", { params });

export const getProductionMovements = (params = {}) =>
  instance.get("/audit-logs/production-movements/", { params });
