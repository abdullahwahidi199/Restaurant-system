import React from "react";
import Select from "react-select";
import Field from "../../shared/erp/components/Field";
import Modal from "../../shared/erp/components/Modal";
import { inputClass, paymentMethods, selectTheme } from "../../shared/erp/constants";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function SupplierPaymentModal({
  invoice,
  form,
  supplierOptions,
  invoiceOptions,
  saving,
  onChange,
  onClose,
  onSubmit,
}) {
                 const { t: autoT } = useAutoTranslation();
  const filteredInvoiceOptions = invoiceOptions.filter(
    (option) => !form.supplier || String(option.supplier) === String(form.supplier),
  );

  return (
    <Modal title={autoT("legacy.record_supplier_payment_66838471")} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4 p-5">
        {invoice?.id && (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-slate-950">
              {invoice.invoice_number || `PINV-${invoice.id}`}
            </p>
            <p className="mt-1 text-slate-500">
              {invoice.supplier_name} {autoT("legacy.balance_590559c3")} {invoice.remaining_balance}
            </p>
          </div>
        )}
        <Field label={autoT("inventory_manager.common.supplier")} required>
          <Select
            options={supplierOptions}
            styles={selectTheme}
            value={supplierOptions.find((option) => String(option.value) === String(form.supplier)) || null}
            onChange={(option) => onChange({ ...form, supplier: option?.value || "", purchase_invoice: "" })}
            placeholder={autoT("legacy.select_supplier_cfce5268")}
            isDisabled={Boolean(invoice?.id)}
            isClearable
          />
        </Field>
        <Field label={autoT("legacy.purchase_invoice_6cc4cd0f")} required>
          <Select
            options={filteredInvoiceOptions}
            styles={selectTheme}
            value={invoiceOptions.find((option) => String(option.value) === String(form.purchase_invoice)) || null}
            onChange={(option) =>
              onChange({
                ...form,
                purchase_invoice: option?.value || "",
                supplier: option?.supplier || form.supplier,
                amount: option?.remaining || form.amount,
              })
            }
            placeholder={autoT("legacy.select_unpaid_invoice_070a3e32")}
            isDisabled={Boolean(invoice?.id)}
            isClearable
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={autoT("legacy.payment_date_4b0bd4b9")} required>
            <input
              required
              type="date"
              value={form.date}
              onChange={(event) => onChange({ ...form, date: event.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label={autoT("legacy.amount_43dc8532")} required>
            <input
              required
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(event) => onChange({ ...form, amount: event.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label={autoT("legacy.payment_method_f383f6a2")}>
            <select
              value={form.payment_method}
              onChange={(event) => onChange({ ...form, payment_method: event.target.value })}
              className={inputClass}
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </Field>
          <Field label={autoT("legacy.reference_number_74195db5")}>
            <input
              value={form.reference_number}
              onChange={(event) => onChange({ ...form, reference_number: event.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label={autoT("inventory_manager.common.notes")}>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(event) => onChange({ ...form, notes: event.target.value })}
            className={inputClass}
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            {autoT("staff.cancel")}
          </button>
          <button disabled={saving} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
            {autoT("legacy.record_payment_6577ced3")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
