import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { useTranslation } from "react-i18next";
export default function DailySalesChart({ summary }) {
  const { t } = useTranslation();
  return (
    <div className="lg:col-span-2">
      <h3 className="mb-4 text-lg font-semibold theme-text-secondary">
        {t("dashboard.charts.daily_sales")}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={summary.daily_sales}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--theme-chart-1)"
            strokeWidth={2}
            name={t("dashboard.charts.revenue")}
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="var(--theme-chart-2)"
            strokeWidth={2}
            name={t("dashboard.charts.orders")}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
