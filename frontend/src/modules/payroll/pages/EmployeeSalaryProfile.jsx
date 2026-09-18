import React from "react";
import { Link } from "react-router-dom";
import AdvanceTable from "../components/AdvanceTable";
import PaymentTable from "../components/PaymentTable";
import PayrollTable from "../components/PayrollTable";
import Field from "../../shared/erp/components/Field";
import Panel from "../../shared/erp/components/Panel";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { inputClass } from "../../shared/erp/constants";
import { money } from "../../shared/erp/formatters";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function EmployeeSalaryProfile({
  history,
  form,
  saving,
  onChange,
  onSubmit,
  basePath = "/admin/dashboard",
  isFinance = false,
}) {
                 const { t: autoT } = useAutoTranslation();
  if (!history?.staff) {
    return <p className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">{autoT("legacy.employee_payroll_profile_not_found_d38cf2cd")}</p>;
  }
  const staff = history.staff;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Link to={isFinance ? `${basePath}/payroll` : "/admin/dashboard/staff"} className="text-sm font-semibold text-slate-500 hover:text-slate-950">
          {isFinance ? autoT("legacy.back_to_payroll_f80826fd") : autoT("legacy.back_to_staff_722b93a6")}
        </Link>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-950">{staff.name}</h2>
            <p className="mt-2 text-sm text-slate-500">{staff.role} - {staff.email} - {staff.phone}</p>
          </div>
          <StatusBadge status={form.is_payroll_active ? "active" : "inactive"} />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric label={autoT("legacy.total_earnings_6139a8f5")} value={money(history.total_earnings)} />
          <Metric label={autoT("legacy.total_paid_6a151d73")} value={money(history.total_paid)} />
          <Metric label={autoT("legacy.deductions_757bbae2")} value={money(history.total_deductions)} />
          <Metric label={autoT("legacy.advances_232e6c98")} value={money(history.total_advances)} />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={onSubmit}>
          <Panel title={autoT("legacy.salary_profile_9a478a14")}>
            <div className="space-y-4">
              <Field label={autoT("legacy.salary_type_2addb1fc")}>
                <select value={form.salary_type} onChange={(event) => onChange({ ...form, salary_type: event.target.value })} className={inputClass}>
                  <option value="monthly">{autoT("legacy.monthly_d31edb7b")}</option>
                  <option value="weekly">{autoT("legacy.weekly_158f3da5")}</option>
                  <option value="daily">{autoT("legacy.daily_728298d3")}</option>
                  <option value="hourly">{autoT("legacy.hourly_d9362548")}</option>
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={autoT("legacy.base_salary_c4cbb902")}>
                  <input type="number" min="0" step="0.01" value={form.payroll_base_salary} onChange={(event) => onChange({ ...form, payroll_base_salary: event.target.value })} className={inputClass} />
                </Field>
                <Field label={autoT("legacy.payment_day_e79a79cd")}>
                  <input type="number" min="1" max="31" value={form.payment_day} onChange={(event) => onChange({ ...form, payment_day: event.target.value })} className={inputClass} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label={autoT("legacy.allowances_60a83b2a")}>
                  <input type="number" min="0" step="0.01" value={form.payroll_allowances} onChange={(event) => onChange({ ...form, payroll_allowances: event.target.value })} className={inputClass} />
                </Field>
                <Field label={autoT("legacy.deductions_757bbae2")}>
                  <input type="number" min="0" step="0.01" value={form.payroll_deductions} onChange={(event) => onChange({ ...form, payroll_deductions: event.target.value })} className={inputClass} />
                </Field>
              </div>
              <Field label={autoT("legacy.overtime_rate_67dc2221")}>
                <input type="number" min="0" step="0.01" value={form.overtime_rate} onChange={(event) => onChange({ ...form, overtime_rate: event.target.value })} className={inputClass} />
              </Field>
              <Field label={autoT("legacy.payroll_notes_cd961ece")}>
                <textarea value={form.payroll_notes} onChange={(event) => onChange({ ...form, payroll_notes: event.target.value })} className={`${inputClass} min-h-24`} />
              </Field>
              <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={form.is_payroll_active} onChange={(event) => onChange({ ...form, is_payroll_active: event.target.checked })} />
                {autoT("legacy.active_payroll_status_c1c3ff4a")}
              </label>
              <button disabled={saving} className="w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                {saving ? autoT("saving") : autoT("legacy.save_salary_profile_8515490d")}
              </button>
            </div>
          </Panel>
        </form>
        <div className="space-y-4">
          <PayrollTable payrolls={history.payrolls || []} basePath={basePath} />
          <PaymentTable payments={history.payments || []} />
          <AdvanceTable advances={history.advances || []} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}
