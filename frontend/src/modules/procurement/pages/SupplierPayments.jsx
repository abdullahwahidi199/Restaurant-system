import React from "react";
import { CreditCard, FileDown, Printer } from "lucide-react";
import DataTable from "../../shared/erp/components/DataTable";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import { formatMethod, money } from "../../shared/erp/formatters";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function SupplierPayments({
  payments,
  search,
  onSearch,
  onPayment,
  onVoucher,
  onVoucherPdf,
}) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="space-y-4">
      <Toolbar>
        <SearchBox value={search} onChange={onSearch} placeholder={autoT("legacy.search_payments_3a82474c")} />
        <button type="button" onClick={() => onPayment()} className="theme-btn theme-btn-primary h-[38px] px-4">
          <CreditCard className="h-4 w-4" />
          {autoT("legacy.record_payment_6577ced3")}
        </button>
      </Toolbar>
      <DataTable
        rows={payments}
        empty={autoT("legacy.no_supplier_payments_found_298d7de8")}
        columns={[
          { key: "date", header: "Date" },
          { key: "supplier", header: "Supplier", render: (payment) => payment.supplier_name },
          { key: "invoice", header: "Invoice", render: (payment) => payment.invoice_number || "-" },
          { key: "method", header: "Method", render: (payment) => formatMethod(payment.payment_method) },
          { key: "reference", header: "Reference", render: (payment) => payment.reference_number || "-" },
          { key: "amount", header: "Amount", className: "px-4 py-2.5 text-right font-semibold tabular-nums theme-text-primary", render: (payment) => money(payment.amount) },
          {
            key: "action",
            header: "Action",
            className: "px-4 py-2.5",
            render: (payment) => (
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => onVoucher(payment)} className="theme-btn theme-btn-outline theme-btn-icon theme-text-muted" title={autoT("legacy.print_voucher_b9248a24")} aria-label={autoT("legacy.print_voucher_b9248a24")}>
                  <Printer className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onVoucherPdf(payment)} className="theme-btn theme-btn-outline theme-btn-icon theme-text-muted" title={autoT("legacy.download_pdf_98e5ef06")} aria-label={autoT("legacy.download_pdf_98e5ef06")}>
                  <FileDown className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
