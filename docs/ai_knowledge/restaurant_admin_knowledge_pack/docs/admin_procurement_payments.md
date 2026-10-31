---
id: admin_procurement_payments
title: Procurement > Payments
module: procurement
namespace: admin
status: current_observed_behavior
summary: Recorded supplier disbursements against individual non-draft invoices. Amount is that payment, not invoice total
  or cumulative Paid; Date is the recorded payment date, separate from recor...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- disbursement
- installment
- payment
- payments
- procurement
- supplier
- transaction
- voucher
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_248-254
tool_hints:
- records.list
- records.get
- ledger.get
metric_ids: []
---

### Procurement > Payments

- **Purpose / Amount / Date:** Recorded supplier disbursements against individual non-draft invoices. Amount is that payment, not invoice total or cumulative Paid; Date is the recorded payment date, separate from record creation and purchase dates. Method/reference identify the recorded transaction and do not verify an external transfer. List includes all search matches but has no date-range control.
- **Payment limits / effect:** A positive payment cannot exceed the invoice's current Remaining and reduces that balance; supplier/invoice/branch must match. Draft invoices cannot receive payments. This does not reduce stock or add another purchase/expense, and there is no general payment-refund/reversal screen.
- **Voucher figures:** Paid Before sums this invoice's earlier payments in payment-date, creation-time, then record order; Current payment is this record; voucher Total Paid adds the two; Remaining = max(current invoice total − that cumulative amount, 0). It excludes later payments, unlike the invoice's current balance. Voucher Status is the invoice's current status; its Paid mark uses the reconstructed Remaining.
- **Historical limitation:** Voucher balances are recalculated from current invoice charges and the currently dated payment history, not immutable snapshots. Purchase corrections/backdated payments can change old voucher balances. Reprinting/downloading is not another payment; supplierless invoice-paid amounts do not produce these supplier vouchers.
