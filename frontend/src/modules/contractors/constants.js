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

export const contractorViews = {
  dashboard: {
    title: "Contractor Dashboard",
    description: "Service invoices, payables, contracts, and contractor payment history.",
    path: "/admin/dashboard/contractors",
    label: "Dashboard",
    icon: Wrench,
  },
  invoices: {
    title: "Service Invoices",
    description: "Invoice-style contractor payable records with service line items.",
    path: "/admin/dashboard/contractors/invoices",
    label: "Invoices",
    icon: ReceiptText,
  },
  create: {
    title: "Create Contractor Invoice",
    description: "Record approved service work without touching inventory suppliers.",
    path: "/admin/dashboard/contractors/invoices/new",
    label: "Create",
    icon: FilePlus2,
  },
  contractors: {
    title: "Contractors",
    description: "Companies and people providing services to the restaurant.",
    path: "/admin/dashboard/contractors/contractors",
    label: "Contractors",
    icon: HardHat,
  },
  contracts: {
    title: "Service Contracts",
    description: "Long-term agreements connected to contractor invoices.",
    path: "/admin/dashboard/contractors/contracts",
    label: "Contracts",
    icon: ClipboardList,
  },
  payments: {
    title: "Contractor Payments",
    description: "Partial payments, references, and contractor payment trail.",
    path: "/admin/dashboard/contractors/payments",
    label: "Payments",
    icon: HandCoins,
  },
  payables: {
    title: "Contractor Payables",
    description: "Outstanding contractor balances awaiting payment.",
    path: "/admin/dashboard/contractors/payables",
    label: "Payables",
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
