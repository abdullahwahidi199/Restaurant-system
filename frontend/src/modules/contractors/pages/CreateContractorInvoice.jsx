import React from "react";
import { BadgeCheck, Plus, Trash2 } from "lucide-react";
import ActionButton from "../../shared/erp/components/ActionButton";
import Field from "../../shared/erp/components/Field";
import FormSection from "../../shared/erp/components/FormSection";
import Panel from "../../shared/erp/components/Panel";
import { inputClass, paymentMethods } from "../../shared/erp/constants";
import { money } from "../../shared/erp/formatters";
import { serviceTypes } from "../constants";

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
  return (
    <form onSubmit={onSubmit} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <FormSection title="Invoice Details" description="Contractor, contract, dates, and approval state. Invoice numbers are generated automatically.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Contractor" required>
              <select required value={form.contractor} onChange={(event) => onChange({ ...form, contractor: event.target.value, contract: "" })} className={inputClass}>
                <option value="">Select contractor</option>
                {contractors.map((contractor) => <option key={contractor.value} value={contractor.value}>{contractor.label}</option>)}
              </select>
            </Field>
            <Field label="Contract">
              <select value={form.contract} onChange={(event) => onChange({ ...form, contract: event.target.value })} className={inputClass}>
                <option value="">No contract</option>
                {contracts.map((contract) => <option key={contract.value} value={contract.value}>{contract.label}</option>)}
              </select>
            </Field>
            <Field label="Invoice Date" required>
              <input required type="date" value={form.invoice_date} onChange={(event) => onChange({ ...form, invoice_date: event.target.value })} className={inputClass} />
            </Field>
            <Field label="Due Date">
              <input type="date" value={form.due_date} onChange={(event) => onChange({ ...form, due_date: event.target.value })} className={inputClass} />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(event) => onChange({ ...form, status: event.target.value })} className={inputClass}>
                <option value="approved">Approved</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
          </div>
        </FormSection>
        <FormSection title="Service Lines" description="Itemize service work and contractor charges.">
          <ServiceLines lines={form.lines} onLineChange={onLineChange} onAddLine={onAddLine} onRemoveLine={onRemoveLine} />
        </FormSection>
        <FormSection title="Description">
          <textarea rows={3} value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} className={inputClass} />
        </FormSection>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
        <Panel title="Payment Summary">
          <div className="space-y-3 text-sm">
            <SummaryRow label="Invoice Total" value={money(invoiceTotal)} />
            <Field label="Amount Paid Initially">
              <input type="number" step="0.01" value={form.amount_paid} onChange={(event) => onChange({ ...form, amount_paid: event.target.value })} className={inputClass} />
            </Field>
            <Field label="Payment Method">
              <select value={form.payment_method} onChange={(event) => onChange({ ...form, payment_method: event.target.value })} className={inputClass}>
                {paymentMethods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
              </select>
            </Field>
            <Field label="Payment Reference">
              <input value={form.payment_reference} onChange={(event) => onChange({ ...form, payment_reference: event.target.value })} className={inputClass} />
            </Field>
          </div>
        </Panel>
        <div className="sticky bottom-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl shadow-slate-200/60 backdrop-blur">
          <ActionButton variant="primary" icon={BadgeCheck} loading={saving} className="w-full" type="submit">
          {saving ? "Saving..." : "Create Invoice"}
          </ActionButton>
        </div>
      </aside>
    </form>
  );
}

function ServiceLines({ lines, onLineChange, onAddLine, onRemoveLine }) {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr><th className="px-3 py-3">Service</th><th className="px-3 py-3">Description</th><th className="px-3 py-3">Qty</th><th className="px-3 py-3">Unit Price</th><th className="px-3 py-3 text-right">Action</th></tr>
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
      <button type="button" onClick={onAddLine} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Plus className="h-4 w-4" />Add Line</button>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-950">{value}</span></div>;
}
