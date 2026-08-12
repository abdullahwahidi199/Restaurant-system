import React from "react";
import Field from "../../shared/erp/components/Field";
import Modal from "../../shared/erp/components/Modal";
import { inputClass, paymentMethods } from "../../shared/erp/constants";
import { money } from "../../shared/erp/formatters";

export default function PayrollPaymentModal({ payroll, form, saving, onChange, onSubmit, onClose }) {
  return (
    <Modal title={`Pay ${payroll.staff_name}`} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4 p-5">
        <div className="grid gap-3 rounded-lg bg-slate-50 p-4 text-sm md:grid-cols-3">
          <Summary label="Net Salary" value={money(payroll.net_salary)} />
          <Summary label="Paid" value={money(payroll.amount_paid)} />
          <Summary label="Balance" value={money(payroll.remaining_balance)} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Payment Date" required>
            <input required type="date" value={form.date} onChange={(event) => onChange({ ...form, date: event.target.value })} className={inputClass} />
          </Field>
          <Field label="Amount" required>
            <input required type="number" min="0" step="0.01" value={form.amount} onChange={(event) => onChange({ ...form, amount: event.target.value })} className={inputClass} />
          </Field>
          <Field label="Payment Method">
            <select value={form.payment_method} onChange={(event) => onChange({ ...form, payment_method: event.target.value })} className={inputClass}>
              {paymentMethods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
            </select>
          </Field>
          <Field label="Reference Number">
            <input value={form.reference_number} onChange={(event) => onChange({ ...form, reference_number: event.target.value })} className={inputClass} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea rows={3} value={form.notes} onChange={(event) => onChange({ ...form, notes: event.target.value })} className={inputClass} />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button disabled={saving} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">Record Payment</button>
        </div>
      </form>
    </Modal>
  );
}

function Summary({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
