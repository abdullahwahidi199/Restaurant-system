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
  Download,
} from "lucide-react";
import instance from "../../../api/axiosInstance";

export default function OrdersReport({ startDate, endDate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError("Failed to fetch report data.");
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-gray-50 min-h-screen p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Orders Report</h1>
            <p className="text-gray-500 text-sm mt-1">
              Showing data from{" "}
              <span className="font-medium">{data.range.start}</span> to{" "}
              <span className="font-medium">{data.range.end}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <div className="px-3 py-2 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              Total Orders: {data.totals.total_orders}
            </div>

            {/* ✅ PDF Button */}
            <button
              onClick={handleGeneratePDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow"
            >
              <Download size={16} />
              Generate PDF
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(data.totals.total_revenue)}
            icon={<DollarSign className="text-green-600" size={20} />}
            subtext={`Lost: ${formatCurrency(data.totals.lost_revenue)}`}
            color="bg-green-50"
          />
          <MetricCard
            title="Total Orders"
            value={data.totals.total_orders}
            icon={<ShoppingBag className="text-blue-600" size={20} />}
            subtext={`Avg Value: ${formatCurrency(data.totals.average_order_value)}`}
            color="bg-blue-50"
          />
          <MetricCard
            title="Completed"
            value={data.totals.completed_orders}
            icon={<CheckCircle className="text-emerald-600" size={20} />}
            color="bg-emerald-50"
          />
          <MetricCard
            title="Cancelled"
            value={data.totals.cancelled_orders}
            icon={<XCircle className="text-red-600" size={20} />}
            subtext="Orders"
            color="bg-red-50"
          />
        </div>

        {/* NEW: Revenue Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Food Revenue"
            value={formatCurrency(data.totals.food_revenue)}
            icon={<Utensils className="text-orange-600" size={20} />}
            color="bg-orange-50"
          />
          <MetricCard
            title="Delivery Revenue"
            value={formatCurrency(data.totals.delivery_revenue)}
            icon={<Truck className="text-blue-600" size={20} />}
            color="bg-blue-50"
          />
          <MetricCard
            title="Reservation Revenue"
            value={formatCurrency(data.totals.reservation_revenue)}
            icon={<Users className="text-purple-600" size={20} />}
            color="bg-purple-50"
          />
        </div>

        {/* Middle Section: Order Types & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* By Order Type */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              By Order Type
            </h3>
            <div className="space-y-4">
              {data.by_type.map((type, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium text-gray-700">
                      {type.order_type}
                    </span>
                    <span className="text-gray-500">{type.count} orders</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${(type.count / data.totals.total_orders) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formatCurrency(type.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Order Status
            </h3>
            <div className="space-y-3">
              {data.by_status.map((status, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                >
                  <span className="capitalize text-sm text-gray-700">
                    {status.status.replace("_", " ")}
                  </span>
                  <StatusBadge count={status.count} status={status.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Top Selling Items
            </h3>
            <div className="space-y-4">
              {data.top_items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity_sold} sold
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Performance & Daily Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Staff Performance */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} className="text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800">
                Staff Performance
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Waiter Table */}
              {data.waiter_performance.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Waiter
                  </h4>
                  {data.waiter_performance.map((w, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">
                        {w.waiter_name}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-800">
                          {w.orders_handled} Orders
                        </div>
                        <div className="text-xs text-green-600">
                          {formatCurrency(w.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Delivery Table */}
              {data.delivery_performance.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Delivery
                  </h4>
                  {data.delivery_performance.map((d, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">
                        {d.delivery_boy_name}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-800">
                          {d.deliveries} Deliveries
                        </div>
                        <div className="text-xs text-green-600">
                          {formatCurrency(d.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={20} className="text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800">
                Daily Breakdown
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Date</th>
                    <th className="px-4 py-3">Orders</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.daily_breakdown.map((day, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {day.date}
                      </td>
                      <td className="px-4 py-3">{day.orders}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-600">
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
        <div className="text-center text-xs text-gray-400 mt-8">
          Average Preparation Time:{" "}
          {formatNumber(data.totals.average_preparation_minutes)} minutes
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, subtext, color }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
  );
}

function StatusBadge({ count, status }) {
  const getColors = (s) => {
    switch (s) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getColors(status)}`}
    >
      {count}
    </span>
  );
}
