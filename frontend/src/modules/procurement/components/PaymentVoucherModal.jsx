import React from "react";
import { Printer } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";

const voucherMoney = (value, currency = "AFN") =>
  `${currency} ${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

function VoucherGrid({ rows }) {
  return (
    <div className="border border-slate-950 text-sm">
      {rows.map((row) => (
        <div key={row.join("-")} className="grid grid-cols-4 border-b border-slate-950 last:border-b-0">
          <div className="border-r border-slate-950 bg-slate-100 p-2 font-semibold">{row[0]}</div>
          <div className="border-r border-slate-950 p-2">{row[1]}</div>
          <div className="border-r border-slate-950 bg-slate-100 p-2 font-semibold">{row[2]}</div>
          <div className="p-2">{row[3]}</div>
        </div>
      ))}
    </div>
  );
}

function VoucherSection({ title, children }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2 border-b border-slate-950 pb-1 text-sm font-bold uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function PaymentVoucherModal({ voucher, onClose }) {
                 const { t: autoT } = useAutoTranslation();
  const { company = {}, payment = {}, invoice = {} } = voucher || {};

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/50 p-4">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .voucher-print, .voucher-print * { visibility: visible; }
          .voucher-print { position: absolute; left: 0; top: 0; width: 210mm; min-height: 297mm; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="mx-auto max-w-5xl">
        <div className="no-print mb-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            <Printer className="h-4 w-4" />
            {autoT("legacy.print_5b221e9c")}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold">
            {autoT("menuDetails.close")}
          </button>
        </div>
        <div className="voucher-print relative bg-white p-8 text-slate-950 shadow-2xl">
          {payment.is_invoice_completed && (
            <div className="pointer-events-none absolute inset-0 flex rotate-[-25deg] items-center justify-center text-8xl font-bold text-slate-900/5">
              {autoT("legacy.paid_f3534db5")}
            </div>
          )}
          <div className="relative">
            <div className="flex items-start justify-between border-b-2 border-slate-950 pb-4">
              <div className="flex gap-4">
                {company.logo_url ? (
                  <img src={company.logo_url} alt={company.name} className="h-16 w-16 object-contain" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center border text-xs font-semibold">{autoT("legacy.logo_2c2d6bb5")}</div>
                )}
                <div>
                  <h2 className="text-xl font-bold uppercase">{company.name}</h2>
                  <p className="text-sm">{autoT("legacy.branch_8b31d33d")} {company.branch_name || "-"}</p>
                  <p className="text-sm">{autoT("legacy.address_303d9813")} {company.address || "-"}</p>
                  <p className="text-sm">{autoT("legacy.phone_daeea4d0")} {company.phone || "-"}</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold uppercase">{autoT("legacy.payment_voucher_d3d40e82")}</h1>
                <p className="mt-1 text-sm font-semibold">{payment.voucher_number}</p>
                <p className="text-xs">{autoT("legacy.payment_id_9524f4eb")} {payment.id}</p>
              </div>
            </div>
            <VoucherSection title={autoT("legacy.payment_information_88b8328c")}>
              <VoucherGrid
                rows={[
                  ["Voucher Number", payment.voucher_number, "Payment Date", payment.date],
                  ["Supplier", payment.supplier_name, "Invoice Number", payment.invoice_number],
                  ["Method", payment.payment_method, "Reference", payment.reference_number || "-"],
                  ["Amount Paid", voucherMoney(payment.amount_paid, payment.currency), "Remaining", voucherMoney(payment.remaining_balance_after_payment, payment.currency)],
                ]}
              />
            </VoucherSection>
            <VoucherSection title={autoT("legacy.invoice_information_d1cad6dc")}>
              <VoucherGrid
                rows={[
                  ["Invoice Total", voucherMoney(invoice.original_invoice_total), "Paid Before", voucherMoney(invoice.total_paid_before_this_payment)],
                  ["Current Payment", voucherMoney(invoice.current_payment), "Total Paid", voucherMoney(invoice.total_paid)],
                  ["Remaining", voucherMoney(invoice.remaining_balance), "Status", String(invoice.status || "").replaceAll("_", " ")],
                ]}
              />
            </VoucherSection>
            <VoucherSection title={autoT("inventory_manager.common.notes")}>
              <div className="min-h-14 border border-slate-950 p-3 text-sm">{payment.notes || autoT("legacy.no_notes_c0e8f375")}</div>
            </VoucherSection>
            <VoucherSection title={autoT("legacy.signatures_e4cf0392")}>
              <div className="grid grid-cols-4 gap-3 text-center text-xs">
                {["Prepared By", "Checked By", "Approved By", "Supplier Representative"].map((label) => (
                  <div key={label} className="space-y-5">
                    <p className="font-semibold">{label}</p>
                    <div className="border-b border-slate-950 pt-4" />
                    <p>{autoT("legacy.signature_2f32be1d")}</p>
                  </div>
                ))}
              </div>
            </VoucherSection>
          </div>
        </div>
      </div>
    </div>
  );
}
