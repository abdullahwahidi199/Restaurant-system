import React, { useEffect, useState } from "react";
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
import instance from "../../../api/axiosInstance";
import { useTranslation as useAutoTranslation } from "react-i18next";
import ErpStatusBadge from "../../../modules/shared/erp/components/StatusBadge";
import ReportHeader from "./ReportHeader";

export default function OrdersReport({ startDate, endDate }) {
                 const { t: autoT } = useAutoTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemSearch, setItemSearch] = useState("");
  const [itemResult, setItemResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchOrdersReport = async () => {
    try {
      setLoading(true);
      const res = await instance.get(
        `/reports/generate_report/?type=orders&start=${startDate}&end=${endDate}`,
      );
      setData(res.data.data);
      console.log("Fetched Orders Report:", res.data.data);
    } catch (err) {
      console.error(err);
      setError(autoT("legacy.failed_to_fetch_report_data_7b534284"));
    } finally {
      setLoading(false);
    }
  };

  const handleItemSearch = async () => {
    if (!itemSearch) return;

    try {
      setSearchLoading(true);

      const res = await instance.get(
        `/menu/menu-item-sales/?name=${itemSearch}&start=${startDate}&end=${endDate}`,
      );

      setItemResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const res = await instance.get(
        `/reports/orders-pdf/?start=${startDate}&end=${endDate}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "orders_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchOrdersReport();
    }
  }, [startDate, endDate]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AFN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Helper: Number Formatter
  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  if (loading) {
    return (
      <>
        <ReportHeader
          onExport={handleGeneratePDF}
          exportLabel={autoT("inventory_manager.reports.generate_pdf")}
          disabled
        />
        <div className="theme-card flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--theme-border)] border-t-[var(--theme-primary)]" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ReportHeader
          onExport={handleGeneratePDF}
          exportLabel={autoT("inventory_manager.reports.generate_pdf")}
          disabled
        />
        <div className="rounded-lg border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] p-4 text-sm text-[var(--theme-danger-hover)]">
          {error}
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <ReportHeader
        onExport={handleGeneratePDF}
        exportLabel={autoT("inventory_manager.reports.generate_pdf")}
        disabled
      />
    );
  }

  return (
    <div className="min-w-0 space-y-4">
        <ReportHeader
          onExport={handleGeneratePDF}
          exportLabel={autoT("inventory_manager.reports.generate_pdf")}
        />

        {/* Menu Item Search */}
        <div className="theme-card p-3.5">
          <h3 className="mb-3 text-sm font-semibold theme-text-primary">
            {autoT("legacy.menu_item_sales_lookup_2299fa52")}
          </h3>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              placeholder={autoT("legacy.enter_menu_item_name_b5b27bc8")}
              className="theme-input h-9 min-w-0 flex-1 px-3 text-sm"
            />

            <button
              onClick={handleItemSearch}
              className="theme-btn theme-btn-outline h-9 px-4"
            >
              {autoT("legacy.search_bce06414")}
            </button>
          </div>

          {searchLoading && (
            <p className="mt-2 text-xs theme-text-muted">{autoT("legacy.searching_ba2b5a5f")}</p>
          )}

          {itemResult && itemResult.length > 0 && (
            <div className="mt-4 divide-y divide-[var(--theme-border)] border-t border-[var(--theme-border)] pt-2">
              {itemResult.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium theme-text-primary">
                      {item.menu_item__name || item.platter__name}
                    </p>
                  </div>

                  <div className="text-end">
                    <p className="text-sm font-semibold theme-text-primary">
                      {item.total_sold} {autoT("legacy.sold_147f6d85")}
                    </p>
                    <p className="text-xs theme-text-muted">
                      {formatCurrency(item.total_revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {itemResult && itemResult.length === 0 && (
            <p className="mt-2 text-xs theme-text-muted">{autoT("legacy.no_results_found_658e79f9")}</p>
          )}
        </div>
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title={autoT("overview.totalRevenue")}
            value={formatCurrency(data.totals.total_revenue)}
            icon={<DollarSign size={20} />}
            subtext={`Lost: ${formatCurrency(data.totals.lost_revenue)}`}
          />
          <MetricCard
            title={autoT("stats.total_orders")}
            value={data.totals.total_orders}
            icon={<ShoppingBag size={20} />}
            subtext={`Avg Value: ${formatCurrency(data.totals.average_order_value)}`}
          />
          <MetricCard
            title={autoT("stats.completed")}
            value={data.totals.completed_orders}
            icon={<CheckCircle size={20} />}
          />
          <MetricCard
            title={autoT("status.cancelled")}
            value={data.totals.cancelled_orders}
            icon={<XCircle size={20} />}
            subtext={autoT("nav.orders")}
          />
        </div>

        {/* NEW: Revenue Breakdown Cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MetricCard
            title={autoT("legacy.food_revenue_fb1c5455")}
            value={formatCurrency(data.totals.food_revenue)}
            icon={<Utensils size={20} />}
          />
          <MetricCard
            title={autoT("legacy.delivery_revenue_39546555")}
            value={formatCurrency(data.totals.delivery_revenue)}
            icon={<Truck size={20} />}
          />
          <MetricCard
            title={autoT("legacy.reservation_revenue_96c94fb3")}
            value={formatCurrency(data.totals.reservation_revenue)}
            icon={<Users size={20} />}
          />
        </div>

        {/* Middle Section: Order Types & Status */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* By Order Type */}
          <div className="theme-card p-3.5">
            <h3 className="mb-4 text-sm font-semibold theme-text-primary">
              {autoT("legacy.by_order_type_6fd39576")}
            </h3>
            <div className="space-y-4">
              {data.by_type.map((type, index) => (
                <div key={index}>
                  <div className="mb-1 flex justify-between gap-3 text-sm">
                    <span className="capitalize font-medium theme-text-primary">
                      {type.order_type}
                    </span>
                    <span className="theme-text-muted">{type.count} {autoT("legacy.orders_96584038")}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--theme-muted)]">
                    <div
                      className="h-2 rounded-full bg-[var(--theme-primary)]"
                      style={{
                        width: `${(type.count / data.totals.total_orders) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 text-end text-xs theme-text-muted">
                    {formatCurrency(type.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Status */}
          <div className="theme-card p-3.5">
            <h3 className="mb-4 text-sm font-semibold theme-text-primary">
              {autoT("legacy.order_status_a15b0b10")}
            </h3>
            <div className="space-y-3">
              {data.by_status.map((status, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg p-2 transition hover:bg-[var(--theme-hover)]"
                >
                  <span className="text-sm capitalize theme-text-secondary">
                    {status.status.replace("_", " ")}
                  </span>
                  <StatusBadge count={status.count} status={status.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Top Items */}
          <div className="theme-card p-3.5">
            <h3 className="mb-4 text-sm font-semibold theme-text-primary">
              {autoT("menu_item_sales.top_selling_items")}
            </h3>
            <div className="space-y-4">
              {data.top_items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--theme-primary-soft)] text-xs font-semibold text-[var(--theme-primary)]">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium theme-text-primary">
                        {item.name}
                      </p>
                      <p className="text-xs theme-text-muted">
                        {item.quantity_sold} {autoT("legacy.sold_147f6d85")}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold theme-text-primary">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Performance & Daily Breakdown */}
        <div className="grid grid-cols-1 gap-4">
          {/* Daily Breakdown */}
          <div className="theme-table overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[var(--theme-border)] p-4">
              <Activity size={18} className="text-[var(--theme-primary)]" />
              <h3 className="text-sm font-semibold theme-text-primary">
                {autoT("legacy.daily_breakdown_b37690b6")}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-start text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-start">{autoT("table.date")}</th>
                    <th className="px-4 py-3">{autoT("nav.orders")}</th>
                    <th className="px-4 py-3 text-end">
                      {autoT("dashboard.best_selling.revenue")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.daily_breakdown.map((day, index) => (
                    <tr key={index} className="border-t border-[var(--theme-border)] transition hover:bg-[var(--theme-hover)]">
                      <td className="px-4 py-3 font-medium theme-text-primary">
                        {day.date}
                      </td>
                      <td className="px-4 py-3 theme-text-secondary">{day.orders}</td>
                      <td className="px-4 py-3 text-end font-semibold text-[var(--theme-primary)]">
                        {formatCurrency(day.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Average Prep Time (Footer Note) */}
        <div className="flex items-center justify-center gap-2 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-muted)] px-3 py-2 text-xs theme-text-muted">
          <Clock className="h-4 w-4 text-[var(--theme-primary)]" aria-hidden="true" />
          <span>
            {autoT("legacy.average_preparation_time_2daaeca2")}{" "}
            <strong className="font-semibold theme-text-primary">
              {formatNumber(data.totals.average_preparation_minutes)} {autoT("legacy.minutes_be2e2bb6")}
            </strong>
          </span>
        </div>
    </div>
  );
}

function MetricCard({ title, value, icon, subtext }) {
  return (
    <article className="theme-kpi-card flex min-w-0 items-start justify-between gap-3 p-3.5">
      <div className="min-w-0">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide theme-text-muted">{title}</p>
        <p className="truncate text-xl font-semibold tabular-nums theme-text-primary" title={String(value)}>{value}</p>
        {subtext && <p className="mt-1 truncate text-xs theme-text-muted">{subtext}</p>}
      </div>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">{icon}</div>
    </article>
  );
}

function StatusBadge({ count, status }) {
  return <ErpStatusBadge status={status} count={count} showIcon={false} />;
}
