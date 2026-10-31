---
id: admin_reports_finance_purchase_contractor_payroll
title: 'Finance > Reports > Finance: Purchase, Contractor and Payroll Cards'
module: reports
namespace: admin
status: current_observed_behavior
summary: Non-Draft purchase invoice totals whose purchase date is in the period, plus purchase movements created in the
  period that have no linked invoice line. Unlinked movements contribute signe...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- advances
- and
- cards
- contractor
- finance
- financial
- payables
- payments
- payroll
- purchase
- report
- reports
- supplier
related_docs:
- admin_procurement_payables
- admin_payroll_records
- admin_contractors_payables
routes: []
source_refs:
- uploaded_admin_reference:lines_455-464
tool_hints:
- reports.get
metric_ids:
- finance.report_purchase_value
- finance.supplier_invoice_payables
- payroll.advances_issued
- finance.contractor_invoice_payables
---

### Finance > Reports > Finance: Purchase, Contractor and Payroll Cards

- **Purchase Value:** Non-Draft purchase invoice totals whose purchase date is in the period, plus purchase movements created in the period that have no linked invoice line. Unlinked movements contribute signed quantity × recorded cost/current-cost fallback. Includes Cash / No Supplier purchases. This acquires inventory rather than immediately increasing profit expenses.
- **Supplier Payments:** Sum of supplier-payment transactions dated in the period, including initial payments linked to supplier invoices. Not the paid-to-date total on period purchases. Cash / No Supplier direct settlement is not a supplier-payment transaction and is omitted from this card.
- **Supplier Payables:** Sum of current remaining balances on all-history non-Draft supplier-linked purchase invoices, not just period purchases. Excludes supplierless invoices and is not an overdue-only figure or an end-of-period historical balance. Future-dated records/payments can already affect current debt; this invoice-balance sum can differ from a globally netted supplier dashboard balance.
- **Contractor Expenses / Payments / Payables:** Expenses follows the service-cost definition above. Payments sums contractor-payment transactions dated in the period. Payables sums current remaining balances on all-history non-Draft service invoices, independently of selected dates or agreement status; not unbilled contract value or only overdue debt. Do not add payments/payables to service expense.
- **Payroll Cost / Payroll Payments:** Cost uses the approval-date cohort defined above. Payments sums salary-payment transactions dated in the period, even if the linked salary period/approval lies elsewhere; advances are separate. Cost and payments therefore need not match.
- **Outstanding Salaries:** Sum of current remaining net salary on all-history Approved payrolls, irrespective of selected dates. Excludes Draft and Paid payrolls. This is neither period payroll cost nor the narrower overlapping-period debt in Staff Performance.
- **Salary Advances:** Sum of advances issued on dates within the period, including both open and already-applied advances. It measures recorded advance disbursements, not outstanding recoverable advances or an extra payroll expense.
