import React from "react";
import { CreditCard, Eye } from "lucide-react";
import DataTable from "../../shared/erp/components/DataTable";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";
import { getContractorInvoiceNumber } from "../utils/calculations";

export default function ContractorInvoiceTable({ invoices, onOpen, onPayment, compact = false }) {
  return (
    <DataTable
      rows={invoices}
      empty="No contractor invoices found."
      columns={[
        {
          key: "invoice",
          header: "Invoice",
          render: (invoice) => (
            <button type="button" onClick={() => onOpen(invoice.id)} className="font-semibold text-slate-950 hover:underline">
              {getContractorInvoiceNumber(invoice)}
            </button>
          ),
        },
        { key: "contractor", header: "Contractor", render: (invoice) => invoice.contractor_name },
        !compact && { key: "contract", header: "Contract", render: (invoice) => invoice.contract_title || "-" },
        { key: "date", header: "Date", render: (invoice) => invoice.invoice_date },
        { key: "status", header: "Status", render: (invoice) => <StatusBadge status={invoice.status} /> },
        { key: "total", header: "Total", className: "px-4 py-3 text-right font-semibold text-slate-950", render: (invoice) => money(invoice.total_amount) },
        { key: "balance", header: "Balance", className: "px-4 py-3 text-right font-semibold text-rose-700", render: (invoice) => money(invoice.remaining_balance) },
        {
          key: "action",
          header: "Actions",
          className: "px-4 py-3",
          render: (invoice) => (
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => onOpen(invoice.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" title="Open invoice">
                <Eye className="h-4 w-4" />
              </button>
              {Number(invoice.remaining_balance || 0) > 0 && invoice.status !== "draft" && (
                <button type="button" onClick={() => onPayment(invoice)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" title="Record payment">
                  <CreditCard className="h-4 w-4" />
                </button>
              )}
            </div>
          ),
        },
      ].filter(Boolean)}
    />
  );
}
