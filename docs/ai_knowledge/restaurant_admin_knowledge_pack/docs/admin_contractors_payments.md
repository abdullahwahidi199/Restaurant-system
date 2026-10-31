---
id: admin_contractors_payments
title: Contractors > Payments
module: contractors
namespace: admin
status: current_observed_behavior
summary: Service-payment history, including payments recorded initially with invoices. Amount is one transaction, not
  the invoice total or cumulative Paid. Payment Date is separate from invoice, c...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- contractor
- contractors
- dates
- disbursement
- payment
- payments
- settlement
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_386-391
tool_hints:
- records.list
- records.get
- ledger.get
metric_ids:
- contractors.payment_disbursements
---

### Contractors > Payments

- **Purpose / dates:** Service-payment history, including payments recorded initially with invoices. Amount is one transaction, not the invoice total or cumulative Paid. Payment Date is separate from invoice, contract and creation dates; ordering is payment date then entry time, newest first. Search matches provider name, stored invoice number, reference or notes; no on-page date-range selector. Date ranges, where used, apply inclusively to payment date.
- **Limits / effect:** A payment must be positive, no greater than the invoice's current Remaining, linked to the correct provider/invoice and within the active branch. Drafts cannot receive payments; inactive providers' recognized invoices can. Partial/full payments reduce current debt and update invoice status, without creating another service expense or changing inventory.
- **Interpretation:** Method/reference record the declared transaction, not a bank integration. Future-dated payments affect current balances immediately rather than waiting until that date; displayed balances are not historical snapshots. No general posted-payment refund, void or reversal screen is supplied.
