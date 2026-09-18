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
import { useTranslation as useAutoTranslation } from "react-i18next";
import ErpStatusBadge from "../../../modules/shared/erp/components/StatusBadge";

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
            <h1 className="text-2xl font-bold text-gray-800">{autoT("menu_item_sales.orders_report")}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {autoT("legacy.showing_data_from_255a40bc")}{" "}
              <span className="font-medium">{data.range.start}</span> {autoT("to")}{" "}
              <span className="font-medium">{data.range.end}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <div className="px-3 py-2 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              {autoT("legacy.total_orders_7c2384ae")} {data.totals.total_orders}
            </div>

            {/* ✅ PDF Button */}
            <button
              onClick={handleGeneratePDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow"
            >
              <Download size={16} />
              {autoT("inventory_manager.reports.generate_pdf")}
            </button>
          </div>
        </div>

        {/* Menu Item Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {autoT("legacy.menu_item_sales_lookup_2299fa52")}
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              placeholder={autoT("legacy.enter_menu_item_name_b5b27bc8")}
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />

            <button
              onClick={handleItemSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              {autoT("legacy.search_bce06414")}
            </button>
          </div>

          {searchLoading && (
            <p className="text-xs text-gray-400 mt-2">{autoT("legacy.searching_ba2b5a5f")}</p>
          )}

          {itemResult && itemResult.length > 0 && (
            <div className="mt-4 border-t pt-3">
              {itemResult.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {item.menu_item__name || item.platter__name}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">
                      {item.total_sold} {autoT("legacy.sold_147f6d85")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.total_revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {itemResult && itemResult.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">{autoT("legacy.no_results_found_658e79f9")}</p>
          )}
        </div>
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title={autoT("overview.totalRevenue")}
            value={formatCurrency(data.totals.total_revenue)}
            icon={<DollarSign className="text-green-600" size={20} />}
            subtext={`Lost: ${formatCurrency(data.totals.lost_revenue)}`}
            color="bg-green-50"
          />
          <MetricCard
            title={autoT("stats.total_orders")}
            value={data.totals.total_orders}
            icon={<ShoppingBag className="text-blue-600" size={20} />}
            subtext={`Avg Value: ${formatCurrency(data.totals.average_order_value)}`}
            color="bg-blue-50"
          />
          <MetricCard
            title={autoT("stats.completed")}
            value={data.totals.completed_orders}
            icon={<CheckCircle className="text-emerald-600" size={20} />}
            color="bg-emerald-50"
          />
          <MetricCard
            title={autoT("status.cancelled")}
            value={data.totals.cancelled_orders}
            icon={<XCircle className="text-red-600" size={20} />}
            subtext={autoT("nav.orders")}
            color="bg-red-50"
          />
        </div>

        {/* NEW: Revenue Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title={autoT("legacy.food_revenue_fb1c5455")}
            value={formatCurrency(data.totals.food_revenue)}
            icon={<Utensils className="text-orange-600" size={20} />}
            color="bg-orange-50"
          />
          <MetricCard
            title={autoT("legacy.delivery_revenue_39546555")}
            value={formatCurrency(data.totals.delivery_revenue)}
            icon={<Truck className="text-blue-600" size={20} />}
            color="bg-blue-50"
          />
          <MetricCard
            title={autoT("legacy.reservation_revenue_96c94fb3")}
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
              {autoT("legacy.by_order_type_6fd39576")}
            </h3>
            <div className="space-y-4">
              {data.by_type.map((type, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium text-gray-700">
                      {type.order_type}
                    </span>
                    <span className="text-gray-500">{type.count} {autoT("legacy.orders_96584038")}</span>
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
              {autoT("legacy.order_status_a15b0b10")}
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
              {autoT("menu_item_sales.top_selling_items")}
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
                        {item.quantity_sold} {autoT("legacy.sold_147f6d85")}
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
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Daily Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={20} className="text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800">
                {autoT("legacy.daily_breakdown_b37690b6")}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">{autoT("table.date")}</th>
                    <th className="px-4 py-3">{autoT("nav.orders")}</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">
                      {autoT("dashboard.best_selling.revenue")}
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
          {autoT("legacy.average_preparation_time_2daaeca2")}{" "}
          {formatNumber(data.totals.average_preparation_minutes)} {autoT("legacy.minutes_be2e2bb6")}
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
  return <ErpStatusBadge status={status} count={count} showIcon={false} />;
}
