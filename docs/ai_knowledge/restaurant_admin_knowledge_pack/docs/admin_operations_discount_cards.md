---
id: admin_operations_discount_cards
title: Operations > Discount Cards
module: operations
namespace: admin
status: current_observed_behavior
summary: Reusable percentage-discount entitlements for named customers in the branch, with validity dates and application
  limits. List and usage history have no period filter.
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- card
- cards
- customer
- discount
- eligibility
- entitlements
- expiry
- operations
- phone
- redemption
- usage
- validity
related_docs:
- admin_dashboard_sales_meaning
- admin_operations_discount_requests
routes: []
source_refs:
- uploaded_admin_reference:lines_133-142
tool_hints:
- records.list
- records.get
- analytics.aggregate
metric_ids: []
---

### Operations > Discount Cards

- **Purpose / period:** Reusable percentage-discount entitlements for named customers in the branch, with validity dates and application limits. List and usage history have no period filter.
- **Total cards / Active:** Total is the current card count; Active counts stored active status only. It does not test expiry, start date, usage exhaustion or order minimum, so Active is not a count of cards currently usable.
- **Discount / Total discount:** Card percentage, including the detail sidebar labelled Total discount; not accumulated AFN savings. Successful application writes this percentage to the order's shared charge calculation immediately, without a manual approval request.
- **Usage / Usage stats:** Successful applications so far versus the usage limit; blank limit means unlimited. The count increments at application, before collection/completion, and cancellation does not return a use. It is not a paid-order count or a selected-period measure. A zero limit is displayed as unlimited but actually permits no uses.
- **Validity / eligibility:** Application requires active status, exact registered phone match, same restaurant/branch, unexhausted limit and an order total at least the minimum. The minimum compares the current full order total before application, including applicable extra charges. Expiry is checked against UTC Today and permits the expiry date itself; the displayed Valid from date is currently not enforced.
- **Order restrictions / history:** Completed/delivered/cancelled orders and orders already carrying a positive discount reject card application. Orders used lists currently linked orders of every status by order creation date, with their current discounted totals and order percentages; it is not an application-time or collections ledger and may differ from Used count after record/link changes.
- **Historical effect:** Editing a card changes future eligibility/discounts, not percentages already copied to orders. Removing a card does not remove those order percentages. No automatic card-use reversal or refund is established.
