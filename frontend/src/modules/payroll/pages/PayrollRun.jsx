import React from "react";
import { BadgeCheck, Check } from "lucide-react";
import ActionButton from "../../shared/erp/components/ActionButton";
import Field from "../../shared/erp/components/Field";
import FormSection from "../../shared/erp/components/FormSection";
import Panel from "../../shared/erp/components/Panel";
import { inputClass } from "../../shared/erp/constants";
import { money } from "../../shared/erp/formatters";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function PayrollRun({ form, staffOptions, saving, onChange, onToggleStaff, onSubmit }) {
  const { t: autoT } = useAutoTranslation();
  const allSelected = staffOptions.length > 0 && form.staff_ids.length === staffOptions.length;
  const selectedCount = form.staff_ids.length === 0 ? staffOptions.length : form.staff_ids.length;
  const selectedEmployees = staffOptions.length === 0
    ? "0 selected"
    : form.staff_ids.length === 0
      ? "All active payroll employees"
      : `${selectedCount} selected`;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormSection
        title={autoT("legacy.payroll_period_502ac61c")}
        description={autoT("legacy.choose_the_period_and_generation_cadence_170a4251")}
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Field label={autoT("legacy.run_type_3884182b")}>
            <select value={form.period_type} onChange={(event) => onChange({ ...form, period_type: event.target.value })} className={inputClass}>
              <option value="monthly">{autoT("legacy.monthly_d31edb7b")}</option>
              <option value="weekly">{autoT("legacy.weekly_158f3da5")}</option>
            </select>
          </Field>
          <Field label={autoT("inventory_manager.reports.start_date")} required>
            <input required type="date" value={form.period_start} onChange={(event) => onChange({ ...form, period_start: event.target.value })} className={inputClass} />
          </Field>
          <Field label={autoT("inventory_manager.reports.end_date")} required>
            <input required type="date" value={form.period_end} onChange={(event) => onChange({ ...form, period_end: event.target.value })} className={inputClass} />
          </Field>
        </div>
      </FormSection>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <Panel
          title={autoT("legacy.employee_selection_d25abe43")}
          description={form.staff_ids.length === 0 ? selectedEmployees : `${selectedCount} selected of ${staffOptions.length}`}
          className="min-w-0 border-t-2 border-t-[var(--theme-primary)]"
          actions={(
            <button
              type="button"
              onClick={() => onChange({ ...form, staff_ids: allSelected ? [] : staffOptions.map((employee) => employee.value) })}
              className="theme-btn theme-btn-outline h-8 px-3 text-xs"
            >
              <Check className="h-3.5 w-3.5" />
              {allSelected ? autoT("legacy.use_all_ffafa96d") : autoT("legacy.select_all_86a599ef")}
            </button>
          )}
        >
          <div className="max-h-[29rem] overflow-y-auto rounded-lg border border-[var(--theme-border)]">
            {staffOptions.length ? staffOptions.map((employee) => {
              const selected = form.staff_ids.includes(employee.value);
              return (
                <button
                  type="button"
                  key={employee.value}
                  onClick={() => onToggleStaff(employee.value)}
                  aria-pressed={selected}
                  className={`flex min-h-11 w-full items-center gap-2.5 border-b border-[var(--theme-border)] px-3 py-1.5 text-left transition last:border-b-0 ${selected ? "bg-[var(--theme-primary-subtle)]" : "hover:bg-[var(--theme-hover)]"}`}
                >
                  <span className={`flex h-4 w-4 flex-none items-center justify-center rounded border ${selected ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-text-inverse)]" : "border-[var(--theme-border-strong)]"}`}>
                    {selected && <Check className="h-3 w-3" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold theme-text-primary">{employee.label}</span>
                    <span className="block truncate text-[11px] capitalize theme-text-muted">{employee.role} - {employee.salary_type}</span>
                  </span>
                  <span className="flex-none text-right text-xs font-semibold tabular-nums theme-text-primary">{money(employee.base_salary)}</span>
                </button>
              );
            }) : <p className="px-3 py-4 text-xs theme-text-muted">{autoT("legacy.no_payroll_active_employees_2f641484")}</p>}
          </div>
        </Panel>

        <FormSection title={autoT("legacy.adjustments_ce5b2f72")} description={autoT("legacy.optional_payroll_level_additions_and_deductions_for_th_bd892a0f")}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {[
              ["Bonuses", "bonus"],
              ["Overtime Hours", "overtime_hours"],
              ["Regular Days", "regular_days"],
              ["Regular Hours", "regular_hours"],
            ].map(([label, key]) => (
              <Field key={key} label={label}>
                <input type="number" min="0" step="0.01" value={form[key]} onChange={(event) => onChange({ ...form, [key]: event.target.value })} className={`${inputClass} text-right tabular-nums`} />
              </Field>
            ))}
          </div>
          <div className="mt-3">
            <Field label={autoT("inventory_manager.common.notes")}>
              <textarea value={form.notes} onChange={(event) => onChange({ ...form, notes: event.target.value })} className={`${inputClass} h-auto min-h-20 py-2.5`} />
            </Field>
          </div>
        </FormSection>
      </div>

      <div className="theme-raised sticky bottom-3 z-20 flex flex-col gap-2 rounded-lg bg-[rgb(var(--theme-surface-rgb)/0.96)] p-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold theme-text-primary">{selectedEmployees}</p>
        </div>
        <ActionButton variant="primary" icon={BadgeCheck} loading={saving} type="submit">
          {saving ? autoT("legacy.generating_81362292") : autoT("legacy.generate_payroll_984c7f23")}
        </ActionButton>
      </div>
    </form>
  );
}
