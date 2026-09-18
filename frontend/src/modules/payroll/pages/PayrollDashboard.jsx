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
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function PayrollDashboard({
  dashboard,
  payrolls,
  advances,
  onPayment,
  basePath = "/admin/dashboard",
}) {
                 const { t: autoT } = useAutoTranslation();
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
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label={autoT("legacy.payroll_this_month_048188f4")} value={money(dashboard?.payroll_cost_this_month)} icon={Wallet} tone="blue" trend="up" trendLabel={autoT("legacy.current_4fc0e2bc")} />
        <StatCard label={autoT("legacy.this_year_77528c94")} value={money(dashboard?.payroll_cost_this_year)} icon={CalendarDays} tone="purple" trend="up" trendLabel={autoT("legacy.ytd_c0727edb")} />
        <StatCard label={autoT("legacy.pending_payroll_8ad7743a")} value={money(dashboard?.outstanding_salaries)} icon={CreditCard} tone="rose" trend="down" trendLabel={autoT("legacy.due_145caf29")} />
        <StatCard label={autoT("legacy.employees_paid_d4516dad")} value={dashboard?.active_payroll_staff || 0} icon={Users} tone="green" trend="up" trendLabel={autoT("staff.status.active")} />
        <StatCard label={autoT("legacy.advances_outstanding_97e47e31")} value={money(dashboard?.salary_advances_this_month)} icon={HandCoins} tone="orange" trend="flat" trendLabel={autoT("legacy.this_month_1b478533")} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title={autoT("legacy.employees_awaiting_payment_2b3562dd")} to={`${basePath}/payroll/records`}>
          <div className="divide-y divide-[var(--theme-border)]">
            {awaiting.length ? awaiting.map((payroll) => (
              <div key={payroll.id} className="flex min-h-[52px] items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold theme-text-primary">{payroll.staff_name}</p>
                  <p className="truncate text-[11px] theme-text-muted">{payroll.period_start} {autoT("to")} {payroll.period_end}</p>
                </div>
                <button type="button" onClick={() => onPayment(payroll)} className="theme-btn theme-btn-outline h-8 flex-none px-2.5 text-xs font-semibold tabular-nums text-[var(--theme-danger)]">
                  {money(payroll.remaining_balance)}
                </button>
              </div>
            )) : <EmptyLine label={autoT("legacy.no_salaries_awaiting_payment_2bb4eaac")} />}
          </div>
        </Panel>

        <Panel title={autoT("legacy.upcoming_payroll_4ef67d0e")} to={`${basePath}/payroll/run`}>
          <div className="divide-y divide-[var(--theme-border)]">
            {upcoming.length ? upcoming.map((employee) => (
              <Link key={employee.id} to={`${basePath}/payroll/employees/${employee.id}`} className="flex min-h-[52px] items-center justify-between gap-3 py-2.5 hover:bg-[var(--theme-hover)]">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold theme-text-primary">{employee.name}</p>
                  <p className="truncate text-[11px] capitalize theme-text-muted">{employee.role} - {employee.salary_type}</p>
                </div>
                <div className="flex-none text-right">
                  <p className="text-xs font-semibold tabular-nums theme-text-primary">{money(employee.base_salary)}</p>
                  <p className="text-[11px] theme-text-muted">{autoT("legacy.day_987b9ced")} {employee.payment_day}</p>
                </div>
              </Link>
            )) : <EmptyLine label={autoT("legacy.no_active_salary_profiles_da78b11f")} />}
          </div>
        </Panel>

        <Panel title={autoT("legacy.recent_payments_3abf211c")} to={`${basePath}/payroll/payments`}>
          <Timeline items={recentPayments} empty={autoT("legacy.no_payroll_payments_yet_f2e460cf")} />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title={autoT("legacy.payroll_trend_e542eaae")} description={autoT("legacy.recent_net_payroll_generated_5426ae9a")}>
          <MiniBarChart rows={payrollTrend} tone="blue" empty={autoT("legacy.no_payroll_trend_data_yet_52fb5c55")} />
        </Panel>
        <Panel title={autoT("legacy.payroll_by_role_07ec1b34")} description={autoT("legacy.net_salary_grouped_by_employee_role_or_salary_type_7d07a321")}>
          <MiniBarChart rows={roleRows} tone="purple" empty={autoT("legacy.no_role_breakdown_yet_c64e1ff5")} />
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
  return <p className="rounded-lg bg-[var(--theme-muted)] px-3 py-3 text-xs theme-text-muted">{label}</p>;
}
