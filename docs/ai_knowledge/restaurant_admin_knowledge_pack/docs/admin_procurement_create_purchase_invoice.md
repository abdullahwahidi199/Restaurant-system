---
id: admin_procurement_create_purchase_invoice
title: Procurement > Create Purchase Invoice
module: procurement
namespace: admin
status: current_observed_behavior
summary: Estimates ingredient purchase charges and initial settlement; Invoice total sums displayed line totals, Amount
  paid is the proposed initial payment, Remaining = max(preview total − initia...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- create
- draft
- g
- initial
- invoice
- kg
- l
- ml
- procurement
- purchase
- receiving
- settlement
- units
related_docs:
- admin_procurement_purchase_invoices
- admin_inventory_stock_movements
routes: []
source_refs:
- uploaded_admin_reference:lines_233-240
tool_hints:
- reports.get
- records.list
metric_ids: []
---

### Procurement > Create Purchase Invoice

- **Purpose / preview:** Estimates ingredient purchase charges and initial settlement; Invoice total sums displayed line totals, Amount paid is the proposed initial payment, Remaining = max(preview total − initial payment, 0). These are proposed values until recorded; final totals are recalculated from quantities/prices and can differ through rounding.
- **Purchasing units:** Ingredients recorded in g/ml are entered as kg/l: quantity × 1,000 and unit price ÷ 1,000, preserving line value. Other units remain unchanged. Saved invoice details show the original stock units, so quantities/prices can look different without changing the purchase value.
- **Receipt versus draft:** A non-draft invoice receives its stock and replaces current ingredient unit costs; an unpaid supplier purchase still increases stock. A draft does neither. Quantities must be positive and unit prices nonnegative; zero-cost lines are possible and do not establish a payment.
- **Initial payment:** On a non-draft supplier invoice, a positive initial amount creates a supplier payment dated the purchase date. With no supplier it is stored on the invoice directly, absent from Payments made. Initial amount cannot exceed total. A draft's entered initial amount is not retained as a payment and does not become a payment on approval.
- **Dates / payment method:** Purchase date determines purchase-period inclusion; due date does not alter totals or automatically schedule payment. Method describes the recorded initial payment, not a bank/card execution. The page's shared header totals describe existing records, not the unsaved invoice.
