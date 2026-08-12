import {
  CreditCard,
  FilePlus2,
  ReceiptText,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import { todayISO } from "../shared/erp/formatters";

export const procurementViews = {
  dashboard: {
    title: "Procurement Dashboard",
    description: "Daily purchasing, supplier balances, invoices, and payable activity.",
    path: "/procurement",
    label: "Dashboard",
    icon: ShoppingCart,
  },
  create: {
    title: "Create Purchase Invoice",
    description: "Receive purchased stock and create the matching supplier payable.",
    path: "/procurement/purchase-invoices/new",
    label: "Create",
    icon: FilePlus2,
  },
  invoices: {
    title: "Purchase Invoices",
    description: "Review supplier invoices, attachments, payments, and stock posting.",
    path: "/procurement/purchase-invoices",
    label: "Invoices",
    icon: ReceiptText,
  },
  suppliers: {
    title: "Suppliers",
    description: "Manage supplier profiles, balances, and ledger history.",
    path: "/procurement/suppliers",
    label: "Suppliers",
    icon: Users,
  },
  payments: {
    title: "Supplier Payments",
    description: "Record partial payments and print supplier payment vouchers.",
    path: "/procurement/supplier-payments",
    label: "Payments",
    icon: Wallet,
  },
  payables: {
    title: "Outstanding Payables",
    description: "Track unpaid supplier invoices and balances due.",
    path: "/procurement/payables",
    label: "Payables",
    icon: CreditCard,
  },
};

export const procurementTabs = Object.entries(procurementViews).map(([key, view]) => ({
  key,
  label: view.label,
  to: view.path,
  icon: view.icon,
}));

export const blankLine = () => ({
  key: `${Date.now()}-${Math.random()}`,
  ingredient: "",
  quantity: "",
  unit_price: "",
  total_price: "",
});

export const blankSupplier = {
  name: "",
  contact_person: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  is_active: true,
};

export const blankPayment = {
  supplier: "",
  purchase_invoice: "",
  date: todayISO(),
  amount: "",
  payment_method: "cash",
  reference_number: "",
  notes: "",
};

export const blankInvoiceForm = () => ({
  supplier: "",
  invoice_number: "",
  purchase_date: todayISO(),
  due_date: "",
  amount_paid: "",
  payment_method: "cash",
  notes: "",
  lines: [blankLine()],
});
