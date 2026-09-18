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
import { useTranslation as useAutoTranslation } from "react-i18next";

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
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
      <div className="min-w-0 space-y-4">
        <FormSection title={autoT("legacy.invoice_details_397a6f30")} description={autoT("legacy.supplier_and_purchase_timing_invoice_numbers_are_gener_9ce429f1")}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Field label={autoT("inventory_manager.common.supplier")}>
              <Select
                options={suppliers}
                styles={selectTheme}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                value={suppliers.find((option) => String(option.value) === String(form.supplier)) || null}
                onChange={(option) => onField("supplier", option?.value || "")}
                placeholder={autoT("legacy.cash_purchase_13708ac2")}
                isClearable
              />
            </Field>
            <Field label={autoT("inventory_manager.common.purchase_date")} required>
              <input type="date" value={form.purchase_date} onChange={(event) => onField("purchase_date", event.target.value)} className={inputClass} required />
            </Field>
            <Field label={autoT("legacy.due_date_a1b308ec")}>
              <input type="date" value={form.due_date} onChange={(event) => onField("due_date", event.target.value)} className={inputClass} disabled={!form.supplier} />
            </Field>
          </div>
        </FormSection>

        <FormSection className="border-t-2 border-t-[var(--theme-primary)]" title={autoT("legacy.purchased_ingredients_d184418c")} description={autoT("legacy.quantities_are_entered_in_purchasing_units_and_normali_f821939a")}>
          <PurchaseLineEditor
            lines={form.lines}
            ingredients={ingredients}
            ingredientMap={ingredientMap}
            onLineChange={onLineChange}
            onAddLine={onAddLine}
            onRemoveLine={onRemoveLine}
          />
        </FormSection>
        <FormSection title={autoT("inventory_manager.common.notes")}>
          <textarea rows={3} value={form.notes} onChange={(event) => onField("notes", event.target.value)} className={`${inputClass} h-auto min-h-20 py-2.5`} placeholder={autoT("customerAuth.shared.optional")} />
        </FormSection>
      </div>

      <aside className="xl:sticky xl:top-4 xl:self-start">
        <Panel title={autoT("legacy.invoice_summary_e59cb37d")} className="theme-card-raised overflow-hidden border-t-2 border-t-[var(--theme-primary)]">
          <div className="space-y-2.5">
            <SummaryRow label={autoT("legacy.invoice_total_76dac385")} value={money(invoiceTotal)} emphasis="total" />
            <SummaryRow label={autoT("legacy.amount_paid_a2dc17b5")} value={money(paidInitially)} />
            <div className="border-t border-[var(--theme-border)] pt-2.5">
              <SummaryRow label={autoT("legacy.remaining_cc632b5e")} value={money(remainingBalance)} emphasis="balance" />
            </div>
          </div>
          <div className="mt-4 space-y-3 border-t border-[var(--theme-border)] pt-4">
            <Field label={autoT("legacy.amount_paid_initially_79efbd27")}>
              <input type="text" inputMode="decimal" value={form.amount_paid} onChange={(event) => onField("amount_paid", event.target.value)} className={`${inputClass} text-right tabular-nums`} />
            </Field>
            <Field label={autoT("legacy.payment_method_f383f6a2")}>
              <select value={form.payment_method} onChange={(event) => onField("payment_method", event.target.value)} className={inputClass}>
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="mt-4 grid gap-2 border-t border-[var(--theme-border)] pt-4">
            <ActionButton className="w-full" type="button" variant="primary" icon={Check} loading={saving} onClick={() => onSubmit("unpaid")}>
              {autoT("legacy.create_invoice_32815b0b")}
            </ActionButton>
            <ActionButton className="w-full" type="button" variant="outline" icon={Save} loading={saving} onClick={() => onSubmit("draft")}>
              {autoT("legacy.save_draft_cc1316dd")}
            </ActionButton>
          </div>
        </Panel>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value, emphasis }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs theme-text-muted">{label}</span>
      <span className={
        emphasis === "total"
          ? "text-lg font-bold tabular-nums theme-text-primary"
          : emphasis === "balance"
            ? "text-[15px] font-semibold tabular-nums text-[var(--theme-danger)]"
            : "text-[13px] font-medium tabular-nums theme-text-secondary"
      }>
        {value}
      </span>
    </div>
  );
}
