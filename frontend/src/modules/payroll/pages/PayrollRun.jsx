import React from "react";
import { BadgeCheck, Check } from "lucide-react";
import ActionButton from "../../shared/erp/components/ActionButton";
import Field from "../../shared/erp/components/Field";
import FormSection from "../../shared/erp/components/FormSection";
import Panel from "../../shared/erp/components/Panel";
import { inputClass } from "../../shared/erp/constants";
import { money } from "../../shared/erp/formatters";

export default function PayrollRun({ form, staffOptions, saving, onChange, onToggleStaff, onSubmit }) {
  const allSelected = staffOptions.length > 0 && form.staff_ids.length === staffOptions.length;
  const selectedEmployees = form.staff_ids.length === 0 ? "All active payroll employees" : `${form.staff_ids.length} selected`;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        <FormSection title="Payroll Period" description="Choose the period and generation cadence.">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Run Type">
              <select value={form.period_type} onChange={(event) => onChange({ ...form, period_type: event.target.value })} className={inputClass}>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </Field>
            <Field label="Start Date" required>
              <input required type="date" value={form.period_start} onChange={(event) => onChange({ ...form, period_start: event.target.value })} className={inputClass} />
            </Field>
            <Field label="End Date" required>
              <input required type="date" value={form.period_end} onChange={(event) => onChange({ ...form, period_end: event.target.value })} className={inputClass} />
            </Field>
          </div>
        </FormSection>
        <Panel title="Employee Selection">
          <p className="text-2xl font-semibold text-slate-950">{selectedEmployees}</p>
          <button type="button" onClick={() => onChange({ ...form, staff_ids: allSelected ? [] : staffOptions.map((employee) => employee.value) })} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Check className="h-4 w-4" />
            {allSelected ? "Use All" : "Select All"}
          </button>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <FormSection title="Adjustments" description="Optional payroll-level additions and deductions for this run.">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Bonuses", "bonus"],
              ["Overtime Hours", "overtime_hours"],
              ["Regular Days", "regular_days"],
              ["Regular Hours", "regular_hours"],
            ].map(([label, key]) => (
              <Field key={key} label={label}>
                <input type="number" min="0" step="0.01" value={form[key]} onChange={(event) => onChange({ ...form, [key]: event.target.value })} className={inputClass} />
              </Field>
            ))}
          </div>
          <Field label="Notes">
            <textarea value={form.notes} onChange={(event) => onChange({ ...form, notes: event.target.value })} className={`${inputClass} mt-4 min-h-24`} />
          </Field>
        </FormSection>
        <Panel title="Employees">
          <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {staffOptions.length ? staffOptions.map((employee) => {
              const selected = form.staff_ids.includes(employee.value);
              return (
                <button type="button" key={employee.value} onClick={() => onToggleStaff(employee.value)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${selected ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                  <span><span className="block text-sm font-semibold">{employee.label}</span><span className="text-xs opacity-75">{employee.role} - {employee.salary_type}</span></span>
                  <span className="text-sm font-semibold">{money(employee.base_salary)}</span>
                </button>
              );
            }) : <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">No payroll-active employees.</p>}
          </div>
        </Panel>
      </div>
      <div className="sticky bottom-4 flex justify-end rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl shadow-slate-200/60 backdrop-blur">
        <ActionButton variant="primary" icon={BadgeCheck} loading={saving} type="submit">
          {saving ? "Generating..." : "Generate Payroll"}
        </ActionButton>
      </div>
    </form>
  );
}
