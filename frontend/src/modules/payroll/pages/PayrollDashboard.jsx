import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CreditCard, HandCoins, Users, Wallet } from "lucide-react";
import MiniBarChart from "../../shared/erp/components/MiniBarChart";
import Panel from "../../shared/erp/components/Panel";
import StatCard from "../../shared/erp/components/StatCard";
import Timeline from "../../shared/erp/components/Timeline";
import { money } from "../../shared/erp/formatters";
import AdvanceTable from "../components/AdvanceTable";
import PayrollTable from "../components/PayrollTable";

export default function PayrollDashboard({
  dashboard,
  payrolls,
  advances,
  onPayment,
  basePath = "/admin/dashboard",
}) {
  const awaiting = dashboard?.employees_awaiting_payment || [];
  const recentPayments = dashboard?.recent_payments || [];
  const upcoming = dashboard?.upcoming_payroll || [];
  const payrollTrend = payrolls.slice(0, 7).map((payroll) => ({
    label: payroll.period_start || payroll.staff_name,
    value: payroll.net_salary,
    tone: "blue",
  }));
  const roleRows = Object.entries(
    payrolls.reduce((acc, payroll) => {
      const key = payroll.staff?.role || payroll.salary_type || payroll.period_type || "Payroll";
      acc[key] = (acc[key] || 0) + Number(payroll.net_salary || 0);
      return acc;
    }, {}),
  ).map(([label, value]) => ({ label, value, tone: "purple" }));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Payroll This Month" value={money(dashboard?.payroll_cost_this_month)} icon={Wallet} tone="blue" trend="up" trendLabel="Current" />
        <StatCard label="This Year" value={money(dashboard?.payroll_cost_this_year)} icon={CalendarDays} tone="purple" trend="up" trendLabel="YTD" />
        <StatCard label="Pending Payroll" value={money(dashboard?.outstanding_salaries)} icon={CreditCard} tone="rose" trend="down" trendLabel="Due" />
        <StatCard label="Employees Paid" value={dashboard?.active_payroll_staff || 0} icon={Users} tone="green" trend="up" trendLabel="Active" />
        <StatCard label="Advances Outstanding" value={money(dashboard?.salary_advances_this_month)} icon={HandCoins} tone="orange" trend="flat" trendLabel="This month" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Employees Awaiting Payment" to={`${basePath}/payroll/records`}>
          <div className="space-y-2">
            {awaiting.length ? awaiting.map((payroll) => (
              <div key={payroll.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
                <div>
                  <p className="font-semibold text-slate-950">{payroll.staff_name}</p>
                  <p className="text-xs text-slate-500">{payroll.period_start} to {payroll.period_end}</p>
                </div>
                <button type="button" onClick={() => onPayment(payroll)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-slate-50">
                  {money(payroll.remaining_balance)}
                </button>
              </div>
            )) : <EmptyLine label="No salaries awaiting payment." />}
          </div>
        </Panel>

        <Panel title="Upcoming Payroll" to={`${basePath}/payroll/run`}>
          <div className="space-y-2">
            {upcoming.length ? upcoming.map((employee) => (
              <Link key={employee.id} to={`${basePath}/payroll/employees/${employee.id}`} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-950">{employee.name}</p>
                  <p className="text-xs capitalize text-slate-500">{employee.role} - {employee.salary_type}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-slate-950">{money(employee.base_salary)}</p>
                  <p className="text-xs text-slate-500">Day {employee.payment_day}</p>
                </div>
              </Link>
            )) : <EmptyLine label="No active salary profiles." />}
          </div>
        </Panel>

        <Panel title="Recent Payments" to={`${basePath}/payroll/payments`}>
          <Timeline items={recentPayments} empty="No payroll payments yet." />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Payroll Trend" description="Recent net payroll generated.">
          <MiniBarChart rows={payrollTrend} tone="blue" empty="No payroll trend data yet." />
        </Panel>
        <Panel title="Payroll By Role" description="Net salary grouped by employee role or salary type.">
          <MiniBarChart rows={roleRows} tone="purple" empty="No role breakdown yet." />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PayrollTable payrolls={payrolls.slice(0, 8)} onPayment={onPayment} basePath={basePath} />
        <AdvanceTable advances={advances.slice(0, 8)} />
      </div>
    </div>
  );
}

function EmptyLine({ label }) {
  return <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">{label}</p>;
}
