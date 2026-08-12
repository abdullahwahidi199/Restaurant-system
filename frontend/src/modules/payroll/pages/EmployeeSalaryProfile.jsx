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

export default function EmployeeSalaryProfile({
  history,
  form,
  saving,
  onChange,
  onSubmit,
  basePath = "/admin/dashboard",
  isFinance = false,
}) {
  if (!history?.staff) {
    return <p className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">Employee payroll profile not found.</p>;
  }
  const staff = history.staff;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Link to={isFinance ? `${basePath}/payroll` : "/admin/dashboard/staff"} className="text-sm font-semibold text-slate-500 hover:text-slate-950">
          {isFinance ? "Back to payroll" : "Back to staff"}
        </Link>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-950">{staff.name}</h2>
            <p className="mt-2 text-sm text-slate-500">{staff.role} - {staff.email} - {staff.phone}</p>
          </div>
          <StatusBadge status={form.is_payroll_active ? "active" : "inactive"} />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric label="Total Earnings" value={money(history.total_earnings)} />
          <Metric label="Total Paid" value={money(history.total_paid)} />
          <Metric label="Deductions" value={money(history.total_deductions)} />
          <Metric label="Advances" value={money(history.total_advances)} />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={onSubmit}>
          <Panel title="Salary Profile">
            <div className="space-y-4">
              <Field label="Salary Type">
                <select value={form.salary_type} onChange={(event) => onChange({ ...form, salary_type: event.target.value })} className={inputClass}>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                  <option value="hourly">Hourly</option>
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Base Salary">
                  <input type="number" min="0" step="0.01" value={form.payroll_base_salary} onChange={(event) => onChange({ ...form, payroll_base_salary: event.target.value })} className={inputClass} />
                </Field>
                <Field label="Payment Day">
                  <input type="number" min="1" max="31" value={form.payment_day} onChange={(event) => onChange({ ...form, payment_day: event.target.value })} className={inputClass} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Allowances">
                  <input type="number" min="0" step="0.01" value={form.payroll_allowances} onChange={(event) => onChange({ ...form, payroll_allowances: event.target.value })} className={inputClass} />
                </Field>
                <Field label="Deductions">
                  <input type="number" min="0" step="0.01" value={form.payroll_deductions} onChange={(event) => onChange({ ...form, payroll_deductions: event.target.value })} className={inputClass} />
                </Field>
              </div>
              <Field label="Overtime Rate">
                <input type="number" min="0" step="0.01" value={form.overtime_rate} onChange={(event) => onChange({ ...form, overtime_rate: event.target.value })} className={inputClass} />
              </Field>
              <Field label="Payroll Notes">
                <textarea value={form.payroll_notes} onChange={(event) => onChange({ ...form, payroll_notes: event.target.value })} className={`${inputClass} min-h-24`} />
              </Field>
              <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={form.is_payroll_active} onChange={(event) => onChange({ ...form, is_payroll_active: event.target.checked })} />
                Active Payroll Status
              </label>
              <button disabled={saving} className="w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                {saving ? "Saving..." : "Save Salary Profile"}
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
