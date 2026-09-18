import React from "react";
import { CreditCard, Eye } from "lucide-react";
import DataTable from "../../shared/erp/components/DataTable";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";
import { getInvoiceNumber } from "../utils/calculations";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function PurchaseInvoiceTable({ invoices, onOpen, onPayment, compact = false }) {
                 const { t: autoT } = useAutoTranslation();
  const columns = [
    {
      key: "invoice",
      header: "Invoice",
      render: (invoice) => (
        <button
          type="button"
          onClick={() => onOpen(invoice)}
          className="font-semibold text-slate-950 hover:underline"
        >
          {getInvoiceNumber(invoice)}
        </button>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (invoice) => invoice.supplier_name || "Cash / No Supplier",
    },
    { key: "purchase_date", header: "Date" },
    {
      key: "status",
      header: "Status",
      render: (invoice) => <StatusBadge status={invoice.status} />,
    },
    {
      key: "total",
      header: "Total",
      className: "px-4 py-2.5 text-right font-semibold tabular-nums theme-text-primary",
      render: (invoice) => money(invoice.total_amount),
    },
    !compact && {
      key: "paid",
      header: "Paid",
      className: "px-4 py-2.5 text-right tabular-nums",
      render: (invoice) => money(invoice.amount_paid),
    },
    {
      key: "balance",
      header: "Balance",
      className: "px-4 py-2.5 text-right font-semibold tabular-nums text-[var(--theme-danger)]",
      render: (invoice) => money(invoice.remaining_balance),
    },
    {
      key: "actions",
      header: "Actions",
      className: "px-4 py-2.5",
      render: (invoice) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpen(invoice)}
            className="theme-btn theme-btn-outline theme-btn-icon theme-text-muted"
            title={autoT("legacy.open_invoice_587e51ea")}
            aria-label={autoT("legacy.open_invoice_587e51ea")}
          >
            <Eye className="h-4 w-4" />
          </button>
          {invoice.supplier && Number(invoice.remaining_balance) > 0 && (
            <button
              type="button"
              onClick={() => onPayment(invoice)}
              className="theme-btn theme-btn-outline theme-btn-icon theme-text-muted"
              title={autoT("legacy.record_payment_86e56322")}
              aria-label={autoT("legacy.record_payment_86e56322")}
            >
              <CreditCard className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ].filter(Boolean);

  return (
    <DataTable
      columns={columns}
      rows={invoices}
      empty={autoT("legacy.no_purchase_invoices_found_4d09b23c")}
    />
  );
}
