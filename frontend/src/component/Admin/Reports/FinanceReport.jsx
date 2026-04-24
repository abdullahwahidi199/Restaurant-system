import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Package,
  Trash2,
  ShoppingCart,
  AlertCircle,
  Download,
  Receipt, // NEW
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// Helper to format currency
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AFN",
  }).format(value);

// Colors for the charts (4 items now)
const COLORS = ["#6366f1", "#f59e0b", "#ef4444", "#22c55e"];

export default function FinanceReport({ startDate, endDate }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getFinanceReport = async () => {
    setLoading(true);
    try {
      const res = await instance.get(
        `/reports/generate_report/?type=finance&start=${startDate}&end=${endDate}`,
      );
      setReportData(res.data.data);
      console.log("Fetched Finance Report:", res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      getFinanceReport();
    }
  }, [startDate, endDate]);

  const handleGeneratePDF = async () => {
    try {
      const res = await instance.get(
        `/reports/finance-pdf/?start=${startDate}&end=${endDate}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "finance_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      getFinanceReport();
    }
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!reportData) return null;

  const { revenue, expenses, gross_profit, net_profit, profit_margin_percent } =
    reportData;

  // Prepare data for Expense Pie Chart (now includes operational_expenses)
  const expenseChartData = [
    { name: "COGS", value: expenses.cogs },
    { name: "Wastage", value: expenses.wastage },
    { name: "Stock Purchases", value: expenses.stock_purchases },
    { name: "Operational Expenses", value: expenses.operational_expenses },
  ];

  return (
    <div className="space-y-6 p-1">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Financial Report</h2>
          <p className="text-sm text-gray-500">
            Summary of revenue, costs, and profitability
          </p>
        </div>

        {/* ✅ PDF Button */}
        <button
          onClick={handleGeneratePDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          Generate PDF
        </button>
      </div>

      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(revenue)}
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <StatCard
          title="Gross Profit"
          value={formatCurrency(gross_profit)}
          subtitle={`Revenue - COGS`}
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
          bgColor="bg-emerald-50"
          textColor="text-emerald-600"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(net_profit)}
          subtitle="Final Earnings"
          icon={<PiggyBank className="w-6 h-6 text-indigo-600" />}
          bgColor="bg-indigo-50"
          textColor="text-indigo-600"
        />
        <StatCard
          title="Profit Margin"
          value={`${profit_margin_percent}%`}
          subtitle="Net / Revenue"
          icon={<Percent className="w-6 h-6 text-amber-600" />}
          bgColor="bg-amber-50"
          textColor="text-amber-600"
        />
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Profit Calculation Flow (Left Side) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Profit Calculation
          </h3>

          {/* Revenue */}
          <div className="flex justify-between items-center text-lg font-medium text-gray-800 border-b pb-2">
            <span>Total Revenue</span>
            <span>{formatCurrency(revenue)}</span>
          </div>

          {/* COGS Deduction */}
          <div className="space-y-2 pl-2 border-l-2 border-gray-200 ml-1">
            <div className="flex justify-between items-center text-red-500">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Cost of Goods Sold (COGS)</span>
              </div>
              <span className="font-medium">
                - {formatCurrency(expenses.cogs)}
              </span>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="flex justify-between items-center text-emerald-600 font-bold pt-2 border-t border-dashed">
            <span>Gross Profit</span>
            <span>{formatCurrency(gross_profit)}</span>
          </div>

          {/* Operating Deductions */}
          <div className="space-y-2 pl-2 border-l-2 border-gray-200 ml-1 mt-2">
            <div className="flex justify-between items-center text-red-500">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Wastage</span>
              </div>
              <span className="font-medium">
                - {formatCurrency(expenses.wastage)}
              </span>
            </div>
            <div className="flex justify-between items-center text-red-500">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                <span>Operational Expenses</span>
              </div>
              <span className="font-medium">
                - {formatCurrency(expenses.operational_expenses)}
              </span>
            </div>
          </div>

          {/* Net Profit */}
          <div className="flex justify-between items-center text-indigo-600 font-bold pt-2 border-t border-dashed">
            <span>Net Profit</span>
            <span>{formatCurrency(net_profit)}</span>
          </div>

          {/* Note about Stock Purchases */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 flex gap-2 mt-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Note:</strong> Stock Purchases (
              {formatCurrency(expenses.stock_purchases)}) are recorded as
              inventory assets and are excluded from the operational expenses
              total above.
            </p>
          </div>
        </div>

        {/* Expense Breakdown Chart (Right Side) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Expense Distribution
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {expenseChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- Detailed Expense List --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Detailed Expenses
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-500 text-sm">
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-500" /> Cost of Goods
                  Sold (COGS)
                </td>
                <td className="py-3 text-right font-medium">
                  {formatCurrency(expenses.cogs)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-amber-500" /> Wastage Cost
                </td>
                <td className="py-3 text-right font-medium">
                  {formatCurrency(expenses.wastage)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-red-500" /> Operational
                  Expenses
                </td>
                <td className="py-3 text-right font-medium">
                  {formatCurrency(expenses.operational_expenses)}
                </td>
              </tr>
              <tr className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200">
                <td className="py-3">Total Operational Expenses</td>
                <td className="py-3 text-right">
                  {formatCurrency(expenses.total_expenses)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <ShoppingCart className="w-4 h-4 text-purple-500" /> Stock
                  Purchases (Inventory Asset)
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.stock_purchases)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, icon, bgColor, textColor, subtitle }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-lg ${bgColor}`}>{icon}</div>
    </div>
  );
}
