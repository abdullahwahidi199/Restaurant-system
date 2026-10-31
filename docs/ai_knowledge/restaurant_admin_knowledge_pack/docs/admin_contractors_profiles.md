---
id: admin_contractors_profiles
title: Contractors > Contractors
module: contractors
namespace: admin
status: current_observed_behavior
summary: Directory of service providers, contacts, activity status and current account balances, ordered by name. Includes
  inactive providers; no on-page directory search or date filter. Active pe...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- balance
- contractor
- contractors
- inactive
- ledger
- provider
- service
related_docs:
- admin_contractors_service_invoices
- admin_contractors_payables
routes: []
source_refs:
- uploaded_admin_reference:lines_356-363
tool_hints:
- records.list
- records.get
- ledger.get
metric_ids: []
---

### Contractors > Contractors

- **Purpose / activity:** Directory of service providers, contacts, activity status and current account balances, ordered by name. Includes inactive providers; no on-page directory search or date filter. Active permits new service invoices; it does not establish work completion or payment. New invoices require an active contractor even if an inactive profile appears in the selection list; old debts can still be paid after inactivation.
- **Invoiced / Paid / Balance:** Invoiced = all linked non-draft invoice charges; Paid = all linked payment amounts; Balance = max(Invoiced − Paid, 0). These are provider-wide, all-history figures, not contract value, current-period spending or totals restricted to visible invoice rows.
- **Profile ledger:** Non-draft invoices add debits on invoice dates; payments add credits on payment dates. Running balance starts at zero and accumulates debit minus credit in date order, invoices before payments on the same date. Unlike header Balance, it is not floored at zero; backdated payments can create negative intermediate balances. No opening balance is separately recorded.
- **Profile panels:** Contracts and Open Invoices use the workspace's matching lists, while ledger/header totals retain full provider history. Here Open Invoices means positive remaining balance, including drafts; such draft rows are not recognized payable debt and cannot receive payments despite a displayed payment control.
- **History limitation:** Inactivation retains obligations. Contractor deletion instead removes linked contracts, invoices and payments from financial history/totals; it is neither archival nor evidence that the debt was settled.
