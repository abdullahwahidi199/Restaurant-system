import React from "react";
import Select from "react-select";
import { Check, Save } from "lucide-react";
import ActionButton from "../../shared/erp/components/ActionButton";
import Field from "../../shared/erp/components/Field";
import FormSection from "../../shared/erp/components/FormSection";
import Panel from "../../shared/erp/components/Panel";
import { inputClass, paymentMethods, selectTheme } from "../../shared/erp/constants";
import { money } from "../../shared/erp/formatters";
import PurchaseLineEditor from "../components/PurchaseLineEditor";

export default function CreatePurchaseInvoice({
  form,
  suppliers,
  ingredients,
  ingredientMap,
  invoiceTotal,
  paidInitially,
  remainingBalance,
  saving,
  onField,
  onLineChange,
  onAddLine,
  onRemoveLine,
  onSubmit,
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <FormSection title="Invoice Details" description="Supplier and purchase timing. Invoice numbers are generated automatically.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Supplier">
              <Select
                options={suppliers}
                styles={selectTheme}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                value={suppliers.find((option) => String(option.value) === String(form.supplier)) || null}
                onChange={(option) => onField("supplier", option?.value || "")}
                placeholder="Cash purchase"
                isClearable
              />
            </Field>
            <Field label="Purchase Date" required>
              <input type="date" value={form.purchase_date} onChange={(event) => onField("purchase_date", event.target.value)} className={inputClass} required />
            </Field>
            <Field label="Due Date">
              <input type="date" value={form.due_date} onChange={(event) => onField("due_date", event.target.value)} className={inputClass} disabled={!form.supplier} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Purchased Ingredients" description="Quantities are entered in purchasing units and normalized before saving.">
          <PurchaseLineEditor
            lines={form.lines}
            ingredients={ingredients}
            ingredientMap={ingredientMap}
            onLineChange={onLineChange}
            onAddLine={onAddLine}
            onRemoveLine={onRemoveLine}
          />
        </FormSection>
        <FormSection title="Notes">
          <textarea rows={3} value={form.notes} onChange={(event) => onField("notes", event.target.value)} className={inputClass} placeholder="Optional" />
        </FormSection>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
        <Panel title="Invoice Summary">
          <div className="space-y-3 text-sm">
            <SummaryRow label="Invoice Total" value={money(invoiceTotal)} />
            <SummaryRow label="Amount Paid" value={money(paidInitially)} />
            <SummaryRow label="Remaining" value={money(remainingBalance)} strong />
          </div>
          <div className="mt-5 space-y-4">
            <Field label="Amount Paid Initially">
              <input type="number" step="0.01" value={form.amount_paid} onChange={(event) => onField("amount_paid", event.target.value)} className={inputClass} />
            </Field>
            <Field label="Payment Method">
              <select value={form.payment_method} onChange={(event) => onField("payment_method", event.target.value)} className={inputClass}>
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </Panel>
        <div className="sticky bottom-4 grid gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl shadow-slate-200/60 backdrop-blur">
          <ActionButton type="button" variant="primary" icon={Check} loading={saving} onClick={() => onSubmit("unpaid")}>
            Create Invoice
          </ActionButton>
          <ActionButton type="button" icon={Save} loading={saving} onClick={() => onSubmit("draft")}>
            Save Draft
          </ActionButton>
        </div>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? "font-semibold text-slate-950" : "font-medium text-slate-800"}>
        {value}
      </span>
    </div>
  );
}
