import React, { useCallback, useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  XCircle,
  CheckCircle,
  Utensils,
  Truck,
  Users,
  Activity,
} from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";
import i18n from "../../../i18n";
import ErpStatusBadge from "../../../modules/shared/erp/components/StatusBadge";
import ReportHeader from "./ReportHeader";
const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AFN",
  }).format(Number(value || 0));

const formatPercent = (value = 0) => `${Number(value || 0).toFixed(1)}%`;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatLabel = (value = "") =>
  value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const formatValue = (key, value) => {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "number") {
    if (
      /(amount|salary|cost|revenue|price|wage|bonus|deduction|total|payroll)/i.test(
        key,
      )
    ) {
      return formatCurrency(value);
    }
    return value.toLocaleString();
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return formatDate(value);
  }

  return value;
};

function StatusBadge({ status }) {
  return <ErpStatusBadge status={String(status || "unknown").toLowerCase()} label={status || "-"} />;
}

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="theme-card p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold theme-text-primary">{title}</h3>
        {subtitle && <p className="mt-1 text-xs theme-text-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value, helper }) {
  return (
    <div className="theme-kpi-card p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide theme-text-muted">{label}</p>
        <span className="h-2 w-2 rounded-full bg-[var(--theme-primary)]" />
      </div>
      <p className="mt-2 truncate text-xl font-semibold tabular-nums theme-text-primary" title={String(value)}>{value}</p>
      {helper && <p className="mt-1 truncate text-xs theme-text-muted">{helper}</p>}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--theme-border-strong)] bg-[var(--theme-muted)] px-4 py-8 text-center text-sm theme-text-muted">
      {message}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-lg border border-[var(--theme-border)] bg-[var(--theme-muted)]"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-lg border border-[var(--theme-border)] bg-[var(--theme-muted)]" />
        <div className="h-72 animate-pulse rounded-lg border border-[var(--theme-border)] bg-[var(--theme-muted)]" />
      </div>

      <div className="h-80 animate-pulse rounded-lg border border-[var(--theme-border)] bg-[var(--theme-muted)]" />
    </div>
  );
}

