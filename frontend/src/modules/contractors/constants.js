import {
  ClipboardList,
  CreditCard,
  FilePlus2,
  HandCoins,
  HardHat,
  ReceiptText,
  Wrench,
} from "lucide-react";
import { todayISO } from "../shared/erp/formatters";
import i18n from "../../i18n";

export const contractorViews = {
  dashboard: {
    title: i18n.t("legacy.contractor_dashboard_1aad2624"),
    description: i18n.t("legacy.service_invoices_payables_contracts_and_contractor_pay_aff0224e"),
    path: "/admin/dashboard/contractors",
    label: i18n.t("nav.dashboard"),
    icon: Wrench,
  },
  invoices: {
    title: i18n.t("legacy.service_invoices_7d0409f3"),
    description: i18n.t("legacy.invoice_style_contractor_payable_records_with_service__5766a86c"),
    path: "/admin/dashboard/contractors/invoices",
    label: i18n.t("inventory_manager.reports.invoices"),
    icon: ReceiptText,
  },
  create: {
    title: i18n.t("legacy.create_contractor_invoice_93229ab7"),
    description: i18n.t("legacy.record_approved_service_work_without_touching_inventor_ea02d38f"),
    path: "/admin/dashboard/contractors/invoices/new",
    label: i18n.t("inventory_manager.common.create"),
    icon: FilePlus2,
  },
  contractors: {
    title: i18n.t("landing.features.groups.finance.items.contractors"),
    description: i18n.t("legacy.companies_and_people_providing_services_to_the_restaur_c91e38fd"),
    path: "/admin/dashboard/contractors/contractors",
    label: i18n.t("landing.features.groups.finance.items.contractors"),
    icon: HardHat,
  },
  contracts: {
    title: i18n.t("legacy.service_contracts_d376d778"),
    description: i18n.t("legacy.long_term_agreements_connected_to_contractor_invoices_5fc284b5"),
    path: "/admin/dashboard/contractors/contracts",
    label: i18n.t("legacy.contracts_32767bc8"),
    icon: ClipboardList,
  },
  payments: {
    title: i18n.t("legacy.contractor_payments_e3cef71c"),
    description: i18n.t("legacy.partial_payments_references_and_contractor_payment_tra_cf494f57"),
    path: "/admin/dashboard/contractors/payments",
    label: i18n.t("landing.marketplace.owner.items.payments"),
    icon: HandCoins,
  },
  payables: {
    title: i18n.t("legacy.contractor_payables_b19d6dfa"),
    description: i18n.t("legacy.outstanding_contractor_balances_awaiting_payment_e50f6c94"),
    path: "/admin/dashboard/contractors/payables",
    label: i18n.t("legacy.payables_a4fb9796"),
    icon: CreditCard,
  },
};

export const contractorTabs = Object.entries(contractorViews).map(([key, view]) => ({
  key,
  label: view.label,
  to: view.path,
  icon: view.icon,
}));

export const serviceTypes = [
  "Electrician",
  "Plumbing",
  "AC Maintenance",
  "Kitchen Equipment",
  "Construction",
  "Cleaning",
  "Maintenance",
  "Interior Design",
  "Sign Board",
  "Installation",
  "Other",
];

export const blankInvoiceLine = () => ({
  key: `${Date.now()}-${Math.random()}`,
  service_type: "Maintenance",
  description: "",
  quantity: "1",
  unit_price: "",
});

export const blankContractor = {
  name: "",
  contact_person: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  is_active: true,
};

export const blankContract = {
  contractor: "",
  title: "",
  start_date: todayISO(),
  end_date: "",
  contract_value: "",
  status: "active",
  notes: "",
};

export const blankPayment = {
  contractor: "",
  invoice: "",
  date: todayISO(),
  amount: "",
  payment_method: "cash",
  reference_number: "",
  notes: "",
};

export const blankInvoiceForm = () => ({
  contractor: "",
  contract: "",
  invoice_number: "",
  invoice_date: todayISO(),
  due_date: "",
  status: "approved",
  amount_paid: "",
  payment_method: "cash",
  payment_reference: "",
  description: "",
  lines: [blankInvoiceLine()],
});
