import {
  CreditCard,
  FilePlus2,
  ReceiptText,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import { todayISO } from "../shared/erp/formatters";
import i18n from "../../i18n";

export const procurementViews = {
  dashboard: {
    title: i18n.t("legacy.procurement_dashboard_d59b2b61"),
    description: i18n.t("legacy.daily_purchasing_supplier_balances_invoices_and_payabl_b0df48b8"),
    path: "/procurement",
    label: i18n.t("nav.dashboard"),
    icon: ShoppingCart,
  },
  create: {
    title: i18n.t("inventory_manager.low_stock.create_purchase_invoice"),
    description: i18n.t("legacy.receive_purchased_stock_and_create_the_matching_suppli_0625df23"),
    path: "/procurement/purchase-invoices/new",
    label: i18n.t("inventory_manager.common.create"),
    icon: FilePlus2,
  },
  invoices: {
    title: i18n.t("landing.features.groups.inventory.items.invoices"),
    description: i18n.t("legacy.review_supplier_invoices_attachments_payments_and_stoc_3e7a0e1d"),
    path: "/procurement/purchase-invoices",
    label: i18n.t("inventory_manager.reports.invoices"),
    icon: ReceiptText,
  },
  suppliers: {
    title: i18n.t("landing.features.groups.inventory.items.suppliers"),
    description: i18n.t("legacy.manage_supplier_profiles_balances_and_ledger_history_aee78e4b"),
    path: "/procurement/suppliers",
    label: i18n.t("landing.features.groups.inventory.items.suppliers"),
    icon: Users,
  },
  payments: {
    title: i18n.t("legacy.supplier_payments_6ef8f5d6"),
    description: i18n.t("legacy.record_partial_payments_and_print_supplier_payment_vou_71129bc3"),
    path: "/procurement/supplier-payments",
    label: i18n.t("landing.marketplace.owner.items.payments"),
    icon: Wallet,
  },
  payables: {
    title: i18n.t("legacy.outstanding_payables_f6045147"),
    description: i18n.t("legacy.track_unpaid_supplier_invoices_and_balances_due_bc95d5bb"),
    path: "/procurement/payables",
    label: i18n.t("legacy.payables_a4fb9796"),
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
