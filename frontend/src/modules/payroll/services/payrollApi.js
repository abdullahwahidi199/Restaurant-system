import instance from "../../../api/axiosInstance";

export * from "../../../api/payrollApi";

export const getPayrollStaff = () => instance.get("/users/staff/");
