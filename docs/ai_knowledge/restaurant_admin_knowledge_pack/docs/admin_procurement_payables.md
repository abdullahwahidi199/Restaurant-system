---
id: admin_procurement_payables
title: Procurement > Payables
module: procurement
namespace: admin
status: current_observed_behavior
summary: Current supplier net debt, using Dashboard Supplier balance and Suppliers Balance definitions; all history rather
  than a selected period or balance as of a past date.
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- balance
- debt
- invoices
- liabilities
- net
- outstanding
- payables
- procurement
- supplier
- unpaid
related_docs:
- admin_procurement_suppliers
- admin_reports_finance_purchase_contractor_payroll
routes: []
source_refs:
- uploaded_admin_reference:lines_255-261
tool_hints:
- records.list
- records.get
- ledger.get
metric_ids:
- procurement.supplier_net_payables
---

### Procurement > Payables

- **Purpose / Outstanding balance:** Current supplier net debt, using Dashboard Supplier balance and Suppliers Balance definitions; all history rather than a selected period or balance as of a past date.
- **Unpaid invoices / table:** Count and list of all matching Unpaid/Partially Paid invoices. Includes supplierless and possible zero-balance invoices; excludes drafts and Paid status. It can therefore disagree with the supplier-only Outstanding balance.
- **Suppliers with balance:** Number of suppliers with positive current Balance, including inactive suppliers; supplier balance list sorts largest first. Supplier totals are not limited to the visible unpaid-invoice set.
- **Interpretation:** Payables includes debt regardless of due date; no overdue aging or payment schedule is calculated here. Compare supplier net balances with invoice balances and retained payments before assuming they reconcile, especially after purchase corrections. Supplierless settlement and handling of payments above revised invoice charges remain unresolved.