function DataTable({ columns, rows, emptyText = i18n.t("legacy.no_data_available_929ebf20") }) {
  return (
    <div className="theme-table overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key || column.label}
                  className="whitespace-nowrap px-4 py-3 text-start font-medium"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--theme-border)]">
            {rows?.length ? (
              rows.map((row, rowIndex) => (
                <tr
                  key={`${row.staff_id ?? row.id ?? row.date ?? rowIndex}-${rowIndex}`}
                  className="transition hover:bg-[var(--theme-hover)]"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key || column.label}
                      className="whitespace-nowrap px-4 py-3 theme-text-secondary"
                    >
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : formatValue(column.key, row[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="px-4 py-8 text-center theme-text-muted"
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function StaffReport({ startDate, endDate }) {
                 const { t: autoT } = useAutoTranslation();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStaffReport = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const res = await instance.get("/reports/generate_report/", {
        params: {
          type: "staff",
          start: startDate,
          end: endDate,
        },
      });

      setReportData(res.data || null);
      console.log("Fetched Staff Report:", res.data);
    } catch (err) {
      console.error(err);
      setError(autoT("legacy.failed_to_fetch_report_data_7b534284"));
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const handleGeneratePDF = async () => {
    try {
      const res = await instance.get("/reports/staff-pdf/", {
        params: {
          start: startDate,
          end: endDate,
        },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "staff_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchStaffReport();
    } else {
      setReportData(null);
    }
  }, [startDate, endDate, fetchStaffReport]);

  const report = reportData?.data || {};
  const totals = report.totals || {};
  const byRole = report.by_role || [];
  const attendanceSummary = report.attendance_summary || [];
  const dailyAttendance = report.daily_attendance || [];
  const waiterPerformance = report.waiter_performance || [];
  const deliveryPerformance = report.delivery_performance || [];
  const cashierPerformance = report.cashier_performance || [];
  const payrollSummary = report.payroll_summary || [];
  const salaryHistory = report.salary_history || [];
  const payrollHistory = report.payroll_history || [];
  const payrollPaymentHistory = report.payroll_payment_history || [];
  const advanceHistory = report.advance_history || [];
  const employeeEarnings = report.employee_earnings || [];
  const employeeDeductions = report.employee_deductions || [];
  const hasReport = !!reportData;

  return (
    <div className="space-y-4">
      <ReportHeader
        onExport={handleGeneratePDF}
        exportLabel={autoT("inventory_manager.reports.generate_pdf")}
        disabled={loading || !hasReport}
      />

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] px-4 py-3 text-sm text-[var(--theme-danger-hover)]">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !hasReport ? (
        <LoadingSkeleton />
      ) : !hasReport ? (
        <SectionCard
          title={autoT("legacy.no_report_data_61d72fc6")}
          subtitle={autoT("legacy.select_a_valid_date_range_to_load_the_staff_report_c7143bbd")}
        >
          <EmptyState message={autoT("legacy.no_staff_report_available_yet_5e1e5d5c")} />
        </SectionCard>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={autoT("dashboard.stats.total_staff")}
              value={totals.total_staff ?? 0}
              helper={autoT("legacy.all_registered_staff_members_825188be")}
              dotClass="bg-blue-500"
            />
            <StatCard
              label={autoT("legacy.active_staff_3734abf7")}
              value={totals.active_staff ?? 0}
              helper={autoT("legacy.currently_active_employees_6fbc4a13")}
              dotClass="bg-emerald-500"
            />
            <StatCard
              label={autoT("legacy.inactive_staff_1430cb8f")}
              value={totals.inactive_staff ?? 0}
              helper={autoT("legacy.currently_inactive_employees_ba038caf")}
              dotClass="bg-rose-500"
            />

            <StatCard
              label={autoT("dashboard.stats.attendance_rate")}
              value={formatPercent(totals.attendance_rate_percent ?? 0)}
              helper={autoT("legacy.overall_attendance_percentage_0db46369")}
              dotClass="bg-amber-500"
            />
            <StatCard
              label={autoT("legacy.present_days_c4551e54")}
              value={totals.present_days ?? 0}
              helper={autoT("legacy.total_present_attendance_entries_6b20774d")}
              dotClass="bg-emerald-500"
            />
            <StatCard
              label={autoT("legacy.attendance_records_28a8490d")}
              value={totals.total_attendance_records ?? 0}
              helper={autoT("legacy.all_attendance_records_in_period_f421d4de")}
              dotClass="bg-cyan-500"
            />
            <StatCard
              label={autoT("legacy.payroll_cost_36af4f9a")}
              value={formatCurrency(totals.total_payroll_cost ?? 0)}
              helper={autoT("legacy.approved_salary_expense_aeda26fb")}
              dotClass="bg-slate-700"
            />
            <StatCard
              label={autoT("legacy.payroll_paid_33886cf9")}
              value={formatCurrency(totals.total_payroll_paid ?? 0)}
              helper={autoT("legacy.salary_cash_paid_49018b17")}
              dotClass="bg-emerald-500"
            />
            <StatCard
              label={autoT("legacy.outstanding_salaries_d5f97e4e")}
              value={formatCurrency(totals.outstanding_salaries ?? 0)}
              helper={autoT("legacy.approved_salaries_unpaid_01284335")}
              dotClass="bg-rose-500"
            />
            <StatCard
              label={autoT("legacy.salary_advances_e8cda02b")}
              value={formatCurrency(totals.salary_advances ?? 0)}
              helper={autoT("legacy.advances_issued_in_period_f256c140")}
              dotClass="bg-amber-500"
            />
          </div>

          {/* Role + Attendance Breakdown */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SectionCard
              title={autoT("legacy.staff_by_role_bbcc24bd")}
              subtitle={autoT("legacy.distribution_of_employees_across_roles_672132d0")}
            >
              {byRole.length ? (
                <div className="space-y-4">
                  {byRole.map((item, index) => {
                    const percentage = totals.total_staff
                      ? (item.count / totals.total_staff) * 100
                      : 0;

                    return (
                      <div key={`${item.role}-${index}`}>
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <p className="font-medium theme-text-primary">
                              {formatLabel(item.role)}
                            </p>
                            <p className="text-xs theme-text-muted">
                              {formatPercent(percentage)} {autoT("legacy.of_total_staff_b9a1e0ed")}
                            </p>
                          </div>
                          <span className="rounded-md bg-[var(--theme-muted)] px-2.5 py-1 text-xs font-semibold theme-text-secondary">
                            {item.count}
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--theme-muted)]">
                          <div
                            className="h-full rounded-full bg-[var(--theme-primary)]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState message={autoT("legacy.no_role_breakdown_available_7b3d1125")} />
              )}
            </SectionCard>

            <SectionCard
              title={autoT("legacy.attendance_summary_8324113f")}
              subtitle={autoT("legacy.attendance_status_distribution_for_the_selected_period_1f157c17")}
            >
              {attendanceSummary.length ? (
                <div className="space-y-4">
                  {attendanceSummary.map((item, index) => {
                    const percentage = totals.total_attendance_records
                      ? (item.count / totals.total_attendance_records) * 100
                      : 0;

                    return (
                      <div key={`${item.status}-${index}`}>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <StatusBadge status={item.status} />
                            <span className="text-sm theme-text-secondary">
                              {formatPercent(percentage)}
                            </span>
                          </div>

                          <span className="rounded-md bg-[var(--theme-muted)] px-2.5 py-1 text-xs font-semibold theme-text-secondary">
                            {item.count}
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--theme-muted)]">
                          <div
                            className="h-full rounded-full bg-[var(--theme-primary)]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState message={autoT("legacy.no_attendance_summary_found_d83b7986")} />
              )}
            </SectionCard>
          </div>

          {/* Daily Attendance */}
          <SectionCard
            title={autoT("legacy.daily_attendance_24aeb891")}
            subtitle={autoT("legacy.daily_attendance_records_by_date_and_status_722af982")}
          >
            <DataTable
              columns={[
                {
                  key: "date",
                  label: autoT("table.date"),
                  render: (value) => formatDate(value),
                },
                {
                  key: "status",
                  label: autoT("table.status"),
                  render: (value) => <StatusBadge status={value} />,
                },
                {
                  key: "count",
                  label: autoT("legacy.count_66e12969"),
                },
              ]}
              rows={dailyAttendance}
              emptyText={autoT("legacy.no_daily_attendance_records_found_45c8a68e")}
            />
          </SectionCard>

          {/* Performance Tables */}
          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-3">
            <SectionCard
              title={autoT("legacy.waiter_performance_bc62cb45")}
              subtitle={autoT("legacy.orders_handled_completed_orders_and_revenue_1695bf4e")}
            >
              <DataTable
                columns={[
                  { key: "staff_id", label: autoT("legacy.staff_id_e46c7ef1") },
                  { key: "staff_name", label: autoT("staff_name") },
                  { key: "orders_handled", label: autoT("legacy.orders_handled_5b686e77") },
                  { key: "completed_orders", label: autoT("legacy.completed_orders_1d9ba042") },
                  {
                    key: "revenue",
                    label: autoT("dashboard.best_selling.revenue"),
                    render: (value) => formatCurrency(value),
                  },
                ]}
                rows={waiterPerformance}
                emptyText={autoT("legacy.no_waiter_performance_data_found_20eb1f59")}
              />
            </SectionCard>

            <SectionCard
              title={autoT("legacy.delivery_performance_79ed520d")}
              subtitle={autoT("legacy.deliveries_handled_delivered_orders_and_revenue_09efe039")}
            >
              <DataTable
                columns={[
                  { key: "staff_id", label: autoT("legacy.staff_id_e46c7ef1") },
                  { key: "staff_name", label: autoT("staff_name") },
                  { key: "deliveries_handled", label: autoT("legacy.deliveries_handled_3b9298cd") },
                  { key: "delivered", label: autoT("legacy.delivered_eea956cd") },
                  {
                    key: "revenue",
                    label: autoT("dashboard.best_selling.revenue"),
                    render: (value) => formatCurrency(value),
                  },
                ]}
                rows={deliveryPerformance}
                emptyText={autoT("legacy.no_delivery_performance_data_found_07607942")}
              />
            </SectionCard>

            <SectionCard
              title={autoT("legacy.cashier_performance_71046d34")}
              subtitle={autoT("legacy.reservations_paid_orders_and_total_cash_handled_97ef9b2c")}
            >
              <DataTable
                columns={[
                  { key: "staff_id", label: autoT("legacy.staff_id_e46c7ef1") },
                  { key: "staff_name", label: autoT("staff_name") },

                  {
                    key: "reservations_created",
                    label: autoT("landing.features.groups.operations.items.reservations"),
                  },
                  // {
                  //   key: "reservation_total_paid",
                  //   label: "Reservation Paid",
                  //   render: (value) => formatCurrency(value),
                  // },

                  {
                    key: "orders_paid",
                    label: autoT("legacy.orders_paid_0456b225"),
                  },

                  {
                    key: "total_cash_handled",
                    label: autoT("legacy.total_cash_handled_d8bd9412"),
                    render: (value) => formatCurrency(value),
                  },
                ]}
                rows={cashierPerformance}
                emptyText={autoT("legacy.no_cashier_performance_data_found_9ee8303c")}
              />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            <SectionCard
              title={autoT("legacy.salary_history_f6ce559d")}
              subtitle={autoT("legacy.current_salary_profile_configured_for_each_employee_6f4cecb0")}
            >
              <DataTable
                columns={[
                  { key: "staff_name", label: autoT("nav.staff") },
                  { key: "role", label: autoT("attendance.table.role") },
                  { key: "salary_type", label: autoT("inventory_manager.common.type") },
                  {
                    key: "base_salary",
                    label: autoT("legacy.base_077fe9c5"),
                    render: (value) => formatCurrency(value),
                  },
                  { key: "payment_day", label: autoT("legacy.pay_day_25cdefe2") },
                  {
                    key: "allowances",
                    label: autoT("legacy.allowances_60a83b2a"),
                    render: (value) => formatCurrency(value),
                  },
                  {
                    key: "deductions",
                    label: autoT("legacy.deductions_757bbae2"),
                    render: (value) => formatCurrency(value),
                  },
                  {
                    key: "payroll_active",
                    label: autoT("staff.status.active"),
                    render: (value) => (value ? "Yes" : "No"),
                  },
                ]}
                rows={salaryHistory}
                emptyText={autoT("legacy.no_salary_profiles_found_386a0f86")}
              />
            </SectionCard>

            <SectionCard
              title={autoT("legacy.payroll_summary_abe5cf54")}
              subtitle={autoT("legacy.earnings_deductions_advances_paid_amounts_and_balances_f9ccdbdf")}
            >
              <DataTable
                columns={[
                  { key: "staff_name", label: autoT("nav.staff") },
                  { key: "role", label: autoT("attendance.table.role") },
                  { key: "payroll_count", label: autoT("legacy.payrolls_36b4dbb8") },
                  {
                    key: "total_gross",
                    label: autoT("legacy.gross_9580a617"),
                    render: (value) => formatCurrency(value),
                  },
                  {
                    key: "total_deductions",
                    label: autoT("legacy.deductions_757bbae2"),
                    render: (value) => formatCurrency(value),
                  },
                  {
                    key: "total_advances",
                    label: autoT("legacy.advances_232e6c98"),
                    render: (value) => formatCurrency(value),
                  },
                  {
                    key: "total_net",
                    label: autoT("legacy.net_9bb81c2e"),
                    render: (value) => formatCurrency(value),
                  },
                  {
                    key: "outstanding",
                    label: autoT("legacy.balance_90eef613"),
                    render: (value) => formatCurrency(value),
                  },
                ]}
                rows={payrollSummary}
                emptyText={autoT("legacy.no_payroll_summary_found_0f9695e0")}
              />
            </SectionCard>
          </div>

          <SectionCard
            title={autoT("legacy.payroll_history_b278e655")}
            subtitle={autoT("legacy.generated_payroll_records_by_employee_and_period_5621df2d")}
          >
            <DataTable
              columns={[
                { key: "staff_name", label: autoT("nav.staff") },
                { key: "period_type", label: autoT("inventory_manager.common.type") },
                { key: "period_start", label: autoT("legacy.start_952f3754") },
                { key: "period_end", label: autoT("legacy.end_a2bb9d34") },
                {
                  key: "status",
                  label: autoT("table.status"),
                  render: (value) => <StatusBadge status={value} />,
                },
                {
                  key: "gross_salary",
                  label: autoT("legacy.gross_9580a617"),
                  render: (value) => formatCurrency(value),
                },
                {
                  key: "net_salary",
                  label: autoT("legacy.net_9bb81c2e"),
                  render: (value) => formatCurrency(value),
                },
                {
                  key: "remaining_balance",
                  label: autoT("legacy.balance_90eef613"),
                  render: (value) => formatCurrency(value),
                },
              ]}
              rows={payrollHistory}
              emptyText={autoT("legacy.no_payroll_history_found_05194e5e")}
            />
          </SectionCard>

          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            <SectionCard
              title={autoT("legacy.payment_history_cfeba031")}
              subtitle={autoT("legacy.salary_payment_trail_and_references_3c4f960c")}
            >
              <DataTable
                columns={[
                  { key: "date", label: autoT("table.date") },
                  { key: "staff_name", label: autoT("nav.staff") },
                  { key: "period", label: autoT("legacy.period_170a28a9") },
                  { key: "payment_method", label: autoT("legacy.method_88306943") },
                  { key: "reference_number", label: autoT("legacy.reference_db1c7845") },
                  {
                    key: "amount",
                    label: autoT("legacy.amount_43dc8532"),
                    render: (value) => formatCurrency(value),
                  },
                ]}
                rows={payrollPaymentHistory}
                emptyText={autoT("legacy.no_payroll_payments_found_7102ebdc")}
              />
            </SectionCard>

            <SectionCard
              title={autoT("legacy.advance_history_66715fe3")}
              subtitle={autoT("legacy.salary_advances_and_payroll_application_status_b20b3b23")}
            >
              <DataTable
                columns={[
                  { key: "date", label: autoT("table.date") },
                  { key: "staff_name", label: autoT("nav.staff") },
                  { key: "reason", label: autoT("legacy.reason_f219cc06") },
                  {
                    key: "is_applied",
                    label: autoT("table.status"),
                    render: (value) => (
                      <StatusBadge status={value ? "applied" : "open"} />
                    ),
                  },
                  {
                    key: "amount",
                    label: autoT("legacy.amount_43dc8532"),
                    render: (value) => formatCurrency(value),
                  },
                ]}
                rows={advanceHistory}
                emptyText={autoT("legacy.no_salary_advances_found_f5d5d0eb")}
              />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            <SectionCard
              title={autoT("legacy.employee_earnings_141e24ce")}
              subtitle={autoT("legacy.approved_payroll_earnings_payments_and_outstanding_bal_acda231c")}
            >
              <DataTable
                columns={[
                  { key: "staff_name", label: autoT("nav.staff") },
                  { key: "role", label: autoT("attendance.table.role") },
                  {
                    key: "earnings",
                    label: autoT("legacy.earnings_ad772fd4"),
                    render: (value) => formatCurrency(value),
                  },
                  {
                    key: "paid",
                    label: autoT("legacy.paid_dc9d4584"),
                    render: (value) => formatCurrency(value),
                  },
                  {
                    key: "outstanding",
                    label: autoT("legacy.outstanding_f8ee57ec"),
                    render: (value) => formatCurrency(value),
                  },
                ]}
                rows={employeeEarnings}
                emptyText={autoT("legacy.no_employee_earnings_found_355d8c86")}
              />
            </SectionCard>

            <SectionCard
              title={autoT("legacy.employee_deductions_6e43b78d")}
              subtitle={autoT("legacy.deductions_and_salary_advances_by_employee_c6f05703")}
            >
              <DataTable
                columns={[
                  { key: "staff_name", label: autoT("nav.staff") },
                  { key: "role", label: autoT("attendance.table.role") },
                  {
                    key: "deductions",
                    label: autoT("legacy.deductions_757bbae2"),
                    render: (value) => formatCurrency(value),
                  },
                  {
                    key: "salary_advances",
                    label: autoT("legacy.advances_232e6c98"),
                    render: (value) => formatCurrency(value),
                  },
                ]}
                rows={employeeDeductions}
                emptyText={autoT("legacy.no_employee_deductions_found_18852c51")}
              />
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
