import React from "react";
import Field from "../../shared/erp/components/Field";
import Modal from "../../shared/erp/components/Modal";
import { inputClass } from "../../shared/erp/constants";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ContractFormModal({ form, contractors, saving, onChange, onClose, onSubmit }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <Modal title={autoT("legacy.new_service_contract_c4bdc996")} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={autoT("legacy.contractor_76bb2328")} required>
            <select required value={form.contractor} onChange={(event) => onChange({ ...form, contractor: event.target.value })} className={inputClass}>
              <option value="">{autoT("legacy.select_contractor_12a14b97")}</option>
              {contractors.map((contractor) => <option key={contractor.value} value={contractor.value}>{contractor.label}</option>)}
            </select>
          </Field>
          <Field label={autoT("legacy.title_768e0c1c")} required>
            <input required value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} className={inputClass} />
          </Field>
          <Field label={autoT("inventory_manager.reports.start_date")} required>
            <input required type="date" value={form.start_date} onChange={(event) => onChange({ ...form, start_date: event.target.value })} className={inputClass} />
          </Field>
          <Field label={autoT("inventory_manager.reports.end_date")}>
            <input type="date" value={form.end_date} onChange={(event) => onChange({ ...form, end_date: event.target.value })} className={inputClass} />
          </Field>
          <Field label={autoT("legacy.contract_value_48834ab5")}>
            <input type="number" step="0.01" value={form.contract_value} onChange={(event) => onChange({ ...form, contract_value: event.target.value })} className={inputClass} />
          </Field>
          <Field label={autoT("table.status")}>
            <select value={form.status} onChange={(event) => onChange({ ...form, status: event.target.value })} className={inputClass}>
              <option value="active">{autoT("staff.status.active")}</option>
              <option value="draft">{autoT("landing.mockups.inventory.values.purchase")}</option>
              <option value="completed">{autoT("stats.completed")}</option>
              <option value="cancelled">{autoT("status.cancelled")}</option>
              <option value="expired">{autoT("legacy.expired_a689a999")}</option>
            </select>
          </Field>
        </div>
        <Field label={autoT("inventory_manager.common.notes")}>
          <textarea rows={2} value={form.notes} onChange={(event) => onChange({ ...form, notes: event.target.value })} className={inputClass} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{autoT("staff.cancel")}</button>
          <button disabled={saving} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{autoT("legacy.save_contract_fd3ae03e")}</button>
        </div>
      </form>
    </Modal>
  );
}
