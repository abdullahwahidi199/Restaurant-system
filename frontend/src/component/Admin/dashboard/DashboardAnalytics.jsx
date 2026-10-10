import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../../ui/card";

const formatAmount = (value) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  );

const formatDay = (value) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const tooltipStyle = {
  background: "var(--theme-elevated)",
  border: "1px solid var(--theme-border)",
  borderRadius: "8px",
  color: "var(--theme-text-primary)",
  fontSize: "12px",
};

function ChartEmpty({ children }) {
  return (
    <div className="grid h-[180px] place-items-center rounded-lg bg-[var(--theme-muted)] text-xs theme-text-muted">
      {children}
    </div>
  );
}

export default function DashboardAnalytics({ summary }) {
  const { t } = useTranslation();
  const daily = (summary?.daily_sales || []).slice(-14);
  const branches = summary?.branch_performance || [];

  const deliveryData = [
    {
      name: t("dashboard.today", { defaultValue: "Today" }),
      value: Number(summary?.deliveries_today_count || 0),
    },
    {
      name: t("dashboard.this_week", { defaultValue: "This week" }),
      value: Number(summary?.deliveries_this_week_count || 0),
    },
    {
      name: t("dashboard.this_month", { defaultValue: "This month" }),
      value: Number(summary?.deliveries_this_month_count || 0),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <Card>
        <CardContent className="p-3.5">
          <div className="mb-3">
            <h3 className="text-sm font-semibold theme-text-primary">
              {t("dashboard.order_flow", { defaultValue: "Order volume" })}
            </h3>
            <p className="mt-0.5 text-[11px] theme-text-muted">
              {t("dashboard.order_flow_description", {
                defaultValue: "Completed orders across the latest sales days",
              })}
            </p>
          </div>
          {daily.length ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={daily} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--theme-border)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDay}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--theme-text-muted)", fontSize: 9 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--theme-text-muted)", fontSize: 10 }}
                />
                <Tooltip
                  formatter={(value) => [formatAmount(value), t("dashboard.charts.orders")]}
                  labelFormatter={(value) => new Date(`${value}T00:00:00`).toLocaleDateString()}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="orders" fill="var(--theme-chart-2)" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty>{t("dashboard.no_order_data", { defaultValue: "No order data yet" })}</ChartEmpty>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3.5">
          <div className="mb-3">
            <h3 className="text-sm font-semibold theme-text-primary">
              {branches.length > 1
                ? t("dashboard.branch_performance", { defaultValue: "Branch performance" })
                : t("dashboard.delivery_activity", { defaultValue: "Delivery activity" })}
            </h3>
            <p className="mt-0.5 text-[11px] theme-text-muted">
              {branches.length > 1
                ? t("dashboard.branch_performance_description", {
                    defaultValue: "Revenue comparison across your branches",
                  })
                : t("dashboard.delivery_activity_description", {
                    defaultValue: "Delivery order volume by period",
                  })}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={branches.length > 1 ? branches : deliveryData}
              layout={branches.length > 1 ? "vertical" : "horizontal"}
              margin={branches.length > 1
                ? { top: 4, right: 10, left: 8, bottom: 0 }
                : { top: 4, right: 4, left: -24, bottom: 0 }}
            >
              <CartesianGrid
                horizontal={branches.length <= 1}
                vertical={branches.length > 1}
                stroke="var(--theme-border)"
                strokeDasharray="3 3"
              />
              {branches.length > 1 ? (
                <>
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--theme-text-muted)", fontSize: 9 }}
                    tickFormatter={formatAmount}
                  />
                  <YAxis
                    type="category"
                    dataKey="branch_name"
                    width={72}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--theme-text-muted)", fontSize: 10 }}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--theme-text-muted)", fontSize: 10 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--theme-text-muted)", fontSize: 10 }}
                  />
                </>
              )}
              <Tooltip
                formatter={(value) => [
                  branches.length > 1 ? `${formatAmount(value)} AFN` : formatAmount(value),
                  branches.length > 1
                    ? t("dashboard.charts.revenue")
                    : t("dashboard.deliveries", { defaultValue: "Deliveries" }),
                ]}
                contentStyle={tooltipStyle}
              />
              <Bar
                dataKey={branches.length > 1 ? "revenue" : "value"}
                fill="var(--theme-chart-3)"
                radius={branches.length > 1 ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
