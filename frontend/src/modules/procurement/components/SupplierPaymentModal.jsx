import React from "react";
import Select from "react-select";
import Field from "../../shared/erp/components/Field";
import Modal from "../../shared/erp/components/Modal";
import { inputClass, paymentMethods, selectTheme } from "../../shared/erp/constants";

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
  const filteredInvoiceOptions = invoiceOptions.filter(
    (option) => !form.supplier || String(option.supplier) === String(form.supplier),
  );

  return (
    <Modal title="Record Supplier Payment" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4 p-5">
        {invoice?.id && (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-slate-950">
              {invoice.invoice_number || `PINV-${invoice.id}`}
            </p>
            <p className="mt-1 text-slate-500">
              {invoice.supplier_name} - balance {invoice.remaining_balance}
            </p>
          </div>
        )}
        <Field label="Supplier" required>
          <Select
            options={supplierOptions}
            styles={selectTheme}
            value={supplierOptions.find((option) => String(option.value) === String(form.supplier)) || null}
            onChange={(option) => onChange({ ...form, supplier: option?.value || "", purchase_invoice: "" })}
            placeholder="Select supplier"
            isDisabled={Boolean(invoice?.id)}
            isClearable
          />
        </Field>
        <Field label="Purchase Invoice" required>
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
            placeholder="Select unpaid invoice"
            isDisabled={Boolean(invoice?.id)}
            isClearable
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Payment Date" required>
            <input
              required
              type="date"
              value={form.date}
              onChange={(event) => onChange({ ...form, date: event.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Amount" required>
            <input
              required
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(event) => onChange({ ...form, amount: event.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Payment Method">
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
          <Field label="Reference Number">
            <input
              value={form.reference_number}
              onChange={(event) => onChange({ ...form, reference_number: event.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            rows={2}
            value={form.notes}
            onChange={(event) => onChange({ ...form, notes: event.target.value })}
            className={inputClass}
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button disabled={saving} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
            Record Payment
          </button>
        </div>
      </form>
    </Modal>
  );
}
