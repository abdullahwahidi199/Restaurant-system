---
id: admin_operations_discount_requests
title: Operations > Discount Requests
module: operations
namespace: admin
status: current_observed_behavior
summary: Pending queue and all-request history for manual percentage discounts on orders. Counts are requests, not distinct
  orders; duplicate pending requests can exist. The Pending badge counts t...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- amount
- approvals
- discount
- manager
- manual
- operations
- pending
- preview
- requests
- threshold
related_docs:
- admin_dashboard_sales_meaning
- admin_administration_settings_discounts
routes: []
source_refs:
- uploaded_admin_reference:lines_123-132
tool_hints:
- records.list
- records.get
- analytics.aggregate
metric_ids: []
---

### Operations > Discount Requests

- **Purpose / scope:** Pending queue and all-request history for manual percentage discounts on orders. Counts are requests, not distinct orders; duplicate pending requests can exist. The Pending badge counts the loaded page only; pagination count covers all matching requests.
- **Dates / status:** Pending queue has no date filter and includes pending only. All Requests filters by request creation date, inclusively in Kabul time, not order or decision date; search/status filters narrow rows and pagination count. Pending has not applied a discount; Approved writes the requested order percentage; Rejected leaves the order charge unchanged. Reviewer/time fields also record rejections.
- **Original total:** Current sum of all order-line subtotals, including cancelled lines, plus any linked reservation's duration/rate total even if Free, plus delivery fee for a delivery order; rounded to two decimals. It is recalculated, not an immutable amount captured when requested.
- **Discount / Final total:** Discount is the requested percentage; Final = Original × (1 − percentage/100), rounded to two decimals. Their difference is a previewed reduction, not a recorded refund or expense. Historical request previews can change with order/reservation changes, including rejected requests.
- **Charge mismatch:** These previews can exceed actual order charges because ordinary order totals exclude cancelled lines and free reservation fees. Approval applies the percentage to the ordinary order total calculation; displayed Final is not guaranteed to equal the resulting charge. The intended reconciliation of these differing preview rules is unresolved.
- **Limits / replacement:** Requests must be above 0% and at most 100%. Restaurant manager/admin limits determine approval authority: within manager limit, Manager/Admin/BranchAdmin; above it through admin limit, Admin/BranchAdmin only. Above both configured limits neither approval nor rejection currently succeeds; the manager-limit check takes precedence if the limits are misordered. Approval replaces the order percentage rather than adding percentages; a later pending request can overwrite an existing discount.
- **Paid-order limitation:** A previously pending request can still be approved on a completed order, changing historical order/revenue totals without a refund or payment-metadata change. Delivered/cancelled orders block approval. Approval is therefore not evidence that a customer received a cash refund.
