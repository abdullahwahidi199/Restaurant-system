---
id: admin_contractors_service_contracts
title: Contractors > Service Contracts
module: contractors
namespace: admin
status: current_observed_behavior
summary: Agreements linked optionally to service invoices. Period shows configured Start/End; Open means no end date,
  not an unpaid balance. Search matches title, contractor name or notes; status...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- active
- agreement
- cancelled
- contract
- contractors
- contracts
- dates
- expired
- invoiced
- service
- value
related_docs:
- admin_contractors_service_invoices
routes: []
source_refs:
- uploaded_admin_reference:lines_364-369
tool_hints:
- reports.get
- records.list
metric_ids: []
---

### Contractors > Service Contracts

- **Purpose / dates:** Agreements linked optionally to service invoices. Period shows configured Start/End; Open means no end date, not an unpaid balance. Search matches title, contractor name or notes; status filters narrow records. Default ordering is latest start date/creation time, not expiry priority; no date-range selector.
- **Value / Invoiced:** Value is the entered agreement amount, not cost already incurred or paid. Invoiced sums all linked non-draft invoice charges regardless of invoice dates or the agreement's status; unlinked invoices are excluded. No remaining contract budget, utilization percentage or automatic recurring bill is calculated.
- **Statuses:** Draft, Active, Completed, Cancelled and Expired are recorded agreement states; passing the end date does not automatically expire a contract. Completed/Cancelled/Expired do not cancel existing invoices or settle debt. Contract status, value and dates do not enforce an invoice ceiling or restrict invoicing to the agreement period; end-before-start dates are not rejected. Intended date/value safeguards remain unresolved.
