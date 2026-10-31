---
id: admin_contractors_dashboard
title: Contractors > Dashboard
module: contractors
namespace: admin
status: current_observed_behavior
summary: Count of profiles marked Active, not contractors with an active service contract, recent work or money due.
  Inactive contractors' historical charges and payments still affect financial to...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- active
- booked
- contractor
- contractors
- dashboard
- invoices
- outstanding
- payments
- service
- value
related_docs:
- admin_contractors_service_invoices
- admin_contractors_payables
routes: []
source_refs:
- uploaded_admin_reference:lines_345-355
tool_hints:
- reports.get
- records.list
metric_ids:
- contractors.current_net_payables
---

### Contractors > Dashboard

- **Active Contractors:** Count of profiles marked Active, not contractors with an active service contract, recent work or money due. Inactive contractors' historical charges and payments still affect financial totals.
- **Open Invoices:** Count of all scoped Approved/Partially Paid service invoices; excludes drafts and Paid status. Can include zero-value Approved invoices with no balance; it is not an overdue count.
- **Total Contract Value / Booked:** Actually sums all non-draft invoice charges, not Service Contracts' configured contract values. Includes approved unpaid, partially paid and fully paid invoices across all dates, including future-dated invoices.
- **Total Paid:** Sum of all scoped contractor-payment records, including initial invoice payments, regardless of invoice/payment date or contractor activity status. This is recorded disbursement history, not the sum of contract values or only this month's payments.
- **Remaining Payments / Outstanding:** max(Total Contract Value as defined here − Total Paid, 0), across all history. This is current net debt, not the unbilled remainder of agreements or a historical balance as of a selected date. Netting can differ from summing positive contractor/invoice balances after corrections or inconsistent retained payments.
- **Top Contractors / Contractor Expenses:** Five contractors ranked by their full-history non-draft Invoiced total; includes inactive profiles. The expense chart repeats those five invoice totals, not all contractors, money paid or contract values. Balance on each card uses the contractor definition below.
- **Payment Progress:** Displays total Paid and Outstanding amounts. Bar widths are relative to the largest displayed bar, with a minimum visible width; they are not percentages of invoiced value and need not add to 100%. The caption references total invoiced, floored to AFN 1 even when no invoices exist. KPI trend arrows are decorative, not growth calculations.
- **Recent / payables panels:** Recent Service Invoices shows six by newest invoice date/creation time, including drafts. Contractor Payables shows six Approved/Partially Paid invoices in that same order, not due-date priority. Recent Payments shows five by newest payment date/creation time. Invoice/payment filters can narrow these panels without changing headline totals; panel/table counts are displayed records, not complete dashboard counts.
