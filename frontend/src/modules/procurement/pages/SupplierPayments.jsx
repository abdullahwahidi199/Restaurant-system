import React from "react";
import { CreditCard, FileDown, Printer } from "lucide-react";
import DataTable from "../../shared/erp/components/DataTable";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import { formatMethod, money } from "../../shared/erp/formatters";

export default function SupplierPayments({
  payments,
  search,
  onSearch,
  onPayment,
  onVoucher,
  onVoucherPdf,
}) {
  return (
    <div className="space-y-4">
      <Toolbar>
        <SearchBox value={search} onChange={onSearch} placeholder="Search payments" />
        <button type="button" onClick={() => onPayment()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          <CreditCard className="h-4 w-4" />
          Record Payment
        </button>
      </Toolbar>
      <DataTable
        rows={payments}
        empty="No supplier payments found."
        columns={[
          { key: "date", header: "Date" },
          { key: "supplier", header: "Supplier", render: (payment) => payment.supplier_name },
          { key: "invoice", header: "Invoice", render: (payment) => payment.invoice_number || "-" },
          { key: "method", header: "Method", render: (payment) => formatMethod(payment.payment_method) },
          { key: "reference", header: "Reference", render: (payment) => payment.reference_number || "-" },
          { key: "amount", header: "Amount", className: "px-4 py-3 text-right font-semibold text-slate-950", render: (payment) => money(payment.amount) },
          {
            key: "action",
            header: "Action",
            className: "px-4 py-3",
            render: (payment) => (
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => onVoucher(payment)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" title="Print voucher">
                  <Printer className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onVoucherPdf(payment)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" title="Download PDF">
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
