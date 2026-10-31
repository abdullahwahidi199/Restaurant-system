---
id: admin_finance_expenses
title: Finance > Expenses
module: finance
namespace: admin
status: current_observed_behavior
summary: Records ordinary operating expenses for the selected branch, such as transport or incidental supplies. These
  are separate from ingredient purchase invoices, contractor service invoices an...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- AFN
- USD
- conversion
- exchange
- expense
- expenses
- finance
- operating
- ordinary
- rate
- spending
related_docs:
- admin_reports_finance_profit_cost
- admin_reports_finance_profit_flow_cash
routes: []
source_refs:
- uploaded_admin_reference:lines_398-408
tool_hints:
- records.list
- reports.get
metric_ids: []
---

### Finance > Expenses

- **Purpose / scope:** Records ordinary operating expenses for the selected branch, such as transport or incidental supplies. These are separate from ingredient purchase invoices, contractor service invoices and payroll. Recording the same cost in both places duplicates recognized expense; there is no automatic cross-module duplicate check or offset.
- **Total Expenses card:** Count of all current expense records in scope, not their monetary value. Includes all dates and currencies, regardless of table search, date or currency filters.
- **Total AFN card:** Sum of all expenses' saved AFN equivalents, including converted USD expenses; not only expenses originally entered in AFN. Full scoped history, independent of table filters.
- **Total USD card:** Sum of original USD amounts on USD expense records, across all scoped history. Those amounts are already converted into Total AFN; these two cards must not be added together.
- **This Month AFN card:** Sum of saved AFN equivalents whose expense date falls in the current UTC year/month. Not controlled by the table's From/To dates; includes future-dated entries within that month, rather than stopping at Today. Early on the first Kabul morning, the UTC month can still be the previous month.
- **Original Amount / Exchange Rate / AFN Equivalent:** AFN expenses retain their original amount. USD expenses use original amount × saved exchange rate, where the rate means AFN per USD; the saved AFN equivalent has two decimal places. This is a manually recorded rate, not a live currency feed or later revaluation. For example, USD 10 at AFN 70 per USD contributes AFN 700 to Total AFN and USD 10 to Total USD.
- **Dates / table coverage:** From/To inclusively filter expense date, not entry/change time; an omitted bound is open, and the default is no date restriction. Search matches name/description; currency filters the original currency. Default order is newest expense date. Table counts and pagination cover all matching records, not a newest-100 subset; cards still describe the unfiltered scope.
- **Recognition / limitations:** There is no Draft, Approved or Paid expense status and no separate expense-payment balance. A saved expense immediately contributes to operating cost on its expense date; Finance also treats it as an expense payment without independently verifying cash movement. Zero/negative amounts or rates are not prohibited and can reduce/invert totals; they are not automatically classified refunds. Intended adjustment/validation policy is unverified.
