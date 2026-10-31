---
id: admin_reports_finance_profit_cost
title: 'Finance > Reports > Finance: Profit and Cost Definitions'
module: reports
namespace: admin
status: current_observed_behavior
summary: Same successful, creation-date order value as Orders Total Revenue, including discounted eligible delivery/reservation
  charges. Not confirmed receipts, unpaid-balance recovery or sales li...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- COGS
- and
- contractor
- cost
- definitions
- expense
- finance
- gross
- margin
- net
- payroll
- profit
- recipe
- reports
- wastage
related_docs:
- admin_dashboard_sales_meaning
- admin_finance_expenses
- admin_payroll_records
- admin_contractors_service_invoices
routes: []
source_refs:
- uploaded_admin_reference:lines_444-454
tool_hints:
- reports.get
metric_ids:
- finance.estimated_cogs
- finance.gross_profit
- finance.net_profit_estimate
- finance.payroll_cost_by_approval
- contractors.invoice_cost
---

### Finance > Reports > Finance: Profit and Cost Definitions

- **Total Revenue:** Same successful, creation-date order value as Orders Total Revenue, including discounted eligible delivery/reservation charges. Not confirmed receipts, unpaid-balance recovery or sales limited to menu products.
- **Cost of Goods Sold / COGS:** Sold non-cancelled units on successful period orders × current branch-effective recipe quantities × current ingredient unit costs. Platters expand their current component recipes/quantities. This is a recipe-cost estimate, not historical purchase-lot/FIFO cost or the sum of actual order-consumption movements. Missing recipes/costs understate it; later recipe/cost changes can change historical profit.
- **Wastage:** Sum of absolute quantities on Waste movements created in the period × each movement's recorded unit cost, falling back to current ingredient cost. Positive waste corrections are also counted as cost rather than offsets. Production losses/adjustments are not automatically wastage unless recorded as Waste.
- **Daily / Operational Expenses:** Saved AFN equivalents of live ordinary expense records whose expense date is in the period. Includes USD conversions; excludes deleted expenses and separate contractor/payroll/inventory purchase records.
- **Contractor Expenses:** Total charges of non-Draft service invoices dated in the period, whether unpaid, partially paid or paid. Contract value/status and payment dates do not define cost inclusion; these invoices do not also create ordinary expense entries.
- **Payroll Cost:** Sum of max(gross salary − ordinary deductions, 0) for Approved/Paid payrolls approved in the period. If approval time is missing, salary-period end date determines inclusion instead. Salary-advance recovery does not reduce this earned cost. Not a salary-period overlap calculation; the PDF's Monthly Payroll Cost label still means the selected approval-date period, not necessarily one month.
- **Total Expenses:** COGS + Wastage + Daily Expenses + Contractor Expenses + Payroll Cost. Inventory purchase value, debt balances, supplier/contractor/payroll payments and new salary advances are not extra profit deductions. A cost manually duplicated in ordinary Expenses is nevertheless counted again.
- **Gross Profit card:** Revenue − COGS; before wastage, ordinary expenses, contractor costs and payroll. **Net Profit card:** Revenue − Total Expenses; may be negative. **Profit Margin card:** Net Profit ÷ Revenue × 100, rounded to two decimals; displays zero when Revenue is zero/nonpositive. These are estimates from recorded data, not audited after-tax profit or cash in the bank; no additional tax/depreciation calculation is supplied.
