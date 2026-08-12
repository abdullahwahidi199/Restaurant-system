import React from "react";
import Field from "../../shared/erp/components/Field";
import Modal from "../../shared/erp/components/Modal";
import { inputClass } from "../../shared/erp/constants";

export default function ContractFormModal({ form, contractors, saving, onChange, onClose, onSubmit }) {
  return (
    <Modal title="New Service Contract" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Contractor" required>
            <select required value={form.contractor} onChange={(event) => onChange({ ...form, contractor: event.target.value })} className={inputClass}>
              <option value="">Select contractor</option>
              {contractors.map((contractor) => <option key={contractor.value} value={contractor.value}>{contractor.label}</option>)}
            </select>
          </Field>
          <Field label="Title" required>
            <input required value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} className={inputClass} />
          </Field>
          <Field label="Start Date" required>
            <input required type="date" value={form.start_date} onChange={(event) => onChange({ ...form, start_date: event.target.value })} className={inputClass} />
          </Field>
          <Field label="End Date">
            <input type="date" value={form.end_date} onChange={(event) => onChange({ ...form, end_date: event.target.value })} className={inputClass} />
          </Field>
          <Field label="Contract Value">
            <input type="number" step="0.01" value={form.contract_value} onChange={(event) => onChange({ ...form, contract_value: event.target.value })} className={inputClass} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(event) => onChange({ ...form, status: event.target.value })} className={inputClass}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </Field>
        </div>
        <Field label="Notes">
          <textarea rows={2} value={form.notes} onChange={(event) => onChange({ ...form, notes: event.target.value })} className={inputClass} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button disabled={saving} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">Save Contract</button>
        </div>
      </form>
    </Modal>
  );
}
