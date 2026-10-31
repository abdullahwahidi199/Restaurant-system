---
id: admin_contractors_shared_financial_meaning
title: Contractors > Shared Scope and Financial Meaning
module: contractors
namespace: admin
status: current_observed_behavior
summary: Contractors, service contracts, invoices and payments normally follow the selected branch; Branch Admins remain
  restricted to their branch. All four lists include all matching records, wi...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- agreements
- and
- contractor
- contractors
- expense
- financial
- invoice
- meaning
- payable
- payment
- provider
- scope
- service
- shared
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_339-344
tool_hints:
- reports.get
- records.list
metric_ids: []
---

### Contractors > Shared Scope and Financial Meaning

- **Coverage:** Contractors, service contracts, invoices and payments normally follow the selected branch; Branch Admins remain restricted to their branch. All four lists include all matching records, without a 100-record total limit. Table counts, pagination and exports cover those matches; searches and filters can narrow them. Contractor totals/ledgers and dashboard headline totals cover full scoped history independently of list filters.
- **Dates / headers:** No workspace-wide date-range selector or default month restriction. Invoice Date identifies the service charge; Payment Date identifies the recorded disbursement; Due Date is optional expected payment timing, not an automatic overdue filter. Form date defaults use UTC Today, which can still be yesterday early in Kabul morning. Header Active and Outstanding repeat dashboard figures, not additional totals.
- **Financial distinction:** Service-contract value is an agreement amount, non-draft invoice value is recognized contractor service cost, payments are disbursements, and remaining balances are current liabilities. Finance attributes service cost to invoice date and payments to payment date; approval does not create a separate ordinary-expense entry. These records do not receive/consume ingredients or post stock movements. Contract value and payments must not be added to invoice cost as extra expenses.
