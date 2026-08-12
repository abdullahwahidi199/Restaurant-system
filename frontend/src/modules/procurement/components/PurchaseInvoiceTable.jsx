import React from "react";
import { CreditCard, Eye } from "lucide-react";
import DataTable from "../../shared/erp/components/DataTable";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";
import { getInvoiceNumber } from "../utils/calculations";

export default function PurchaseInvoiceTable({ invoices, onOpen, onPayment, compact = false }) {
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
      className: "px-4 py-3 text-right font-semibold text-slate-950",
      render: (invoice) => money(invoice.total_amount),
    },
    !compact && {
      key: "paid",
      header: "Paid",
      className: "px-4 py-3 text-right",
      render: (invoice) => money(invoice.amount_paid),
    },
    {
      key: "balance",
      header: "Balance",
      className: "px-4 py-3 text-right font-semibold text-rose-700",
      render: (invoice) => money(invoice.remaining_balance),
    },
    {
      key: "actions",
      header: "Actions",
      className: "px-4 py-3",
      render: (invoice) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpen(invoice)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            title="Open invoice"
          >
            <Eye className="h-4 w-4" />
          </button>
          {invoice.supplier && Number(invoice.remaining_balance) > 0 && (
            <button
              type="button"
              onClick={() => onPayment(invoice)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
              title="Record payment"
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
      empty="No purchase invoices found."
    />
  );
}
