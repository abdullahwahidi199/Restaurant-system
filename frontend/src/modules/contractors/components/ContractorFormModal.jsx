import React from "react";
import Field from "../../shared/erp/components/Field";
import Modal from "../../shared/erp/components/Modal";
import { inputClass } from "../../shared/erp/constants";

export default function ContractorFormModal({ form, editing, saving, onChange, onClose, onSubmit }) {
  return (
    <Modal title={editing ? "Edit Contractor" : "New Contractor"} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Company / Person Name" required>
            <input required value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} className={inputClass} />
          </Field>
          <Field label="Contact Person">
            <input value={form.contact_person} onChange={(event) => onChange({ ...form, contact_person: event.target.value })} className={inputClass} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={(event) => onChange({ ...form, phone: event.target.value })} className={inputClass} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={(event) => onChange({ ...form, email: event.target.value })} className={inputClass} />
          </Field>
        </div>
        <Field label="Address">
          <textarea rows={2} value={form.address} onChange={(event) => onChange({ ...form, address: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Notes">
          <textarea rows={2} value={form.notes} onChange={(event) => onChange({ ...form, notes: event.target.value })} className={inputClass} />
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={form.is_active} onChange={(event) => onChange({ ...form, is_active: event.target.checked })} />
          Active contractor
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button disabled={saving} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">Save Contractor</button>
        </div>
      </form>
    </Modal>
  );
}
