---
id: admin_contractors_payables
title: Contractors > Payables
module: contractors
namespace: admin
status: current_observed_behavior
summary: Current all-history net service debt, using Dashboard Remaining Payments; not unpaid contract value, selected-period
  cost or only overdue invoices.
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- contractor
- contractors
- debt
- invoices
- outstanding
- payables
- service
- unpaid
related_docs:
- admin_contractors_service_invoices
- admin_reports_finance_purchase_contractor_payroll
routes: []
source_refs:
- uploaded_admin_reference:lines_392-397
tool_hints:
- records.list
- records.get
- ledger.get
metric_ids:
- contractors.current_net_payables
---

### Contractors > Payables

- **Purpose / Outstanding Balance:** Current all-history net service debt, using Dashboard Remaining Payments; not unpaid contract value, selected-period cost or only overdue invoices.
- **Open Invoices / table:** Count and list of matching Approved/Partially Paid invoices, including possible zero-balance Approved rows. Draft/Paid records are excluded. Invoice-list filters can narrow this count/table while the Outstanding Balance remains full-scope, so these figures need not describe the same population.
- **Interpretation:** Default order is latest invoice date, not earliest due date; no aging buckets or scheduled-payment calculation. Invoice Total is the recorded service charge and Balance is current unpaid amount. Old debts remain included, regardless of contract completion/expiry or provider inactivation.
