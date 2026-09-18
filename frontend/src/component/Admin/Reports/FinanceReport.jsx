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
import { useTranslation as useAutoTranslation } from "react-i18next";

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
                 const { t: autoT } = useAutoTranslation();
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
          <h2 className="text-2xl font-bold theme-text-primary">{autoT("legacy.financial_report_ac29ba77")}</h2>
          <p className="text-sm theme-text-muted">
            {autoT("legacy.summary_of_revenue_costs_and_profitability_4de20ac1")}
          </p>
        </div>

        {/* ✅ PDF Button */}
        <button
          onClick={handleGeneratePDF}
          className="theme-btn theme-btn-danger px-4 py-2"
        >
          <Download className="w-4 h-4" />
          {autoT("inventory_manager.reports.generate_pdf")}
        </button>
      </div>

      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={autoT("overview.totalRevenue")}
          value={formatCurrency(revenue)}
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <StatCard
          title={autoT("legacy.gross_profit_11f53e51")}
          value={formatCurrency(gross_profit)}
          subtitle={`Revenue - COGS`}
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
          bgColor="bg-emerald-50"
          textColor="text-emerald-600"
        />
        <StatCard
          title={autoT("legacy.net_profit_8bebc63c")}
          value={formatCurrency(net_profit)}
          subtitle={autoT("legacy.final_earnings_83e8ace7")}
          icon={<PiggyBank className="w-6 h-6 text-indigo-600" />}
          bgColor="bg-indigo-50"
          textColor="text-indigo-600"
        />
        <StatCard
          title={autoT("legacy.profit_margin_f3417ddf")}
          value={`${profit_margin_percent}%`}
          subtitle={autoT("legacy.net_revenue_23cf090c")}
          icon={<Percent className="w-6 h-6 text-amber-600" />}
          bgColor="bg-amber-50"
          textColor="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title={autoT("inventory_manager.reports.purchase_value")}
          value={formatCurrency(procurement.purchase_value || expenses.stock_purchases || 0)}
          subtitle={autoT("inventory_manager.reports.inventory_acquired")}
          icon={<ShoppingCart className="w-6 h-6 text-sky-600" />}
          bgColor="bg-sky-50"
          textColor="text-sky-600"
        />
        <StatCard
          title={autoT("legacy.supplier_payments_6ef8f5d6")}
          value={formatCurrency(procurement.payments_made || expenses.supplier_payments || 0)}
          subtitle={autoT("legacy.cash_paid_to_suppliers_630d6efe")}
          icon={<CreditCard className="w-6 h-6 text-violet-600" />}
          bgColor="bg-violet-50"
          textColor="text-violet-600"
        />
        <StatCard
          title={autoT("legacy.supplier_payables_bb42108a")}
          value={formatCurrency(
            procurement.outstanding_supplier_balance || expenses.supplier_payables || 0,
          )}
          subtitle={autoT("legacy.outstanding_balance_e9fd5bbe")}
          icon={<Users className="w-6 h-6 text-rose-600" />}
          bgColor="bg-rose-50"
          textColor="text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title={autoT("legacy.contractor_expenses_b22d5462")}
          value={formatCurrency(contractors.expense_value || expenses.contractor_expenses || 0)}
          subtitle={autoT("legacy.approved_service_invoices_7b86267c")}
          icon={<Wrench className="w-6 h-6 text-cyan-600" />}
          bgColor="bg-cyan-50"
          textColor="text-cyan-600"
        />
        <StatCard
          title={autoT("legacy.contractor_payments_e3cef71c")}
          value={formatCurrency(contractors.payments_made || expenses.contractor_payments || 0)}
          subtitle={autoT("legacy.cash_paid_to_contractors_ecc02ee0")}
          icon={<HandCoins className="w-6 h-6 text-emerald-600" />}
          bgColor="bg-emerald-50"
          textColor="text-emerald-600"
        />
        <StatCard
          title={autoT("legacy.contractor_payables_b19d6dfa")}
          value={formatCurrency(
            contractors.outstanding_contractor_balance || expenses.contractor_payables || 0,
          )}
          subtitle={autoT("legacy.outstanding_contractor_balance_8dac38dd")}
          icon={<CreditCard className="w-6 h-6 text-orange-600" />}
          bgColor="bg-orange-50"
          textColor="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title={autoT("legacy.payroll_cost_36af4f9a")}
          value={formatCurrency(
            payroll.monthly_payroll_cost || expenses.payroll_expenses || expenses.payroll || 0,
          )}
          subtitle={autoT("legacy.approved_payroll_expense_00e97eca")}
          icon={<Wallet className="w-6 h-6 text-slate-700" />}
          bgColor="bg-slate-100"
          textColor="text-slate-700"
        />
        <StatCard
          title={autoT("legacy.payroll_payments_bc2648b7")}
          value={formatCurrency(payroll.payments_made || expenses.payroll_payments || 0)}
          subtitle={autoT("legacy.salary_cash_paid_49018b17")}
          icon={<HandCoins className="w-6 h-6 text-emerald-600" />}
          bgColor="bg-emerald-50"
          textColor="text-emerald-600"
        />
        <StatCard
          title={autoT("legacy.outstanding_salaries_d5f97e4e")}
          value={formatCurrency(payroll.outstanding_salaries || expenses.outstanding_salaries || 0)}
          subtitle={autoT("legacy.approved_salaries_unpaid_01284335")}
          icon={<CreditCard className="w-6 h-6 text-rose-600" />}
          bgColor="bg-rose-50"
          textColor="text-rose-600"
        />
        <StatCard
          title={autoT("legacy.salary_advances_e8cda02b")}
          value={formatCurrency(payroll.salary_advances || expenses.salary_advances || 0)}
          subtitle={autoT("legacy.advance_cash_out_c2c48d77")}
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
            {autoT("legacy.profit_calculation_f7a868ae")}
          </h3>

          {/* Revenue */}
          <div className="flex justify-between items-center text-lg font-medium text-gray-800 border-b pb-2">
            <span>{autoT("overview.totalRevenue")}</span>
            <span>{formatCurrency(revenue)}</span>
          </div>

          {/* COGS Deduction */}
          <div className="space-y-2 pl-2 border-l-2 border-gray-200 ml-1">
            <div className="flex justify-between items-center text-red-500">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{autoT("legacy.cost_of_goods_sold_cogs_05b8a039")}</span>
              </div>
              <span className="font-medium">
                - {formatCurrency(expenses.cogs)}
              </span>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="flex justify-between items-center text-emerald-600 font-bold pt-2 border-t border-dashed">
            <span>{autoT("legacy.gross_profit_11f53e51")}</span>
            <span>{formatCurrency(gross_profit)}</span>
          </div>

          {/* Operating Deductions */}
          <div className="space-y-2 pl-2 border-l-2 border-gray-200 ml-1 mt-2">
            <div className="flex justify-between items-center text-red-500">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>{autoT("legacy.wastage_fbbed94e")}</span>
              </div>
              <span className="font-medium">
                - {formatCurrency(expenses.wastage)}
              </span>
            </div>
            <div className="flex justify-between items-center text-red-500">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                <span>{autoT("legacy.daily_expenses_fd95f668")}</span>
              </div>
              <span className="font-medium">
                - {formatCurrency(expenses.daily_expenses || expenses.operational_expenses)}
              </span>
            </div>
            <div className="flex justify-between items-center text-red-500">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span>{autoT("legacy.contractor_expenses_b22d5462")}</span>
              </div>
              <span className="font-medium">
                - {formatCurrency(expenses.contractor_expenses || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-red-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{autoT("landing.features.groups.staff.items.payroll")}</span>
              </div>
              <span className="font-medium">
                - {formatCurrency(expenses.payroll || expenses.payroll_expenses || 0)}
              </span>
            </div>
          </div>

          {/* Net Profit */}
          <div className="flex justify-between items-center text-indigo-600 font-bold pt-2 border-t border-dashed">
            <span>{autoT("legacy.net_profit_8bebc63c")}</span>
            <span>{formatCurrency(net_profit)}</span>
          </div>

          {/* Note about Stock Purchases */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 flex gap-2 mt-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong>{autoT("legacy.note_83423c19")}</strong> {autoT("legacy.stock_purchases_95f1885a")}
              {formatCurrency(expenses.stock_purchases)}{autoT("legacy.are_recorded_as_inventory_assets_supplier_payments_and_4cd355c8")}
            </p>
          </div>
        </div>

        {/* Expense Breakdown Chart (Right Side) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {autoT("legacy.expense_distribution_c1d781a5")}
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
          {autoT("legacy.detailed_expenses_ffc97276")}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-500 text-sm">
                <th className="pb-3 font-medium">{autoT("menu_item_sales.category")}</th>
                <th className="pb-3 font-medium text-right">{autoT("legacy.amount_43dc8532")}</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-500" /> {autoT("legacy.cost_of_goods_sold_cogs_05b8a039")}
                </td>
                <td className="py-3 text-right font-medium">
                  {formatCurrency(expenses.cogs)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-amber-500" /> {autoT("legacy.wastage_cost_7cb576f0")}
                </td>
                <td className="py-3 text-right font-medium">
                  {formatCurrency(expenses.wastage)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-red-500" /> {autoT("legacy.operational_daily_expenses_791b17a2")}
                </td>
                <td className="py-3 text-right font-medium">
                  {formatCurrency(expenses.daily_expenses || expenses.operational_expenses)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-500" /> {autoT("legacy.contractor_expenses_b22d5462")}
                </td>
                <td className="py-3 text-right font-medium">
                  {formatCurrency(expenses.contractor_expenses || 0)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" /> {autoT("landing.features.groups.staff.items.payroll")}
                </td>
                <td className="py-3 text-right font-medium">
                  {formatCurrency(expenses.payroll || expenses.payroll_expenses || 0)}
                </td>
              </tr>
              <tr className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200">
                <td className="py-3">{autoT("legacy.total_operational_expenses_4bf59ead")}</td>
                <td className="py-3 text-right">
                  {formatCurrency(expenses.total_expenses)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <ShoppingCart className="w-4 h-4 text-purple-500" /> {autoT("legacy.stock_purchases_inventory_asset_3cc901c7")}
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.stock_purchases)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <CreditCard className="w-4 h-4 text-violet-500" /> {autoT("legacy.supplier_payments_cash_out_b5888afe")}
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.supplier_payments || 0)}
                </td>
              </tr>
              <tr>
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <Users className="w-4 h-4 text-rose-500" /> {autoT("legacy.outstanding_supplier_payables_4dc1c36f")}
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.supplier_payables || 0)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <HandCoins className="w-4 h-4 text-emerald-500" /> {autoT("legacy.contractor_payments_cash_out_f6903190")}
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.contractor_payments || 0)}
                </td>
              </tr>
              <tr>
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <CreditCard className="w-4 h-4 text-orange-500" /> {autoT("legacy.outstanding_contractor_payables_5b671774")}
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.contractor_payables || 0)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <HandCoins className="w-4 h-4 text-emerald-500" /> {autoT("legacy.payroll_payments_cash_out_82174c6f")}
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.payroll_payments || 0)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <CreditCard className="w-4 h-4 text-rose-500" /> {autoT("legacy.outstanding_salaries_d5f97e4e")}
                </td>
                <td className="py-3 text-right font-medium text-gray-500">
                  {formatCurrency(expenses.outstanding_salaries || 0)}
                </td>
              </tr>
              <tr>
                <td className="py-3 flex items-center gap-2 text-gray-500">
                  <Users className="w-4 h-4 text-amber-500" /> {autoT("legacy.salary_advances_e8cda02b")}
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
        title={autoT("legacy.cash_flow_4d78e9f9")}
        empty={autoT("legacy.no_cash_flow_activity_in_this_period_47a6eb07")}
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
          title={autoT("legacy.purchases_by_supplier_d971c47d")}
          empty={autoT("legacy.no_supplier_purchases_in_this_period_0be361c8")}
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
          title={autoT("legacy.purchases_by_ingredient_111e4be6")}
          empty={autoT("legacy.no_ingredient_purchases_in_this_period_a6d971e2")}
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
          title={autoT("legacy.expenses_by_contractor_29e67b0d")}
          empty={autoT("legacy.no_contractor_expenses_in_this_period_db17e06c")}
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
          title={autoT("legacy.expenses_by_service_type_bd83c0f7")}
          empty={autoT("legacy.no_contractor_service_lines_in_this_period_0ee7a21e")}
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
          title={autoT("legacy.payroll_by_branch_9430471d")}
          empty={autoT("legacy.no_approved_payroll_by_branch_in_this_period_833c9d1f")}
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
          title={autoT("legacy.payroll_by_employee_d871904a")}
          empty={autoT("legacy.no_approved_payroll_by_employee_in_this_period_44c251ed")}
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
          title={autoT("legacy.payroll_payment_history_17213ece")}
          empty={autoT("legacy.no_payroll_payments_in_this_period_ed8b2011")}
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
          title={autoT("legacy.payroll_trends_69183e2d")}
          empty={autoT("legacy.no_payroll_trend_data_in_this_period_5a530430")}
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
        title={autoT("legacy.unpaid_purchase_invoices_195042f5")}
        empty={autoT("legacy.no_unpaid_purchase_invoices_in_this_period_08b74916")}
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
        title={autoT("legacy.unpaid_contractor_invoices_39c11655")}
        empty={autoT("legacy.no_unpaid_contractor_invoices_3b39fc4e")}
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
