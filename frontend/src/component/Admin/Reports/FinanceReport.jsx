import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import {
  DollarSign,
  TrendingUp,
  PiggyBank,
  Percent,
  Package,
  Trash2,
  ShoppingCart,
  AlertCircle,
  Download,
  Receipt,
  CreditCard,
  HandCoins,
  Users,
  Wallet,
  Wrench,
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

const COLORS = [
  "var(--theme-chart-1)",
  "var(--theme-chart-2)",
  "var(--theme-chart-3)",
  "var(--theme-chart-4)",
  "var(--theme-chart-5)",
];

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
    } catch (error) {
      console.error(error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--theme-primary)]"></div>
      </div>
    );
  }

  if (!reportData) return null;

  const {
    revenue,
    expenses,
    gross_profit,
    net_profit,
    profit_margin_percent,
    procurement = {},
    contractors = {},
    payroll = {},
    cash_flow = {},
  } = reportData;

  const expenseChartData = [
    { name: "COGS", value: expenses.cogs },
    { name: "Wastage", value: expenses.wastage },
    { name: "Daily Expenses", value: expenses.daily_expenses || expenses.operational_expenses },
    { name: "Contractor Expenses", value: expenses.contractor_expenses || 0 },
    { name: "Payroll", value: expenses.payroll || expenses.payroll_expenses || 0 },
  ];

  return (
    <div className="space-y-6 p-1">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold theme-text-primary">Financial Report</h2>
          <p className="text-sm theme-text-muted">
            Summary of revenue, costs, and profitability
          </p>
        </div>

        {/* ✅ PDF Button */}
        <button
          onClick={handleGeneratePDF}
          className="theme-btn theme-btn-danger px-4 py-2"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Purchase Value"
          value={formatCurrency(procurement.purchase_value || expenses.stock_purchases || 0)}
          subtitle="Inventory acquired"
          icon={<ShoppingCart className="w-6 h-6 text-sky-600" />}
          bgColor="bg-sky-50"
          textColor="text-sky-600"
        />
        <StatCard
          title="Supplier Payments"
          value={formatCurrency(procurement.payments_made || expenses.supplier_payments || 0)}
          subtitle="Cash paid to suppliers"
          icon={<CreditCard className="w-6 h-6 text-violet-600" />}
          bgColor="bg-violet-50"
          textColor="text-violet-600"
        />
        <StatCard
          title="Supplier Payables"
          value={formatCurrency(
            procurement.outstanding_supplier_balance || expenses.supplier_payables || 0,
          )}
          subtitle="Outstanding balance"
          icon={<Users className="w-6 h-6 text-rose-600" />}
          bgColor="bg-rose-50"
          textColor="text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Contractor Expenses"
          value={formatCurrency(contractors.expense_value || expenses.contractor_expenses || 0)}
          subtitle="Approved service invoices"
          icon={<Wrench className="w-6 h-6 text-cyan-600" />}
          bgColor="bg-cyan-50"
          textColor="text-cyan-600"
        />
        <StatCard
          title="Contractor Payments"
          value={formatCurrency(contractors.payments_made || expenses.contractor_payments || 0)}
          subtitle="Cash paid to contractors"
          icon={<HandCoins className="w-6 h-6 text-emerald-600" />}
          bgColor="bg-emerald-50"
          textColor="text-emerald-600"
        />
        <StatCard
          title="Contractor Payables"
          value={formatCurrency(
            contractors.outstanding_contractor_balance || expenses.contractor_payables || 0,
          )}
          subtitle="Outstanding contractor balance"
          icon={<CreditCard className="w-6 h-6 text-orange-600" />}
          bgColor="bg-orange-50"
          textColor="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Payroll Cost"
          value={formatCurrency(
            payroll.monthly_payroll_cost || expenses.payroll_expenses || expenses.payroll || 0,
          )}
          subtitle="Approved payroll expense"
          icon={<Wallet className="w-6 h-6 text-slate-700" />}
          bgColor="bg-slate-100"
          textColor="text-slate-700"
        />
        <StatCard
          title="Payroll Payments"
          value={formatCurrency(payroll.payments_made || expenses.payroll_payments || 0)}
          subtitle="Salary cash paid"
          icon={<HandCoins className="w-6 h-6 text-emerald-600" />}
          bgColor="bg-emerald-50"
          textColor="text-emerald-600"
        />
        <StatCard
          title="Outstanding Salaries"
          value={formatCurrency(payroll.outstanding_salaries || expenses.outstanding_salaries || 0)}
          subtitle="Approved salaries unpaid"
          icon={<CreditCard className="w-6 h-6 text-rose-600" />}
          bgColor="bg-rose-50"
          textColor="text-rose-600"
        />
        <StatCard
          title="Salary Advances"
          value={formatCurrency(payroll.salary_advances || expenses.salary_advances || 0)}
          subtitle="Advance cash out"
          icon={<Users className="w-6 h-6 text-amber-600" />}
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
                <span>Daily Expenses</span>
              </div>
              <span className="font-medium">
                - {formatCurrency(expenses.daily_expenses || expenses.operational_expenses)}
              </span>
            </div>
            <div className="flex justify-between items-center text-red-500">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span>Contractor Expenses</span>
              </div>
              <span className="font-medium">
                - {formatCurrency(expenses.contractor_expenses || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-red-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Payroll</span>
              </div>
              <span className="font-medium">
                - {formatCurrency(expenses.payroll || expenses.payroll_expenses || 0)}
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
              inventory assets. Supplier payments and contractor payments are
              shown as cash flow, while approved contractor invoices and approved
              payroll are counted once as expenses.
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
                  fill="var(--theme-chart-1)"
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
                  / Daily Expenses
                </td>
                <td className="py-3 text-right font-medium">
                  {formatCurrency(expenses.daily_expenses || expenses.operational_expenses)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-500" /> Contractor
                  Expenses
                </td>
                <td className="py-3 text-right font-medium">
                  {formatCurrency(expenses.contractor_expenses || 0)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" /> Payroll
                </td>
                <td className="py-3 text-right font-medium">
                  {formatCurrency(expenses.payroll || expenses.payroll_expenses || 0)}
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
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <CreditCard className="w-4 h-4 text-violet-500" /> Supplier
                  Payments (Cash Out)
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.supplier_payments || 0)}
                </td>
              </tr>
              <tr>
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <Users className="w-4 h-4 text-rose-500" /> Outstanding Supplier
                  Payables
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.supplier_payables || 0)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <HandCoins className="w-4 h-4 text-emerald-500" /> Contractor Payments (Cash Out)
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.contractor_payments || 0)}
                </td>
              </tr>
              <tr>
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <CreditCard className="w-4 h-4 text-orange-500" /> Outstanding Contractor
                  Payables
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.contractor_payables || 0)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <HandCoins className="w-4 h-4 text-emerald-500" /> Payroll Payments (Cash Out)
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.payroll_payments || 0)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <CreditCard className="w-4 h-4 text-rose-500" /> Outstanding Salaries
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.outstanding_salaries || 0)}
                </td>
              </tr>
              <tr>
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <Users className="w-4 h-4 text-amber-500" /> Salary Advances
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.salary_advances || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ReportTable
        title="Cash Flow"
        empty="No cash flow activity in this period."
        headers={["Line", "Amount"]}
        rows={[
          ["Cash In from Sales", formatCurrency(cash_flow.cash_in_from_sales || revenue || 0)],
          ["Supplier Payments", formatCurrency(cash_flow.supplier_payments || expenses.supplier_payments || 0)],
          ["Contractor Payments", formatCurrency(cash_flow.contractor_payments || expenses.contractor_payments || 0)],
          ["Daily Expense Payments", formatCurrency(cash_flow.daily_expense_payments || expenses.daily_expenses || expenses.operational_expenses || 0)],
          ["Payroll Payments", formatCurrency(cash_flow.payroll_payments || expenses.payroll_payments || 0)],
          ["Salary Advances", formatCurrency(cash_flow.salary_advances || expenses.salary_advances || 0)],
          ["Known Cash Out", formatCurrency(cash_flow.known_cash_out || 0)],
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReportTable
          title="Purchases by Supplier"
          empty="No supplier purchases in this period."
          headers={["Supplier", "Invoices", "Purchased", "Paid", "Balance"]}
          rows={(procurement.purchases_by_supplier || []).map((row) => [
            row.supplier,
            row.invoice_count,
            formatCurrency(row.purchase_value),
            formatCurrency(row.paid),
            formatCurrency(row.outstanding),
          ])}
        />
        <ReportTable
          title="Purchases by Ingredient"
          empty="No ingredient purchases in this period."
          headers={["Ingredient", "Qty", "Value", "Invoices"]}
          rows={(procurement.purchases_by_ingredient || []).map((row) => [
            `${row.ingredient} (${row.unit})`,
            Number(row.quantity || 0).toLocaleString(),
            formatCurrency(row.purchase_value),
            row.invoice_count,
          ])}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReportTable
          title="Expenses by Contractor"
          empty="No contractor expenses in this period."
          headers={["Contractor", "Invoices", "Expense", "Paid", "Balance"]}
          rows={(contractors.expenses_by_contractor || []).map((row) => [
            row.contractor,
            row.invoice_count,
            formatCurrency(row.expense_value),
            formatCurrency(row.paid),
            formatCurrency(row.outstanding),
          ])}
        />
        <ReportTable
          title="Expenses by Service Type"
          empty="No contractor service lines in this period."
          headers={["Service Type", "Lines", "Qty", "Expense"]}
          rows={(contractors.expenses_by_service_type || []).map((row) => [
            row.service_type,
            row.line_count,
            Number(row.quantity || 0).toLocaleString(),
            formatCurrency(row.expense_value),
          ])}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReportTable
          title="Payroll by Branch"
          empty="No approved payroll by branch in this period."
          headers={["Branch", "Payrolls", "Cost", "Paid", "Balance"]}
          rows={(payroll.payroll_by_branch || []).map((row) => [
            row.branch,
            row.payroll_count,
            formatCurrency(row.payroll_cost),
            formatCurrency(row.paid),
            formatCurrency(row.outstanding),
          ])}
        />
        <ReportTable
          title="Payroll by Employee"
          empty="No approved payroll by employee in this period."
          headers={["Employee", "Payrolls", "Cost", "Deductions", "Paid", "Balance"]}
          rows={(payroll.payroll_by_employee || []).map((row) => [
            row.employee,
            row.payroll_count,
            formatCurrency(row.payroll_cost),
            formatCurrency(Number(row.deductions || 0) + Number(row.advances || 0)),
            formatCurrency(row.paid),
            formatCurrency(row.outstanding),
          ])}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReportTable
          title="Payroll Payment History"
          empty="No payroll payments in this period."
          headers={["Date", "Employee", "Period", "Method", "Amount"]}
          rows={(payroll.payment_history || []).map((payment) => [
            payment.date,
            payment.employee,
            payment.period,
            String(payment.payment_method || "").replace("_", " "),
            formatCurrency(payment.amount),
          ])}
        />
        <ReportTable
          title="Payroll Trends"
          empty="No payroll trend data in this period."
          headers={["Period", "Payrolls", "Cost", "Net Salary"]}
          rows={(payroll.payroll_trends || []).map((row) => [
            row.period,
            row.payroll_count,
            formatCurrency(row.payroll_cost),
            formatCurrency(row.net_salary),
          ])}
        />
      </div>

      <ReportTable
        title="Unpaid Purchase Invoices"
        empty="No unpaid purchase invoices in this period."
        headers={["Invoice", "Supplier", "Date", "Due", "Total", "Paid", "Balance", "Status"]}
        rows={(procurement.unpaid_purchase_invoices || []).map((invoice) => [
          invoice.invoice_number,
          invoice.supplier,
          invoice.purchase_date,
          invoice.due_date || "-",
          formatCurrency(invoice.total_amount),
          formatCurrency(invoice.amount_paid),
          formatCurrency(invoice.remaining_balance),
          String(invoice.status || "").replace("_", " "),
        ])}
      />

      <ReportTable
        title="Unpaid Contractor Invoices"
        empty="No unpaid contractor invoices."
        headers={["Invoice", "Contractor", "Date", "Due", "Total", "Paid", "Balance", "Status"]}
        rows={(contractors.unpaid_contractor_invoices || []).map((invoice) => [
          invoice.invoice_number,
          invoice.contractor,
          invoice.invoice_date,
          invoice.due_date || "-",
          formatCurrency(invoice.total_amount),
          formatCurrency(invoice.amount_paid),
          formatCurrency(invoice.remaining_balance),
          String(invoice.status || "").replace("_", " "),
        ])}
      />
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

function ReportTable({ title, headers, rows, empty }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              {headers.map((header) => (
                <th key={header} className="pb-3 pr-4 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {rows.length ? (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-50">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="py-3 pr-4">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-6 text-center text-gray-500" colSpan={headers.length}>
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
