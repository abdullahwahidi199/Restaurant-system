import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  approvePayroll,
  createPayrollPayment,
  createSalaryAdvance,
  generatePayroll,
  getPayroll,
  getPayrollDashboard,
  getAllPayrollPayments,
  getAllPayrolls,
  getPayrollStaff,
  getAllSalaryAdvances,
  getStaffPayrollHistory,
  updateStaffSalaryProfile,
} from "../services/payrollApi";
import { blankAdvance, blankPayment, blankWizard, salaryDefaults } from "../constants";
import { listFrom, todayISO } from "../../shared/erp/formatters";
import i18n from "../../../i18n";

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
  const moduleRequestRef = useRef(0);
  const payrollRequestRef = useRef(0);
  const paymentRequestRef = useRef(0);
  const advanceRequestRef = useRef(0);
  const previousRecordFiltersRef = useRef({ search: "", status: "", period_type: "" });
  const previousPaymentSearchRef = useRef("");
  const previousAdvanceSearchRef = useRef("");

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
    const isHtmlError = typeof detail === "string" && /<!doctype\s+html|<html[\s>]/i.test(detail);
    setError(typeof detail === "string" && !isHtmlError ? detail : fallback);
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
    const request = ++payrollRequestRef.current;
    try {
      const allPayrolls = await getAllPayrolls({
        search: recordFilters.search || undefined,
        status: recordFilters.status || undefined,
        period_type: recordFilters.period_type || undefined,
      });
      if (request === payrollRequestRef.current) setPayrolls(allPayrolls);
    } catch (err) {
      if (request === payrollRequestRef.current) {
        handleApiError(err, "Failed to refresh payroll records.");
      }
    }
  }, [handleApiError, recordFilters.period_type, recordFilters.search, recordFilters.status]);

  const loadPayments = useCallback(async () => {
    const request = ++paymentRequestRef.current;
    try {
      const allPayments = await getAllPayrollPayments({ search: paymentSearch || undefined });
      if (request === paymentRequestRef.current) setPayments(allPayments);
    } catch (err) {
      if (request === paymentRequestRef.current) {
        handleApiError(err, "Failed to refresh payroll payments.");
      }
    }
  }, [handleApiError, paymentSearch]);

  const loadAdvances = useCallback(async () => {
    const request = ++advanceRequestRef.current;
    try {
      const allAdvances = await getAllSalaryAdvances({ search: advanceSearch || undefined });
      if (request === advanceRequestRef.current) setAdvances(allAdvances);
    } catch (err) {
      if (request === advanceRequestRef.current) {
        handleApiError(err, "Failed to refresh salary advances.");
      }
    }
  }, [advanceSearch, handleApiError]);

  const loadModule = useCallback(async () => {
    const moduleRequest = ++moduleRequestRef.current;
    const payrollRequest = ++payrollRequestRef.current;
    const paymentRequest = ++paymentRequestRef.current;
    const advanceRequest = ++advanceRequestRef.current;
    setLoading(true);
    setError("");
    try {
      const [dashboardRes, staffRes, allPayrolls, allPayments, allAdvances] = await Promise.all([
        getPayrollDashboard(),
        getPayrollStaff(),
        getAllPayrolls(),
        getAllPayrollPayments(),
        getAllSalaryAdvances(),
      ]);
      if (moduleRequest !== moduleRequestRef.current) return;
      setDashboard(dashboardRes.data);
      setStaff(Array.isArray(staffRes.data) ? staffRes.data : listFrom(staffRes.data));
      if (payrollRequest === payrollRequestRef.current) setPayrolls(allPayrolls);
      if (paymentRequest === paymentRequestRef.current) setPayments(allPayments);
      if (advanceRequest === advanceRequestRef.current) setAdvances(allAdvances);
    } catch (err) {
      if (moduleRequest === moduleRequestRef.current) {
        handleApiError(err, "Failed to load payroll module.");
      }
    } finally {
      if (moduleRequest === moduleRequestRef.current) setLoading(false);
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
  useEffect(() => {
    void loadModule();
    return () => {
      moduleRequestRef.current += 1;
      payrollRequestRef.current += 1;
      paymentRequestRef.current += 1;
      advanceRequestRef.current += 1;
    };
  }, [loadModule]);
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
    const previous = previousRecordFiltersRef.current;
    if (
      previous.search === recordFilters.search &&
      previous.status === recordFilters.status &&
      previous.period_type === recordFilters.period_type
    ) return;
    previousRecordFiltersRef.current = {
      search: recordFilters.search,
      status: recordFilters.status,
      period_type: recordFilters.period_type,
    };
    payrollRequestRef.current += 1;
    const delay = setTimeout(() => void loadPayrollList(), 350);
    return () => clearTimeout(delay);
  }, [loadPayrollList, recordFilters.period_type, recordFilters.search, recordFilters.status]);
  useEffect(() => {
    if (previousPaymentSearchRef.current === paymentSearch) return;
    previousPaymentSearchRef.current = paymentSearch;
    paymentRequestRef.current += 1;
    const delay = setTimeout(() => void loadPayments(), 350);
    return () => clearTimeout(delay);
  }, [loadPayments, paymentSearch]);
  useEffect(() => {
    if (previousAdvanceSearchRef.current === advanceSearch) return;
    previousAdvanceSearchRef.current = advanceSearch;
    advanceRequestRef.current += 1;
    const delay = setTimeout(() => void loadAdvances(), 350);
    return () => clearTimeout(delay);
  }, [advanceSearch, loadAdvances]);
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
      title: i18n.t("legacy.approve_payroll_32b028bb"),
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
