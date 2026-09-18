import React from "react";
import Field from "../../shared/erp/components/Field";
import Modal from "../../shared/erp/components/Modal";
import { inputClass, paymentMethods } from "../../shared/erp/constants";
import { money } from "../../shared/erp/formatters";
import { getContractorInvoiceNumber } from "../utils/calculations";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ContractorPaymentModal({ invoice, form, saving, onChange, onClose, onSubmit }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <Modal title={autoT("legacy.record_contractor_payment_098fbae2")} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4 p-5">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
          <p className="font-semibold text-slate-950">{getContractorInvoiceNumber(invoice)}</p>
          <p className="mt-1 text-slate-500">
            {invoice.contractor_name} {autoT("legacy.balance_88ec415f")} {money(invoice.remaining_balance)}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={autoT("legacy.payment_date_4b0bd4b9")} required>
            <input required type="date" value={form.date} onChange={(event) => onChange({ ...form, date: event.target.value })} className={inputClass} />
          </Field>
          <Field label={autoT("legacy.amount_43dc8532")} required>
            <input required type="number" step="0.01" value={form.amount} onChange={(event) => onChange({ ...form, amount: event.target.value })} className={inputClass} />
          </Field>
          <Field label={autoT("legacy.payment_method_f383f6a2")}>
            <select value={form.payment_method} onChange={(event) => onChange({ ...form, payment_method: event.target.value })} className={inputClass}>
              {paymentMethods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
            </select>
          </Field>
          <Field label={autoT("legacy.reference_number_74195db5")}>
            <input value={form.reference_number} onChange={(event) => onChange({ ...form, reference_number: event.target.value })} className={inputClass} />
          </Field>
        </div>
        <Field label={autoT("inventory_manager.common.notes")}>
          <textarea rows={2} value={form.notes} onChange={(event) => onChange({ ...form, notes: event.target.value })} className={inputClass} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{autoT("staff.cancel")}</button>
          <button disabled={saving} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{autoT("legacy.record_payment_6577ced3")}</button>
        </div>
      </form>
    </Modal>
  );
}
