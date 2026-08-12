import React from "react";
import Field from "../../shared/erp/components/Field";
import Modal from "../../shared/erp/components/Modal";
import { inputClass } from "../../shared/erp/constants";

export default function SalaryAdvanceModal({ form, staffOptions, saving, onChange, onSubmit, onClose }) {
  return (
    <Modal title="Record Salary Advance" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4 p-5">
        <Field label="Employee" required>
          <select required value={form.staff_id} onChange={(event) => onChange({ ...form, staff_id: event.target.value })} className={inputClass}>
            <option value="">Select employee</option>
            {staffOptions.map((employee) => <option key={employee.value} value={employee.value}>{employee.label}</option>)}
          </select>
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Date" required>
            <input required type="date" value={form.date} onChange={(event) => onChange({ ...form, date: event.target.value })} className={inputClass} />
          </Field>
          <Field label="Amount" required>
            <input required type="number" min="0" step="0.01" value={form.amount} onChange={(event) => onChange({ ...form, amount: event.target.value })} className={inputClass} />
          </Field>
        </div>
        <Field label="Reason">
          <input value={form.reason} onChange={(event) => onChange({ ...form, reason: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Notes">
          <textarea rows={3} value={form.notes} onChange={(event) => onChange({ ...form, notes: event.target.value })} className={inputClass} />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button disabled={saving} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">Save Advance</button>
        </div>
      </form>
    </Modal>
  );
}
