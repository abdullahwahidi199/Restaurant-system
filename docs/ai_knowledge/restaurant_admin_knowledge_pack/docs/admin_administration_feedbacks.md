---
id: admin_administration_feedbacks
title: Administration > Feedbacks
module: administration
namespace: admin
status: current_observed_behavior
summary: Customer review cards for the selected branch, including rating, comment, review target and restaurant response.
  Loads all scoped review history without a 100-record limit; there are no p...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- administration
- complaints
- customer
- feedback
- feedbacks
- ratings
- response
- reviews
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_578-587
tool_hints:
- records.list
- configuration.get
metric_ids: []
---

### Administration > Feedbacks

- **Purpose / scope:** Customer review cards for the selected branch, including rating, comment, review target and restaurant response. Loads all scoped review history without a 100-record limit; there are no page-level total/average-rating cards, trend charts or pagination controls. The Dashboard's Rating has its separate all-time definition; these filters do not change that dashboard figure.
- **Rating / customer:** Each review has a 1–5 rating; filled stars and the number repeat that one rating, not an average or satisfaction percentage. Customer label uses the linked account username rather than a verified personal name; it can be missing for a customer without a linked account. A blank comment does not invalidate a rating.
- **Menu Item / Delivery / General:** Menu Item identifies the linked dish; Delivery identifies a linked order; General has neither target. If both links exist, the card displays Menu Item first. There is no direct platter-review target. These labels do not independently verify a completed purchase, successful delivery or one review per customer/order; duplicate submissions can affect review-based averages.
- **All / Responded / Not Responded:** Determined by whether response text exists, not rating, response date, complaint severity or resolution. Responded means a reply is recorded, not that the customer accepted it or the issue was resolved. Existing replies have no on-page edit/delete controls; a reply does not create a refund, discount or order-status change.
- **Date filter limitation:** Applies only when both dates exist; a lone From or To has no effect. Filters review creation time, not response time. Bounds are exact UTC midnights, not complete inclusive Kabul days: most reviews on the selected end date are excluded, and early-Kabul reviews on the start date can also be excluded. Equal From/To matches only the exact midnight instant. No default date restriction or guaranteed newest-first ordering is supplied.
- **Review Date / Responded On:** Display calendar dates in the device's timezone. Responded On can use a browser-supplied timestamp rather than strictly server-confirmed receipt time; it is not a reliable response-time/SLA measure. Filtering creation dates does not identify replies made during that period.
- **Interpretation / empty state:** Reviews are customer-reported opinions, not a representative survey of all guests, revenue or employee performance. No Reviews Found can mean no filter matches or a loading failure, not necessarily no feedback exists. The date-boundary and response-time rules above describe current behavior; the intended business policy is unverified.
