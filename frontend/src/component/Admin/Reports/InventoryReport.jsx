import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import {
  Package,
  AlertTriangle,
  Activity,
  List,
  ShoppingCart,
  TrendingDown,
  Settings2,
  CheckCircle,
  Download,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// Color palette for the movement types
const MOVEMENT_COLORS = {
  order: "#6366f1", // Indigo (Consumption)
  purchase: "#22c55e", // Green (Restock)
  waste: "#ef4444", // Red (Loss)
  adjustment: "#f59e0b", // Amber (Correction)
};

export default function InventoryReport({ startDate, endDate }) {
  const [inventoryData, setInventoryData] = useState(null);
  const [movementsData, setMovementsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getInvertoryReport = async () => {
    try {
      const res = await instance.get(
        `/reports/generate_report/?type=inventory&start=${startDate}&end=${endDate}`,
      );
      setInventoryData(res.data.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const res = await instance.get(
        `/reports/inventory-pdf/?start=${startDate}&end=${endDate}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "inventory_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };
  const getStockMovementsReport = async () => {
    try {
      const res = await instance.get(
        `/reports/generate_report/?type=stock_movements&start=${startDate}&end=${endDate}`,
      );
      setMovementsData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      setLoading(true);
      // Fetch both reports in parallel
      Promise.all([getInvertoryReport(), getStockMovementsReport()]).finally(
        () => setLoading(false),
      );
    }
  }, [startDate, endDate]);

  if (loading || !inventoryData || !movementsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { total_items, low_stock_items, low_stock_list } = inventoryData;
  const { total_movements, by_type } = movementsData;

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory Report</h2>
          <p className="text-sm text-gray-500">
            Stock status and movement analysis
          </p>
        </div>

        <button
          onClick={handleGeneratePDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          Generate PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Inventory Items"
          value={total_items}
          icon={<Package className="w-6 h-6 text-indigo-600" />}
          bgColor="bg-indigo-50"
          textColor="text-indigo-600"
        />
        <StatCard
          title="Low Stock Alerts"
          value={low_stock_items}
          icon={<AlertTriangle className="w-6 h-6 text-amber-600" />}
          bgColor="bg-amber-50"
          textColor="text-amber-600"
          isAlert={low_stock_items > 0}
        />
        <StatCard
          title="Total Movements"
          value={total_movements}
          icon={<Activity className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
          subtitle="Transactions this period"
        />
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Stock Movements Chart (Left Side - 3 cols) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Movement Breakdown
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={by_type}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="movement_type"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {by_type.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={MOVEMENT_COLORS[entry.movement_type] || "#d1d5db"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name.replace("_", " ").charAt(0).toUpperCase() +
                      name.replace("_", " ").slice(1),
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value.charAt(0).toUpperCase() + value.slice(1)
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Movement Type Legend List */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
            {by_type.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <MovementIcon type={item.movement_type} />
                  <span className="text-sm text-gray-600 capitalize">
                    {item.movement_type}
                  </span>
                </div>
                <span className="font-bold text-gray-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock List (Right Side - 2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800">
              Low Stock Items
            </h3>
          </div>

          {low_stock_items > 0 ? (
            <ul className="divide-y divide-gray-100">
              {low_stock_list.map((item, idx) => (
                <li
                  key={idx}
                  className="py-3 flex justify-between items-center text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Current: {item.current_stock}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                    Low
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-green-50 rounded-full mb-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-medium text-gray-700">All Stock Levels Good</p>
              <p className="text-sm text-gray-400 mt-1">
                No items are currently below the threshold.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub Components ---

function StatCard({
  title,
  value,
  icon,
  bgColor,
  textColor,
  subtitle,
  isAlert,
}) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div
        className={`p-3 rounded-lg ${bgColor} ${isAlert ? "animate-pulse" : ""}`}
      >
        {icon}
      </div>
    </div>
  );
}

function MovementIcon({ type }) {
  const props = { className: "w-4 h-4" };
  switch (type) {
    case "purchase":
      return (
        <ShoppingCart {...props} style={{ color: MOVEMENT_COLORS.purchase }} />
      );
    case "order":
      return (
        <TrendingDown {...props} style={{ color: MOVEMENT_COLORS.order }} />
      );
    case "waste":
      return (
        <AlertTriangle {...props} style={{ color: MOVEMENT_COLORS.waste }} />
      );
    case "adjustment":
      return (
        <Settings2 {...props} style={{ color: MOVEMENT_COLORS.adjustment }} />
      );
    default:
      return <Package {...props} />;
  }
}
