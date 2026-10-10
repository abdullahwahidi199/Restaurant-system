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
import ReportHeader from "./ReportHeader";

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
      <>
        <ReportHeader
          onExport={handleGeneratePDF}
          exportLabel={autoT("inventory_manager.reports.generate_pdf")}
          disabled
        />
        <div className="theme-card flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--theme-border)] border-t-[var(--theme-primary)]" />
        </div>
      </>
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
    <div className="space-y-4">
      <ReportHeader
        onExport={handleGeneratePDF}
        exportLabel={autoT("inventory_manager.reports.generate_pdf")}
      />

      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Profit Calculation Flow (Left Side) */}
        <div className="theme-card space-y-4 p-4 sm:p-5 lg:col-span-2">
          <h3 className="mb-2 text-sm font-semibold theme-text-primary">
            {autoT("legacy.profit_calculation_f7a868ae")}
          </h3>

          {/* Revenue */}
          <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-2 text-base font-semibold theme-text-primary">
            <span>{autoT("overview.totalRevenue")}</span>
            <span>{formatCurrency(revenue)}</span>
          </div>

          {/* COGS Deduction */}
          <div className="ms-1 space-y-2 border-s-2 border-[var(--theme-border)] ps-2">
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
          <div className="ms-1 mt-2 space-y-2 border-s-2 border-[var(--theme-border)] ps-2">
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
          <div className="mt-4 flex gap-2 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-muted)] p-3 text-xs theme-text-muted">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong>{autoT("legacy.note_83423c19")}</strong> {autoT("legacy.stock_purchases_95f1885a")}
              {formatCurrency(expenses.stock_purchases)}{autoT("legacy.are_recorded_as_inventory_assets_supplier_payments_and_4cd355c8")}
            </p>
          </div>
        </div>

        {/* Expense Breakdown Chart (Right Side) */}
        <div className="theme-card p-4 sm:p-5 lg:col-span-3">
          <h3 className="mb-4 text-sm font-semibold theme-text-primary">
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
      <div className="theme-table overflow-hidden p-4 sm:p-5">
        <h3 className="mb-4 text-sm font-semibold theme-text-primary">
          {autoT("legacy.detailed_expenses_ffc97276")}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--theme-border)] text-sm theme-text-muted">
                <th className="pb-3 font-medium">{autoT("menu_item_sales.category")}</th>
                <th className="pb-3 font-medium text-right">{autoT("legacy.amount_43dc8532")}</th>
              </tr>
            </thead>
            <tbody className="theme-text-secondary">
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
              <tr className="border-b border-[var(--theme-border)] bg-[var(--theme-muted)] font-semibold theme-text-primary">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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
function StatCard({ title, value, icon, subtitle }) {
  return (
    <article className="theme-kpi-card flex min-w-0 items-start justify-between gap-3 p-3.5">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide theme-text-muted">{title}</p>
        <p className="mt-1 truncate text-xl font-semibold tabular-nums theme-text-primary" title={String(value)}>{value}</p>
        {subtitle && <p className="mt-1 truncate text-xs theme-text-muted">{subtitle}</p>}
      </div>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
        {React.cloneElement(icon, { className: "h-4 w-4" })}
      </div>
    </article>
  );
}

function ReportTable({ title, headers, rows, empty }) {
  return (
    <section className="theme-table overflow-hidden">
      <h3 className="border-b border-[var(--theme-border)] p-4 text-sm font-semibold theme-text-primary">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-start text-sm">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-start font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="theme-text-secondary">
            {rows.length ? (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-[var(--theme-border)] transition hover:bg-[var(--theme-hover)]">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center theme-text-muted" colSpan={headers.length}>
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
