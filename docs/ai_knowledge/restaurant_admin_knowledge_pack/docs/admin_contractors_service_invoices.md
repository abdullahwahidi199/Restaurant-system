---
id: admin_contractors_service_invoices
title: Contractors > Service Invoices
module: contractors
namespace: admin
status: current_observed_behavior
summary: Service charges, linked provider/agreement and current settlement. Search matches stored invoice number, provider
  name, contract title, description or service-line type/description; statu...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- approved
- charges
- contractors
- draft
- invoice
- invoices
- paid
- quantity
- rate
- remaining
- service
related_docs:
- admin_contractors_payments
- admin_contractors_payables
- admin_reports_finance_profit_cost
routes: []
source_refs:
- uploaded_admin_reference:lines_370-378
tool_hints:
- records.list
- records.get
- ledger.get
metric_ids:
- contractors.invoice_cost
---

### Contractors > Service Invoices

- **Purpose / filters:** Service charges, linked provider/agreement and current settlement. Search matches stored invoice number, provider name, contract title, description or service-line type/description; status/provider filters narrow records. Default ordering is invoice date then creation time, newest first; no on-page date-range control. Where a date range is used, both bounds apply inclusively to invoice date, not due/payment dates.
- **Quantity / Unit Price / Total:** Each service line is quantity × AFN price per service unit, rounded to two decimals; invoice Total sums rounded line totals. Quantity is not ingredient stock or automatically measured work hours. No separate tax, discount, retention, freight or contract-value adjustment is added.
- **Paid / Balance / Remaining:** Paid sums linked payment records, capped at current invoice Total; Remaining = max(Total − Paid, 0). These include payments across all recorded dates, not payment activity in the invoice-date period or the balance as it stood then.
- **Draft / Approved:** Draft retains line charges and may display a positive Balance, but Paid is zero, payments are prohibited, and it is excluded from service-cost, contractor-ledger and recognized-payables totals. Approved means posted and unpaid; approval recognizes the charge, not a cash transfer. A zero-total unpaid invoice can remain Approved and count as Open.
- **Partially Paid / Paid:** Positive payments below Total yield Partially Paid; payments covering Total yield Paid. These concern settlement, not service-contract completion or independent verification that work was performed. A change in agreement status does not change invoice status.
- **References / detail:** Blank invoice numbers display as CINV-number references; those generated labels are not necessarily searchable as stored invoice numbers. Detail repeats Total, Paid and Remaining and shows service lines, full linked payment history, supporting attachments and audit changes. Attachments/audit entries are evidence/context, not additional charges or payments; there is no general invoice-level edit, void or refund screen.
