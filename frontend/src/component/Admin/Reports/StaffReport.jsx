import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Download,
} from "lucide-react";
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
      /(amount|salary|paid|cost|revenue|price|wage|bonus|deduction|total|payroll)/i.test(
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

const getStatusClasses = (status = "") => {
  switch (status.toLowerCase()) {
    case "present":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "absent":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    case "late":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "leave":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClasses(
        status,
      )}`}
    >
      {status || "-"}
    </span>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value, helper, dotClass = "bg-blue-500" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
      </div>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      {helper && <p className="mt-2 text-sm text-slate-500">{helper}</p>}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
        <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      </div>

      <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
    </div>
  );
}

function DataTable({ columns, rows, emptyText = "No data available." }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key || column.label}
                  className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-600"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {rows?.length ? (
              rows.map((row, rowIndex) => (
                <tr
                  key={`${row.staff_id ?? row.id ?? row.date ?? rowIndex}-${rowIndex}`}
                  className="hover:bg-slate-50"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key || column.label}
                      className="whitespace-nowrap px-4 py-3 text-slate-700"
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
                  className="px-4 py-8 text-center text-slate-500"
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
      setError("Failed to fetch report data.");
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
  const range = report.range || {};
  const totals = report.totals || {};
  const byRole = report.by_role || [];
  const attendanceSummary = report.attendance_summary || [];
  const dailyAttendance = report.daily_attendance || [];
  const waiterPerformance = report.waiter_performance || [];
  const deliveryPerformance = report.delivery_performance || [];
  const cashierPerformance = report.cashier_performance || [];
  const payrollSummary = report.payroll_summary || [];
  const topPerformers = report.top_performers || [];

  const payrollColumns = useMemo(() => {
    if (!payrollSummary.length) return [];

    return Object.keys(payrollSummary[0]).map((key) => ({
      key,
      label: formatLabel(key),
      render: (value) => formatValue(key, value),
    }));
  }, [payrollSummary]);

  const hasReport = !!reportData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              {formatLabel(reportData?.type || "staff")} Report
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Staff Performance & Attendance Overview
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Requested:{" "}
                {reportData?.start && reportData?.end
                  ? `${formatDate(reportData.start)} - ${formatDate(reportData.end)}`
                  : "No date selected"}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1">
                Range:{" "}
                {range?.start && range?.end
                  ? `${formatDate(range.start)} - ${formatDate(range.end)}`
                  : "N/A"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGeneratePDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow"
            >
              <Download size={16} />
              Generate PDF
            </button>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !hasReport ? (
        <LoadingSkeleton />
      ) : !hasReport ? (
        <SectionCard
          title="No Report Data"
          subtitle="Select a valid date range to load the staff report."
        >
          <EmptyState message="No staff report available yet." />
        </SectionCard>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Staff"
              value={totals.total_staff ?? 0}
              helper="All registered staff members"
              dotClass="bg-blue-500"
            />
            <StatCard
              label="Active Staff"
              value={totals.active_staff ?? 0}
              helper="Currently active employees"
              dotClass="bg-emerald-500"
            />
            <StatCard
              label="Inactive Staff"
              value={totals.inactive_staff ?? 0}
              helper="Currently inactive employees"
              dotClass="bg-rose-500"
            />

            <StatCard
              label="Attendance Rate"
              value={formatPercent(totals.attendance_rate_percent ?? 0)}
              helper="Overall attendance percentage"
              dotClass="bg-amber-500"
            />
            <StatCard
              label="Present Days"
              value={totals.present_days ?? 0}
              helper="Total present attendance entries"
              dotClass="bg-emerald-500"
            />
            <StatCard
              label="Attendance Records"
              value={totals.total_attendance_records ?? 0}
              helper="All attendance records in period"
              dotClass="bg-cyan-500"
            />
          </div>

          {/* Role + Attendance Breakdown */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <SectionCard
              title="Staff by Role"
              subtitle="Distribution of employees across roles"
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
                            <p className="font-medium text-slate-800">
                              {formatLabel(item.role)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatPercent(percentage)} of total staff
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                            {item.count}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState message="No role breakdown available." />
              )}
            </SectionCard>

            <SectionCard
              title="Attendance Summary"
              subtitle="Attendance status distribution for the selected period"
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
                            <span className="text-sm text-slate-600">
                              {formatPercent(percentage)}
                            </span>
                          </div>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                            {item.count}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState message="No attendance summary found." />
              )}
            </SectionCard>
          </div>

          {/* Daily Attendance */}
          <SectionCard
            title="Daily Attendance"
            subtitle="Daily attendance records by date and status"
          >
            <DataTable
              columns={[
                {
                  key: "date",
                  label: "Date",
                  render: (value) => formatDate(value),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (value) => <StatusBadge status={value} />,
                },
                {
                  key: "count",
                  label: "Count",
                },
              ]}
              rows={dailyAttendance}
              emptyText="No daily attendance records found."
            />
          </SectionCard>

          {/* Performance Tables */}
          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
            <SectionCard
              title="Waiter Performance"
              subtitle="Orders handled, completed orders, and revenue"
            >
              <DataTable
                columns={[
                  { key: "staff_id", label: "Staff ID" },
                  { key: "staff_name", label: "Staff Name" },
                  { key: "orders_handled", label: "Orders Handled" },
                  { key: "completed_orders", label: "Completed Orders" },
                  {
                    key: "revenue",
                    label: "Revenue",
                    render: (value) => formatCurrency(value),
                  },
                ]}
                rows={waiterPerformance}
                emptyText="No waiter performance data found."
              />
            </SectionCard>

            <SectionCard
              title="Delivery Performance"
              subtitle="Deliveries handled, delivered orders, and revenue"
            >
              <DataTable
                columns={[
                  { key: "staff_id", label: "Staff ID" },
                  { key: "staff_name", label: "Staff Name" },
                  { key: "deliveries_handled", label: "Deliveries Handled" },
                  { key: "delivered", label: "Delivered" },
                  {
                    key: "revenue",
                    label: "Revenue",
                    render: (value) => formatCurrency(value),
                  },
                ]}
                rows={deliveryPerformance}
                emptyText="No delivery performance data found."
              />
            </SectionCard>

            <SectionCard
              title="Cashier Performance"
              subtitle="Reservations, billed amount, and payments"
            >
              <DataTable
                columns={[
                  { key: "staff_id", label: "Staff ID" },
                  { key: "staff_name", label: "Staff Name" },
                  {
                    key: "reservations_created",
                    label: "Reservations Created",
                  },
                  {
                    key: "total_amount",
                    label: "Total Amount",
                    render: (value) => formatCurrency(value),
                  },
                  {
                    key: "total_paid",
                    label: "Total Paid",
                    render: (value) => formatCurrency(value),
                  },
                ]}
                rows={cashierPerformance}
                emptyText="No cashier performance data found."
              />
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
