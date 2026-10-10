import React from "react";
import { CreditCard, Eye } from "lucide-react";
import DataTable from "../../shared/erp/components/DataTable";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";
import { getContractorInvoiceNumber } from "../utils/calculations";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ContractorInvoiceTable({ invoices, onOpen, onPayment, compact = false }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <DataTable
      rows={invoices}
      empty={autoT("legacy.no_contractor_invoices_found_bebcd9bf")}
      columns={[
        {
          key: "invoice",
          header: "Invoice",
          render: (invoice) => (
            <button type="button" onClick={() => onOpen(invoice.id)} className="font-semibold theme-text-primary hover:underline">
              {getContractorInvoiceNumber(invoice)}
            </button>
          ),
        },
        { key: "contractor", header: "Contractor", render: (invoice) => invoice.contractor_name },
        !compact && { key: "contract", header: "Contract", render: (invoice) => invoice.contract_title || "-" },
        { key: "date", header: "Date", render: (invoice) => invoice.invoice_date },
        { key: "status", header: "Status", render: (invoice) => <StatusBadge status={invoice.status} /> },
        { key: "total", header: "Total", className: "text-right font-semibold tabular-nums theme-text-primary", render: (invoice) => money(invoice.total_amount) },
        { key: "balance", header: "Balance", className: "text-right font-semibold tabular-nums text-[var(--theme-danger)]", render: (invoice) => money(invoice.remaining_balance) },
        {
          key: "action",
          header: "Actions",
          render: (invoice) => (
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => onOpen(invoice.id)} className="theme-btn theme-btn-outline theme-btn-icon theme-text-muted" title={autoT("legacy.open_invoice_587e51ea")}>
                <Eye className="h-4 w-4" />
              </button>
              {Number(invoice.remaining_balance || 0) > 0 && invoice.status !== "draft" && (
                <button type="button" onClick={() => onPayment(invoice)} className="theme-btn theme-btn-outline theme-btn-icon theme-text-muted" title={autoT("legacy.record_payment_86e56322")}>
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
