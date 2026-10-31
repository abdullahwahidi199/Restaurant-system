---
id: admin_procurement_dashboard
title: Procurement > Dashboard
module: procurement
namespace: admin
status: current_observed_behavior
summary: Sum of non-draft loaded invoice totals whose purchase date is in the current UTC calendar month, including same-month
  future-dated invoices. It is not strictly month-to-date or based on p...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- balance
- chart
- dashboard
- invoices
- pending
- procurement
- purchase
- purchases
- spend
- supplier
related_docs:
- admin_procurement_purchase_invoices
- admin_procurement_suppliers
- admin_procurement_payables
routes: []
source_refs:
- uploaded_admin_reference:lines_212-222
tool_hints:
- reports.get
- records.list
metric_ids:
- procurement.purchase_invoice_value
---

### Procurement > Dashboard

- **Total purchases / Month spend:** Sum of non-draft loaded invoice totals whose purchase date is in the current UTC calendar month, including same-month future-dated invoices. It is not strictly month-to-date or based on payment dates; includes supplierless purchases.
- **Today's purchases:** Sum of non-draft loaded invoice totals whose purchase date equals UTC Today; not invoices created, received or paid today unless those dates coincide.
- **Pending invoices:** Number of loaded invoices with Unpaid or Partially Paid status, including supplierless invoices and possible zero-balance/zero-value Unpaid invoices. Not draft approvals or necessarily overdue invoices.
- **Supplier balance / Payables:** Sum of all listed suppliers' current outstanding balances, active and inactive; excludes supplierless invoice balances. This is an all-history balance, not this month's unpaid purchases.
- **Payments made:** Sum of all matching supplier-payment amounts, with no month/today restriction. Excludes supplierless initial amounts stored directly on invoices; search can narrow the included payments. Not comparable to monthly purchases as if both covered the same period.
- **Monthly purchasing chart:** Actually sums non-draft loaded invoices by purchase date and shows the latest seven dates with purchases, newest first; not seven calendar days or monthly buckets. Missing purchase dates are omitted.
- **Top suppliers / Spend by supplier:** Five suppliers ranked by all-history non-draft purchase charges; Purchased and Balance use the supplier definitions below. Spend here means invoice value, not money paid; inactive suppliers can be included. Chart bars scale to the largest shown value with a minimum visible width, not a spending percentage.
- **Recent / Upcoming panels:** Recent invoices shows up to six by purchase date/creation time, including drafts; Upcoming supplier payments shows up to six Unpaid/Partially Paid invoices in that same order, not scheduled payments or due-date order. Recent payment activity shows up to five by payment date/creation time. Decorative trend arrows are not calculated growth rates.
