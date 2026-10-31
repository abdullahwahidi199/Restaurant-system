---
id: admin_contractors_create_invoice
title: Contractors > Create Invoice
module: contractors
namespace: admin
status: current_observed_behavior
summary: Establishes a Draft calculation or an Approved service charge, optionally with an initial payment; not an ingredient
  purchase. Approved is the default. A linked contract must belong to th...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- add
- contractor
- contractors
- create
- draft
- initial
- invoice
- lines
- payment
- service
related_docs:
- admin_contractors_service_invoices
- admin_contractors_payments
routes: []
source_refs:
- uploaded_admin_reference:lines_379-385
tool_hints:
- reports.get
- records.list
metric_ids: []
---

### Contractors > Create Invoice

- **Purpose:** Establishes a Draft calculation or an Approved service charge, optionally with an initial payment; not an ingredient purchase. Approved is the default. A linked contract must belong to the selected provider/branch, but can have any status and does not supply the invoice amount or enforce its value/date limits. Invoices may have no linked contract.
- **Invoice Total preview:** Sums entered quantity × unit price without rounding each line first; the saved invoice instead sums rounded line totals. Fractional quantities can therefore produce a small preview/saved-total difference. Quantity must be positive and unit price nonnegative; blank line description falls back to the service type. Service Type categorizes work; it is not an inventory item or separate automatic charge.
- **Amount Paid Initially:** Blank/zero records no payment. A positive amount creates a real linked payment record dated on Invoice Date, using the chosen method/reference; it cannot exceed the saved Total and is forbidden for Draft. Partial/full initial settlement determines Partially Paid/Paid immediately. Initial payments are already included in payment history and Paid totals, not a second amount to add.
- **Negative amounts / evidence:** Negative initial amounts are ignored rather than creating refunds or credits; intended adjustment handling remains unresolved. A positive Remaining or a recorded payment does not verify an external transfer or establish compliance with the service agreement.
