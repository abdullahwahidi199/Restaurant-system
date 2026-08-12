import React from "react";
import { BadgeCheck, CreditCard, FileDown, Printer } from "lucide-react";
import { formatMethod, money } from "../../shared/erp/formatters";

export default function PurchasePaymentHistory({
  invoice,
  onPayment,
  onPrintVoucher,
  onDownloadVoucher,
}) {
  const payments = invoice.payments || [];
  if (!payments.length) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
          No supplier payments recorded for this invoice.
        </p>
        {invoice.supplier && Number(invoice.remaining_balance) > 0 && (
          <button type="button" onClick={() => onPayment(invoice)} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            <CreditCard className="h-4 w-4" />
            Record Payment
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div key={payment.id} className="flex gap-3 rounded-lg border border-slate-200 p-3">
          <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <BadgeCheck className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-950">{money(payment.amount)}</p>
              <p className="text-sm text-slate-500">{payment.date}</p>
            </div>
            <p className="text-sm text-slate-500">
              {formatMethod(payment.payment_method)}
              {payment.reference_number ? ` - ${payment.reference_number}` : ""}
            </p>
            {payment.notes && <p className="mt-1 text-sm text-slate-600">{payment.notes}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => onPrintVoucher(payment)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
                <Printer className="h-3.5 w-3.5" />
                Print Voucher
              </button>
              <button type="button" onClick={() => onDownloadVoucher(payment)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
                <FileDown className="h-3.5 w-3.5" />
                PDF
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
