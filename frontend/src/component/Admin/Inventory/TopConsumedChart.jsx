import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "var(--theme-chart-1)",
  "var(--theme-chart-2)",
  "var(--theme-chart-3)",
  "var(--theme-chart-4)",
  "var(--theme-chart-5)",
  "var(--theme-chart-6)",
];

const renderLabel = ({ name, percent }) => {
  return `${name}\n${(percent * 100).toFixed(1)}%`;
};

export default function TopConsumedChart({ items }) {
  const { t } = useTranslation();

  if (!items || items.length === 0) {
    return (
      <div className="theme-card p-4 sm:p-5">
        <p className="text-sm theme-text-muted">
          {t("inventory_manager.dashboard.no_consumption_data", {
            defaultValue: "No consumption data available",
          })}
        </p>
      </div>
    );
  }
  const normalizeValue = (value, unit) => {
    const qty = Math.abs(Number(value));

    if (unit === "kg") return qty * 1000;
    if (unit === "g") return qty;
    if (unit === "l") return qty * 1000;
    if (unit === "ml") return qty;

    return qty;
  };
  const data = items.map((item) => {
    const unit = item.ingredient__unit;

    const value = normalizeValue(item.consumed, unit);

    return {
      name: item.ingredient__name,
      value,
      unit: unit === "kg" ? "g" : unit === "l" ? "ml" : unit,
    };
  });

  return (
    <div className="theme-card p-4 sm:p-5">
      <h3 className="mb-4 font-semibold theme-text-primary">
        {t("inventory_manager.dashboard.top_consumed", {
          defaultValue: "Top Consumed Ingredients (30 days)",
        })}
      </h3>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius="72%"
              label={renderLabel}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name, props) => {
                const unit = props.payload.unit;
                return [`${value} ${unit}`, name];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
