---
id: admin_procurement_purchase_invoices
title: Procurement > Purchase Invoices
module: procurement
namespace: admin
status: current_observed_behavior
summary: Supplier and supplierless ingredient purchase charges, stock receipt state and current settlement. Invoice Date
  is purchase date; Due date is optional expected payment timing; neither is...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- approved
- cash
- date
- draft
- due
- invoice
- invoices
- 'no'
- paid
- procurement
- purchase
- receipt
- remaining
- supplier
related_docs:
- admin_procurement_payments
- admin_procurement_suppliers
- admin_procurement_payables
routes: []
source_refs:
- uploaded_admin_reference:lines_223-232
tool_hints:
- records.list
- records.get
- ledger.get
metric_ids:
- procurement.purchase_invoice_value
---

### Procurement > Purchase Invoices

- **Purpose / dates:** Supplier and supplierless ingredient purchase charges, stock receipt state and current settlement. Invoice Date is purchase date; Due date is optional expected payment timing; neither is payment date. List search/status filters include all matching invoices; no purchase-date filter is exposed on this page.
- **Line quantity / Unit price / Line total:** Quantity in the ingredient's recorded stock unit × historical line price per that unit, rounded to two decimals for each line total. Invoice total sums those rounded line totals. No separate invoice tax, discount, freight or credit adjustment is added.
- **Paid / Remaining:** For supplier invoices, Paid is the sum of linked payment records, capped at the current invoice total; Remaining = max(Total − Paid, 0). Supplierless invoices instead use their directly stored paid amount. These are current cumulative amounts across all payment dates, not paid/outstanding as of the purchase date.
- **Draft / stock receipt:** Draft retains line charges but has zero recorded Paid, no received stock and is excluded from purchase/supplier totals. Its displayed Remaining is not an established payable. Approval posts stock once and makes it non-draft; stock receipt does not require payment, and later payment does not receive stock again.
- **Unpaid / Partially Paid / Paid:** No positive recorded payment; positive payment below total; or positive payment covering total. A zero-value invoice can remain Unpaid despite zero Remaining. These are financial states, not proof of bank settlement or an overdue classification.
- **Cash / No Supplier:** Means no supplier association, not automatically paid. A non-draft cash invoice can have a positive Remaining and appear among unpaid invoices, but contributes nothing to supplier balances and has no supplier-payment entries. How a later supplierless balance is settled through the current screens remains unresolved.
- **Corrections / evidence:** Linked purchase-movement corrections can recalculate invoice charges/status while retaining payments, so zero Remaining may hide payment amounts above the revised charge. Attachments and audit history provide evidence; uploading/removing an attachment does not change stock, charges or payments.
