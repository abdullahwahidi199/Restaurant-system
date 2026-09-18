import { CreditCard, FilePlus2, HandCoins, ReceiptText, Wallet } from "lucide-react";
import { monthStartISO, todayISO } from "../shared/erp/formatters";
import i18n from "../../i18n";

export const payrollViews = {
  dashboard: {
    title: i18n.t("legacy.payroll_dashboard_c1b4d92c"),
    description: i18n.t("legacy.salary_cost_outstanding_salaries_upcoming_payroll_and__482fe12b"),
    path: "/admin/dashboard/payroll",
    label: i18n.t("nav.dashboard"),
    icon: Wallet,
  },
  run: {
    title: i18n.t("legacy.payroll_runs_40cfd07c"),
    description: i18n.t("legacy.generate_monthly_or_weekly_payroll_from_staff_salary_p_64fe92a6"),
    path: "/admin/dashboard/payroll/run",
    label: i18n.t("legacy.run_payroll_e6657ad6"),
    icon: FilePlus2,
  },
  records: {
    title: i18n.t("legacy.payroll_records_ebec138d"),
    description: i18n.t("legacy.approve_salaries_record_partial_payments_and_review_ba_43d41641"),
    path: "/admin/dashboard/payroll/records",
    label: i18n.t("legacy.records_e51c5525"),
    icon: ReceiptText,
  },
  advances: {
    title: i18n.t("legacy.salary_advances_e8cda02b"),
    description: i18n.t("legacy.record_employee_advances_and_apply_them_to_the_next_pa_d2d4194f"),
    path: "/admin/dashboard/payroll/advances",
    label: i18n.t("legacy.advances_232e6c98"),
    icon: HandCoins,
  },
  payments: {
    title: i18n.t("legacy.payroll_payments_bc2648b7"),
    description: i18n.t("legacy.cash_flow_history_for_salary_payments_e90bb8f5"),
    path: "/admin/dashboard/payroll/payments",
    label: i18n.t("landing.marketplace.owner.items.payments"),
    icon: CreditCard,
  },
  employee: {
    title: i18n.t("legacy.employee_salary_profile_d73e833f"),
    description: i18n.t("legacy.salary_profile_payroll_history_payment_history_and_adv_a30c631d"),
    path: "/admin/dashboard/payroll/employees",
    label: i18n.t("legacy.employee_079711ea"),
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
