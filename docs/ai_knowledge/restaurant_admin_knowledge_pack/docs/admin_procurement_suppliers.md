---
id: admin_procurement_suppliers
title: Procurement > Suppliers
module: procurement
namespace: admin
status: current_observed_behavior
summary: Supplier identity, current activity status and cumulative purchase/payment relationship; no date filter. Active/Inactive
  is trading configuration, not whether a balance is settled. Inacti...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- balance
- history
- inactive
- ledger
- payable
- procurement
- profile
- supplier
- suppliers
- vendor
related_docs:
- admin_procurement_payables
- admin_procurement_payments
routes: []
source_refs:
- uploaded_admin_reference:lines_241-247
tool_hints:
- records.list
- records.get
- ledger.get
metric_ids:
- procurement.supplier_net_payables
---

### Procurement > Suppliers

- **Purpose:** Supplier identity, current activity status and cumulative purchase/payment relationship; no date filter. Active/Inactive is trading configuration, not whether a balance is settled. Inactive suppliers remain in financial totals; new invoices require an active supplier, while existing debt can still receive payments.
- **Purchases / Total purchases:** Sum of all related non-draft invoice totals, regardless of purchase/payment dates or current payment status. Excludes drafts and supplierless purchases.
- **Paid / Total paid / Balance:** Total paid sums all supplier-payment records; Balance = max(Total purchases − Total paid, 0). Not period payments or a credit-wallet balance. After invoice corrections, total payment records may exceed the invoice's capped Paid; supplier net balance can differ from summed positive invoice balances.
- **Ledger debit / credit / running balance:** Non-draft invoices add debits on purchase dates; payments add credits on payment dates. Running balance starts at zero and accumulates debit minus credit, sorted by date with invoices before payments on the same date; it is not capped at zero. Backdated payments can produce negative intermediate balances. Current header Balance still has a zero floor; no opening balance or independent supplier credit is included.
