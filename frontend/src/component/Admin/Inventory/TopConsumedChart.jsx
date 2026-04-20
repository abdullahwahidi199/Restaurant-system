import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#7C3AED",
  "#B45309",
  "#DC2626",
  "#2563EB",
  "#F59E0B",
  "#16A34A",
];

const renderLabel = ({ name, percent }) => {
  return `${name}\n${(percent * 100).toFixed(1)}%`;
};

export default function TopConsumedChart({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <p className="text-sm text-gray-500">No consumption data available</p>
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
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">
        Top Consumed Ingredients (30 days)
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
              outerRadius={120}
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
