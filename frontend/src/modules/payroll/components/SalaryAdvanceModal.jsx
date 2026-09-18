import React from "react";
import Field from "../../shared/erp/components/Field";
import Modal from "../../shared/erp/components/Modal";
import { inputClass } from "../../shared/erp/constants";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function SalaryAdvanceModal({ form, staffOptions, saving, onChange, onSubmit, onClose }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <Modal title={autoT("legacy.record_salary_advance_8068d0b4")} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4 p-5">
        <Field label={autoT("legacy.employee_079711ea")} required>
          <select required value={form.staff_id} onChange={(event) => onChange({ ...form, staff_id: event.target.value })} className={inputClass}>
            <option value="">{autoT("legacy.select_employee_c70121d9")}</option>
            {staffOptions.map((employee) => <option key={employee.value} value={employee.value}>{employee.label}</option>)}
          </select>
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={autoT("table.date")} required>
            <input required type="date" value={form.date} onChange={(event) => onChange({ ...form, date: event.target.value })} className={inputClass} />
          </Field>
          <Field label={autoT("legacy.amount_43dc8532")} required>
            <input required type="number" min="0" step="0.01" value={form.amount} onChange={(event) => onChange({ ...form, amount: event.target.value })} className={inputClass} />
          </Field>
        </div>
        <Field label={autoT("legacy.reason_f219cc06")}>
          <input value={form.reason} onChange={(event) => onChange({ ...form, reason: event.target.value })} className={inputClass} />
        </Field>
        <Field label={autoT("inventory_manager.common.notes")}>
          <textarea rows={3} value={form.notes} onChange={(event) => onChange({ ...form, notes: event.target.value })} className={inputClass} />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{autoT("staff.cancel")}</button>
          <button disabled={saving} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{autoT("legacy.save_advance_c7e0e386")}</button>
        </div>
      </form>
    </Modal>
  );
}
