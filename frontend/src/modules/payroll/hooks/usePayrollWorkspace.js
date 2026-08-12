import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  approvePayroll,
  createPayrollPayment,
  createSalaryAdvance,
  generatePayroll,
  getPayroll,
  getPayrollDashboard,
  getPayrollPayments,
  getPayrolls,
  getPayrollStaff,
  getSalaryAdvances,
  getStaffPayrollHistory,
  updateStaffSalaryProfile,
} from "../services/payrollApi";
import { blankAdvance, blankPayment, blankWizard, salaryDefaults } from "../constants";
import { listFrom, todayISO } from "../../shared/erp/formatters";

export default function usePayrollWorkspace({
  initialView = "dashboard",
  openPayrollId,
  openStaffId,
  fixedView = false,
  basePath = "/admin/dashboard",
} = {}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialView);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [staff, setStaff] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [payments, setPayments] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [employeeHistory, setEmployeeHistory] = useState(null);
  const [recordFilters, setRecordFilters] = useState({ search: "", status: "", period_type: "" });
  const [paymentSearch, setPaymentSearch] = useState("");
  const [advanceSearch, setAdvanceSearch] = useState("");
  const [wizardForm, setWizardForm] = useState(blankWizard);
  const [advanceForm, setAdvanceForm] = useState(blankAdvance);
  const [salaryForm, setSalaryForm] = useState(salaryDefaults);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [paymentForm, setPaymentForm] = useState(blankPayment);
  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const staffOptions = useMemo(
    () =>
      staff
        .filter((member) => member.is_payroll_active !== false)
        .map((member) => ({
          value: member.id,
          label: member.name,
          role: member.role,
          salary_type: member.salary_type,
          base_salary: member.payroll_base_salary,
        })),
    [staff],
  );

  const payablePayrolls = useMemo(
    () => payrolls.filter((payroll) => payroll.status !== "draft" && Number(payroll.remaining_balance || 0) > 0),
    [payrolls],
  );

  const handleApiError = useCallback((err, fallback) => {
    console.error(err);
    const detail = err?.response?.data?.detail || err?.response?.data || fallback;
    setError(typeof detail === "string" ? detail : fallback);
  }, []);

  const loadDashboard = useCallback(async () => {
    const res = await getPayrollDashboard();
    setDashboard(res.data);
  }, []);

  const loadStaff = useCallback(async () => {
    const res = await getPayrollStaff();
    setStaff(Array.isArray(res.data) ? res.data : listFrom(res.data));
  }, []);

  const loadPayrollList = useCallback(async () => {
    const res = await getPayrolls({
      page_size: 100,
      search: recordFilters.search || undefined,
      status: recordFilters.status || undefined,
      period_type: recordFilters.period_type || undefined,
    });
    setPayrolls(listFrom(res.data));
  }, [recordFilters.period_type, recordFilters.search, recordFilters.status]);

  const loadPayments = useCallback(async () => {
    const res = await getPayrollPayments({ page_size: 100, search: paymentSearch || undefined });
    setPayments(listFrom(res.data));
  }, [paymentSearch]);

  const loadAdvances = useCallback(async () => {
    const res = await getSalaryAdvances({ page_size: 100, search: advanceSearch || undefined });
    setAdvances(listFrom(res.data));
  }, [advanceSearch]);

  const loadModule = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboardRes, staffRes, payrollRes, paymentRes, advanceRes] = await Promise.all([
        getPayrollDashboard(),
        getPayrollStaff(),
        getPayrolls({ page_size: 100 }),
        getPayrollPayments({ page_size: 100 }),
        getSalaryAdvances({ page_size: 100 }),
      ]);
      setDashboard(dashboardRes.data);
      setStaff(Array.isArray(staffRes.data) ? staffRes.data : listFrom(staffRes.data));
      setPayrolls(listFrom(payrollRes.data));
      setPayments(listFrom(paymentRes.data));
      setAdvances(listFrom(advanceRes.data));
    } catch (err) {
      handleApiError(err, "Failed to load payroll module.");
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const loadPayrollDetail = useCallback(async (id) => {
    try {
      const res = await getPayroll(id);
      setSelectedPayroll(res.data);
    } catch (err) {
      handleApiError(err, "Failed to open payroll record.");
    }
  }, [handleApiError]);

  const loadEmployeeHistory = useCallback(async (id) => {
    try {
      const res = await getStaffPayrollHistory(id);
      setEmployeeHistory(res.data);
    } catch (err) {
      handleApiError(err, "Failed to load employee payroll history.");
    }
  }, [handleApiError]);

  useEffect(() => setActiveTab(initialView), [initialView]);
  useEffect(() => void loadModule(), [loadModule]);
  useEffect(() => {
    if (!openPayrollId) return;
    setActiveTab("records");
    void loadPayrollDetail(openPayrollId);
  }, [openPayrollId, loadPayrollDetail]);
  useEffect(() => {
    if (!openStaffId) return;
    setActiveTab("employee");
    void loadEmployeeHistory(openStaffId);
  }, [openStaffId, loadEmployeeHistory]);
  useEffect(() => {
    const delay = setTimeout(() => void loadPayrollList(), 350);
    return () => clearTimeout(delay);
  }, [loadPayrollList]);
  useEffect(() => {
    const delay = setTimeout(() => void loadPayments(), 350);
    return () => clearTimeout(delay);
  }, [loadPayments]);
  useEffect(() => {
    const delay = setTimeout(() => void loadAdvances(), 350);
    return () => clearTimeout(delay);
  }, [loadAdvances]);
  useEffect(() => {
    const staffMember = employeeHistory?.staff;
    if (!staffMember) return;
    setSalaryForm({
      salary_type: staffMember.salary_type || "monthly",
      payroll_base_salary: staffMember.payroll_base_salary ?? "",
      payment_day: staffMember.payment_day || 1,
      payroll_allowances: staffMember.payroll_allowances ?? "",
      payroll_deductions: staffMember.payroll_deductions ?? "",
      overtime_rate: staffMember.overtime_rate ?? "",
      payroll_notes: staffMember.payroll_notes || "",
      is_payroll_active: staffMember.is_payroll_active !== false,
    });
  }, [employeeHistory]);

  const reloadMoneyData = async () => {
    await Promise.all([loadDashboard(), loadPayrollList(), loadPayments(), loadAdvances()]);
    if (selectedPayroll?.id) await loadPayrollDetail(selectedPayroll.id);
    if (openStaffId) await loadEmployeeHistory(openStaffId);
  };

  const submitWizard = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...wizardForm,
        staff_ids: wizardForm.staff_ids,
        bonus: Number(wizardForm.bonus || 0),
        overtime_hours: Number(wizardForm.overtime_hours || 0),
        regular_days: wizardForm.regular_days || undefined,
        regular_hours: wizardForm.regular_hours || undefined,
      };
      const res = await generatePayroll(payload);
      setNotice(`${listFrom(res.data).length} payroll records generated.`);
      setWizardForm(blankWizard);
      await reloadMoneyData();
      setActiveTab("records");
      if (!fixedView) navigate(`${basePath}/payroll/records`);
    } catch (err) {
      handleApiError(err, "Failed to generate payroll.");
    } finally {
      setSaving(false);
    }
  };

  const confirmApprove = (payroll) => {
    setConfirmDialog({
      title: "Approve Payroll",
      message: `Approve payroll for ${payroll.staff_name}? This records the payroll expense in Finance.`,
      actionLabel: "Approve",
      action: () => approveSelectedPayroll(payroll),
    });
  };

  const approveSelectedPayroll = async (payroll) => {
    setSaving(true);
    setError("");
    try {
      const res = await approvePayroll(payroll.id);
      setSelectedPayroll(res.data);
      setNotice("Payroll approved.");
      setConfirmDialog(null);
      await reloadMoneyData();
    } catch (err) {
      handleApiError(err, "Failed to approve payroll.");
    } finally {
      setSaving(false);
    }
  };

  const openPaymentDialog = (payroll) => {
    setPaymentTarget(payroll);
    setPaymentForm({
      payroll: payroll.id,
      date: todayISO(),
      amount: payroll.remaining_balance || "",
      payment_method: "cash",
      reference_number: "",
      notes: "",
    });
  };

  const submitPayment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createPayrollPayment({ ...paymentForm, amount: Number(paymentForm.amount || 0) });
      setNotice("Payroll payment recorded.");
      setPaymentTarget(null);
      setPaymentForm(blankPayment);
      await reloadMoneyData();
    } catch (err) {
      handleApiError(err, "Failed to record payroll payment.");
    } finally {
      setSaving(false);
    }
  };

  const submitAdvance = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createSalaryAdvance({ ...advanceForm, amount: Number(advanceForm.amount || 0) });
      setNotice("Salary advance recorded.");
      setShowAdvanceDialog(false);
      setAdvanceForm(blankAdvance);
      await reloadMoneyData();
    } catch (err) {
      handleApiError(err, "Failed to record salary advance.");
    } finally {
      setSaving(false);
    }
  };

  const saveSalaryProfile = async (event) => {
    event.preventDefault();
    if (!employeeHistory?.staff?.id) return;
    setSaving(true);
    setError("");
    try {
      await updateStaffSalaryProfile(employeeHistory.staff.id, {
        ...salaryForm,
        payroll_base_salary: Number(salaryForm.payroll_base_salary || 0),
        payment_day: Number(salaryForm.payment_day || 1),
        payroll_allowances: Number(salaryForm.payroll_allowances || 0),
        payroll_deductions: Number(salaryForm.payroll_deductions || 0),
        overtime_rate: Number(salaryForm.overtime_rate || 0),
      });
      setNotice("Salary profile updated.");
      await loadStaff();
      await loadEmployeeHistory(employeeHistory.staff.id);
      await loadDashboard();
    } catch (err) {
      handleApiError(err, "Failed to update salary profile.");
    } finally {
      setSaving(false);
    }
  };

  const toggleWizardStaff = (staffId) => {
    setWizardForm((current) => {
      const exists = current.staff_ids.includes(staffId);
      return {
        ...current,
        staff_ids: exists ? current.staff_ids.filter((id) => id !== staffId) : [...current.staff_ids, staffId],
      };
    });
  };

  return {
    activeTab,
    setActiveTab,
    loading,
    saving,
    notice,
    error,
    setNotice,
    setError,
    dashboard,
    staff,
    payrolls,
    payments,
    advances,
    selectedPayroll,
    setSelectedPayroll,
    employeeHistory,
    recordFilters,
    setRecordFilters,
    paymentSearch,
    setPaymentSearch,
    advanceSearch,
    setAdvanceSearch,
    wizardForm,
    setWizardForm,
    advanceForm,
    setAdvanceForm,
    salaryForm,
    setSalaryForm,
    paymentTarget,
    setPaymentTarget,
    paymentForm,
    setPaymentForm,
    showAdvanceDialog,
    setShowAdvanceDialog,
    confirmDialog,
    setConfirmDialog,
    staffOptions,
    payablePayrolls,
    submitWizard,
    confirmApprove,
    openPaymentDialog,
    submitPayment,
    submitAdvance,
    saveSalaryProfile,
    toggleWizardStaff,
  };
}
