---
id: admin_reports_finance_profit_flow_cash
title: 'Finance > Reports > Finance: Profit Flow, Expense Chart and Cash Flow'
module: reports
namespace: admin
status: current_observed_behavior
summary: Starts with Revenue, subtracts COGS to show Gross Profit, then subtracts Wastage, Daily Expenses, Contractor
  Expenses and Payroll to reach Net Profit. Intermediate totals repeat the cards...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- and
- cash
- chart
- distribution
- expense
- finance
- flow
- in
- known
- net
- out
- profit
- reports
- sales
related_docs:
- admin_reports_finance_profit_cost
- admin_reports_finance_purchase_contractor_payroll
routes: []
source_refs:
- uploaded_admin_reference:lines_465-473
tool_hints:
- reports.get
metric_ids:
- finance.reported_cash_in_from_sales
- finance.known_cash_out
---

### Finance > Reports > Finance: Profit Flow, Expense Chart and Cash Flow

- **Profit Calculation:** Starts with Revenue, subtracts COGS to show Gross Profit, then subtracts Wastage, Daily Expenses, Contractor Expenses and Payroll to reach Net Profit. Intermediate totals repeat the cards; they are not additional income or expenses to add together.
- **Expense Distribution donut:** Five slices: COGS, Wastage, Daily Expenses, Contractor Expenses and Payroll. Each percentage = category cost ÷ Total Expenses × 100, displayed as a whole percentage. Shows the composition of recognized cost, not cost as a percentage of revenue; excludes inventory purchases, payments and outstanding debt. Zero/negative cost data can make shares misleading, and rounded percentages need not total exactly 100%.
- **Detailed Expenses table:** Repeats the five profit-cost components. Its Total Operational Expenses row actually totals all five, including COGS and payroll; it is not just the Daily Expenses amount. Additional purchase/payment/payable/advance rows are contextual figures and must not all be summed into expenses.
- **Cash In from Sales:** Repeats order revenue using order creation dates, without independently checking receipts, payment dates or payment methods. Despite its label, it is not verified cash collected during the period.
- **Cash-out lines / Known Cash Out:** Supplier Payments + Contractor Payments + Daily Expense Payments + Payroll Payments + Salary Advances. Payment records use transaction dates; Daily Expense Payments assumes the period's ordinary expenses were paid. Only these recorded channels are included; supplierless purchase settlement is omitted. There is no opening/closing cash balance, bank reconciliation or separation of physical cash from card/bank payments. Known Cash Out is not Total Expenses, and this panel is not a complete cash-flow statement.
- **Example:** A period's AFN 1,000 purchase invoice with AFN 400 paid contributes AFN 1,000 Purchase Value and AFN 400 Supplier Payments; its remaining AFN 600 contributes to current Supplier Payables if supplier-linked. It does not add AFN 1,000 to profit expenses: sold recipe ingredients contribute COGS separately. Paying the AFN 600 later reduces debt and appears in that later payment period without recognizing the purchase cost again.
