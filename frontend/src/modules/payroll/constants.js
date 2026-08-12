import { CreditCard, FilePlus2, HandCoins, ReceiptText, Wallet } from "lucide-react";
import { monthStartISO, todayISO } from "../shared/erp/formatters";

export const payrollViews = {
  dashboard: {
    title: "Payroll Dashboard",
    description: "Salary cost, outstanding salaries, upcoming payroll, and recent payments.",
    path: "/admin/dashboard/payroll",
    label: "Dashboard",
    icon: Wallet,
  },
  run: {
    title: "Payroll Runs",
    description: "Generate monthly or weekly payroll from staff salary profiles.",
    path: "/admin/dashboard/payroll/run",
    label: "Run Payroll",
    icon: FilePlus2,
  },
  records: {
    title: "Payroll Records",
    description: "Approve salaries, record partial payments, and review balances.",
    path: "/admin/dashboard/payroll/records",
    label: "Records",
    icon: ReceiptText,
  },
  advances: {
    title: "Salary Advances",
    description: "Record employee advances and apply them to the next payroll run.",
    path: "/admin/dashboard/payroll/advances",
    label: "Advances",
    icon: HandCoins,
  },
  payments: {
    title: "Payroll Payments",
    description: "Cash flow history for salary payments.",
    path: "/admin/dashboard/payroll/payments",
    label: "Payments",
    icon: CreditCard,
  },
  employee: {
    title: "Employee Salary Profile",
    description: "Salary profile, payroll history, payment history, and advances.",
    path: "/admin/dashboard/payroll/employees",
    label: "Employee",
    icon: Wallet,
  },
};

export const payrollTabs = ["dashboard", "run", "records", "advances", "payments"].map((key) => ({
  key,
  label: payrollViews[key].label,
  to: payrollViews[key].path,
  icon: payrollViews[key].icon,
}));

export const blankWizard = {
  period_type: "monthly",
  period_start: monthStartISO(),
  period_end: todayISO(),
  bonus: "",
  overtime_hours: "",
  regular_days: "",
  regular_hours: "",
  notes: "",
  staff_ids: [],
};

export const blankAdvance = {
  staff_id: "",
  date: todayISO(),
  amount: "",
  reason: "",
  notes: "",
};

export const blankPayment = {
  payroll: "",
  date: todayISO(),
  amount: "",
  payment_method: "cash",
  reference_number: "",
  notes: "",
};

export const salaryDefaults = {
  salary_type: "monthly",
  payroll_base_salary: "",
  payment_day: 1,
  payroll_allowances: "",
  payroll_deductions: "",
  overtime_rate: "",
  payroll_notes: "",
  is_payroll_active: true,
};
