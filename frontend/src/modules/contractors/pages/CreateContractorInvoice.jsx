import React from "react";
import { BadgeCheck, Plus, Trash2 } from "lucide-react";
import ActionButton from "../../shared/erp/components/ActionButton";
import Field from "../../shared/erp/components/Field";
import FormSection from "../../shared/erp/components/FormSection";
import Panel from "../../shared/erp/components/Panel";
import { inputClass, paymentMethods } from "../../shared/erp/constants";
import { money } from "../../shared/erp/formatters";
import { serviceTypes } from "../constants";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function CreateContractorInvoice({
  form,
  contractors,
  contracts,
  invoiceTotal,
  saving,
  onChange,
  onLineChange,
  onAddLine,
  onRemoveLine,
  onSubmit,
}) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <form onSubmit={onSubmit} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <FormSection title={autoT("legacy.invoice_details_397a6f30")} description={autoT("legacy.contractor_contract_dates_and_approval_state_invoice_n_b9b3418f")}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label={autoT("legacy.contractor_76bb2328")} required>
              <select required value={form.contractor} onChange={(event) => onChange({ ...form, contractor: event.target.value, contract: "" })} className={inputClass}>
                <option value="">{autoT("legacy.select_contractor_12a14b97")}</option>
                {contractors.map((contractor) => <option key={contractor.value} value={contractor.value}>{contractor.label}</option>)}
              </select>
            </Field>
            <Field label={autoT("legacy.contract_5a0ba3bb")}>
              <select value={form.contract} onChange={(event) => onChange({ ...form, contract: event.target.value })} className={inputClass}>
                <option value="">{autoT("legacy.no_contract_f5193afc")}</option>
                {contracts.map((contract) => <option key={contract.value} value={contract.value}>{contract.label}</option>)}
              </select>
            </Field>
            <Field label={autoT("legacy.invoice_date_844828da")} required>
              <input required type="date" value={form.invoice_date} onChange={(event) => onChange({ ...form, invoice_date: event.target.value })} className={inputClass} />
            </Field>
            <Field label={autoT("legacy.due_date_a1b308ec")}>
              <input type="date" value={form.due_date} onChange={(event) => onChange({ ...form, due_date: event.target.value })} className={inputClass} />
            </Field>
            <Field label={autoT("table.status")}>
              <select value={form.status} onChange={(event) => onChange({ ...form, status: event.target.value })} className={inputClass}>
                <option value="approved">{autoT("inventory_manager.statuses.approved")}</option>
                <option value="draft">{autoT("landing.mockups.inventory.values.purchase")}</option>
              </select>
            </Field>
          </div>
        </FormSection>
        <FormSection title={autoT("legacy.service_lines_a5a47018")} description={autoT("legacy.itemize_service_work_and_contractor_charges_5952fc19")}>
          <ServiceLines lines={form.lines} onLineChange={onLineChange} onAddLine={onAddLine} onRemoveLine={onRemoveLine} />
        </FormSection>
        <FormSection title={autoT("description")}>
          <textarea rows={3} value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} className={`${inputClass} h-auto min-h-20 py-2.5`} />
        </FormSection>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
        <Panel title={autoT("legacy.payment_summary_dad7cf7f")} className="theme-card-raised">
          <div className="space-y-3 text-sm">
            <SummaryRow label={autoT("legacy.invoice_total_76dac385")} value={money(invoiceTotal)} />
            <Field label={autoT("legacy.amount_paid_initially_79efbd27")}>
              <input type="number" step="0.01" value={form.amount_paid} onChange={(event) => onChange({ ...form, amount_paid: event.target.value })} className={inputClass} />
            </Field>
            <Field label={autoT("legacy.payment_method_f383f6a2")}>
              <select value={form.payment_method} onChange={(event) => onChange({ ...form, payment_method: event.target.value })} className={inputClass}>
                {paymentMethods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
              </select>
            </Field>
            <Field label={autoT("legacy.payment_reference_80e69501")}>
              <input value={form.payment_reference} onChange={(event) => onChange({ ...form, payment_reference: event.target.value })} className={inputClass} />
            </Field>
          </div>
        </Panel>
        <div className="theme-raised sticky bottom-4 rounded-lg bg-[rgb(var(--theme-surface-rgb)/0.96)] p-3 backdrop-blur">
          <ActionButton variant="primary" icon={BadgeCheck} loading={saving} className="w-full" type="submit">
          {saving ? autoT("saving") : autoT("legacy.create_invoice_32815b0b")}
          </ActionButton>
        </div>
      </aside>
    </form>
  );
}

function ServiceLines({ lines, onLineChange, onAddLine, onRemoveLine }) {
  const { t: autoT } = useAutoTranslation();
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr><th className="px-3 py-3">{autoT("legacy.service_329cb8b6")}</th><th className="px-3 py-3">{autoT("description")}</th><th className="px-3 py-3">{autoT("inventory_manager.common.qty")}</th><th className="px-3 py-3">{autoT("inventory_manager.reports.unit_price")}</th><th className="px-3 py-3 text-right">{autoT("inventory_manager.common.action")}</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((line, index) => (
              <tr key={line.key}>
                <td className="px-3 py-3"><select value={line.service_type} onChange={(event) => onLineChange(index, "service_type", event.target.value)} className={inputClass}>{serviceTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></td>
                <td className="px-3 py-3"><input value={line.description} onChange={(event) => onLineChange(index, "description", event.target.value)} className={inputClass} /></td>
                <td className="px-3 py-3"><input type="number" step="0.01" value={line.quantity} onChange={(event) => onLineChange(index, "quantity", event.target.value)} className={inputClass} /></td>
                <td className="px-3 py-3"><input type="number" step="0.01" value={line.unit_price} onChange={(event) => onLineChange(index, "unit_price", event.target.value)} className={inputClass} /></td>
                <td className="px-3 py-3 text-right"><button type="button" onClick={() => onRemoveLine(index)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={onAddLine} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Plus className="h-4 w-4" />{autoT("legacy.add_line_63dcfb67")}</button>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-950">{value}</span></div>;
}
