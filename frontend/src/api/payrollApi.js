import instance from "./axiosInstance";
import { fetchAllPages } from "../modules/shared/erp/pagination.js";

export const getPayrollDashboard = () =>
  instance.get("/users/payrolls/dashboard/");

export const getPayrolls = (params) =>
  instance.get("/users/payrolls/", { params });

export const getAllPayrolls = (params) =>
  fetchAllPages(getPayrolls, params);

export const getPayroll = (id) =>
  instance.get(`/users/payrolls/${id}/`);

export const generatePayroll = (data) =>
  instance.post("/users/payrolls/generate/", data);

export const approvePayroll = (id) =>
  instance.post(`/users/payrolls/${id}/approve/`);

export const getPayrollPayments = (params) =>
  instance.get("/users/payroll-payments/", { params });

export const getAllPayrollPayments = (params) =>
  fetchAllPages(getPayrollPayments, params);

export const createPayrollPayment = (data) =>
  instance.post("/users/payroll-payments/", data);

export const getSalaryAdvances = (params) =>
  instance.get("/users/salary-advances/", { params });

export const getAllSalaryAdvances = (params) =>
  fetchAllPages(getSalaryAdvances, params);

export const createSalaryAdvance = (data) =>
  instance.post("/users/salary-advances/", data);

export const getStaffPayrollHistory = (id) =>
  instance.get(`/users/staff/${id}/payroll-history/`);

export const updateStaffSalaryProfile = (id, data) =>
  instance.patch(`/users/staff/${id}/`, data);
