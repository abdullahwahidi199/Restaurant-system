---
id: admin_reports_finance_detail_coverage
title: 'Finance > Reports > Finance: Detail Tables and Coverage'
module: reports
namespace: admin
status: current_observed_behavior
summary: Groups period-dated non-Draft purchase invoices. Invoices counts documents; Purchased sums charges; Paid and
  Balance are current cumulative settlement on those invoices, including payment...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- and
- contractor
- coverage
- detail
- finance
- ingredient
- invoice
- payroll
- report
- reports
- supplier
- tables
- truncation
- unpaid
related_docs:
- admin_reports_finance_purchase_contractor_payroll
- admin_reports_shared_period_rules
routes: []
source_refs:
- uploaded_admin_reference:lines_474-486
tool_hints:
- reports.get
- analytics.breakdown
metric_ids: []
---

### Finance > Reports > Finance: Detail Tables and Coverage

- **Purchases by Supplier:** Groups period-dated non-Draft purchase invoices. Invoices counts documents; Purchased sums charges; Paid and Balance are current cumulative settlement on those invoices, including payments outside the period. Cash / No Supplier is a separate group. Unlinked purchase movements are absent, so totals can differ from Purchase Value.
- **Purchases by Ingredient:** Period invoice-line quantities in the displayed ingredient unit and historical line values, not quantities consumed or current stock. The Invoices column actually counts lines, not distinct invoices; repeated ingredient lines can increase it within one invoice.
- **Expenses by Contractor:** Groups period service invoices; Invoices counts documents, Expense sums recognized charges, and Paid/Balance reflect their current cumulative settlement, not period payment activity. **Expenses by Service Type:** Groups those invoices' service lines; Lines counts lines, Qty sums entered service quantities and Expense sums line charges. Differing service units are not a common physical measure.
- **Grouping caution:** Supplier, ingredient, contractor and Finance employee groups use names; distinct same-name records can merge, especially across branches. Ingredient quantities should only be compared in compatible units; name grouping does not establish unit conversion.
- **Payroll by Branch / Employee:** Only Finance's selected approval-date/fallback cohort of Approved/Paid payrolls. Payrolls counts records; Cost is earned payroll expense; Paid is cumulative settlement on those records across all payment dates; Balance is their current remaining net salary. Employee Deductions combines ordinary deductions and advance recovery, already reflected in the relevant cost/net calculations; it must not be subtracted again.
- **Payroll Payment History:** Latest 30 transactions dated in the period, newest payment date/entry time first. Amount is one transaction and Period identifies its linked salary period. The Payroll Payments card includes all matching transactions, not only these 30.
- **Payroll Trends:** Table, not a payment trend chart. Groups the selected Finance payroll cohort by salary-period end month: Payrolls counts records, Cost sums earned expense and Net Salary sums salary after ordinary/advance deductions. Month labels may fall outside the approval-date reporting period; no proration occurs.
- **Unpaid Purchase Invoices:** Up to 25 latest purchase-date records among period purchases marked Unpaid/Partially Paid, including supplierless purchases. Total, Paid and Balance are current values; Due is optional, not an overdue filter. This selected-period sample does not cover the all-history supplier-linked population behind Supplier Payables.
- **Unpaid Contractor Invoices:** Up to 25 latest invoice-date Approved/Partially Paid service invoices from all history, not just the period. Current Total/Paid/Balance apply; possible zero-balance Approved invoices can remain listed. It is not a complete payables ledger or due-date-priority list.
- **PDF limits:** Finance PDF keeps full headline totals but shows only the first ten employee groups, payroll-payment rows, contractor groups, service-type groups and unpaid purchase/service invoice rows, and up to twelve payroll trend months. An empty/short detail section does not establish that the related overall debt or activity is zero.
