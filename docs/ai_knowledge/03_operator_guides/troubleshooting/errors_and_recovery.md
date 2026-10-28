---
id: "operator_troubleshooting_errors_and_recovery"
title: "Validation errors and safe operational recovery"
module: "troubleshooting"
description: "Match validation, permission, stock, reservation, discount and payment failures to safe next steps; inspect saved records before retrying uncertain writes."
keywords: ["troubleshooting", "validation", "errors", "safe", "operational", "recovery", "validation error", "permission denied", "stock shortage", "payment retry"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_coverage_matrix", "operator_troubleshooting_verification_register"]
frontend_routes: []
source_references: ["frontend/src/api/ReauireAuth.jsx", "frontend/src/api/RequireActiveRestaurant.jsx", "frontend/src/component/kitchen/orderStatusError.js", "backend/backend/orders/views.py", "backend/backend/orders/seriailizers.py", "backend/backend/inventory/services.py", "backend/backend/users/payroll_services.py", "backend/backend/restaurants/branching.py"]
status: "source_verified"
---

# Validation errors and safe operational recovery

## Diagnose before retrying

Confirm restaurant/active branch, role, exact record number/status, action and displayed message. Refresh the relevant list/detail after an ambiguous response. Never assume a timeout means no record was created. Do not bypass a hidden action or manually change database rows. Preserve only nonsecret identifiers when reporting a technical failure.

| Cause | Observable message/behavior grounded in code | Operator resolution |
|---|---|---|
| No/expired/wrong-role staff session | Route redirects to staff login; API can return auth/permission failure | Sign in with own authorized account; administrator checks role/branch. A customer session is not staff authorization. |
| Inactive/expired restaurant or failed restaurant lookup | Redirect `/subscription-inactive`; wrapper also does this for request failure | Administrator checks restaurant, subscription and connectivity. Do not assume expiry solely from redirect. |
| Demo mutation restriction | **Action restricted in demo mode.** or frontend restricted action message | Use intended training flow; real change requires authorized nondemo environment/account. |
| Required browser input missing | Native browser validation / no handler request | Fill required visible input. Browser message varies; no fixed text promised. |
| Frontend custom validation | Toast/field/banner with exact form message | Correct flagged value; source field reference distinguishes custom/backend rules. |
| Duplicate ingredient | **An ingredient with this name already exists for this branch.** | Locate existing ingredient; use correct record instead of duplicate spelling. |
| Wrong branch | **This table belongs to another branch.**, **This shift belongs to another branch.**, **You do not have access to this branch.** | Return to intended assigned branch; choose a record from its allowed dropdown. |
| Occupied order table | **Table ... already has an active order (#...).** / **Target table is occupied** | Refresh table; use existing order or choose a genuinely free permitted table. |
| Reservation conflict | **⚠ Time conflict! ... Please choose a different time slot.** | Choose another valid time/table; review booking before cancellation. |
| Reservation time/capacity | **Cannot create a reservation in the past.**, **Duration must be at least 30 minutes.**, capacity error | Correct start/duration/guests/table. |
| Stock/production shortage at kitchen | Dari error panel; structured `insufficient_stock` / `insufficient_production`, with quantities/item where supplied | Inventory operator verifies actual quantities/recipes/production, records real replenishment/correction, then kitchen refreshes/retries. Status transaction rolled back. |
| Pending-only item cancellation | **Only pending items can be cancelled** | Refresh status; cannot cancel already approved/ready line through that action. |
| Cancelled item edit | **Cancelled items cannot be changed** | No restore action; add a new authorized line if appropriate before order finalization. |
| Finalized order mutation | Terminal conflict from finalized_order_response/model | Inspect final status/paid record; ordinary reopen/edit/reassign/cancel not supported. |
| Delivery disabled/minimum/radius | **Delivery is not available for this branch.**, **Minimum order is ... for delivery orders.**, distance error | Use actual supported branch/service/cart; authorized settings correction only if configuration genuinely wrong. |
| Discount authority | **Only Manager/Admin can approve**, **Only Admin can approve**, **Discount exceeds allowed limit** | Correct authorized decision-maker; request outside admin cap cannot be processed by ordinary approval/reject path. |
| Already discounted/card mismatch | **Order already discounted**, **Phone number does not match**, **Card expired**, **Usage limit reached** | Inspect actual order/card, exact phone and limits; do not stack another discount or fabricate eligibility. |
| Payment on draft | **Draft invoices cannot receive payments.**, **Draft payroll cannot receive payments.** | Authorized approval first, then actual payment. |
| Payment zero/overbalance | **Payment amount must be greater than zero.**, **Payment amount cannot exceed the remaining balance.** | Refresh record, enter actual permitted remaining/partial amount; do not mark customer partial payment as completed. |
| No payroll staff | **No active payroll employees found for this branch.** | Check branch assignment, Active status and Payroll Active; create no duplicate staff. |
| Main/sole staff branch deactivation | **Main branch must remain active.** / only active branch validation | Keep valid main/assignments; make legitimate setup correction with Admin. |
| Ineligible activity viewer | Permission response / **Activity data could not be loaded.** | Manager needs explicit monitor permission; branch viewers remain scoped. |
| Missing popup/download | No print window/file, browser block | Allow intended popup/download, check browser destination; verify stored printed/assignment flags before retry. |

## Technical failures versus expected validation

Expected validation has a field, domain message or explicit status conflict. Unexpected failures include uncaught decimal conversion, stale/missing record paths, unsupported storage, channel/cache outage and server/network failure. Some handlers only console.log errors; some ERP hooks replace structured error objects with generic fallback. Do not invent a detailed cause from a generic toast.

For uncertain **create**, locate record by number/time/branch before retrying. For **payment**, inspect payment history and amount paid first. For **transfer**, inspect both balances/movements because approval is not fully transactional. For **item/recipe create**, inspect whether the base item exists after a later recipe request failed. For **attachments/WhatsApp**, invoice/assignment can succeed before later external action fails.

Realtime delivery failure need not roll back committed order/table updates; reload over HTTP. Cache/presence outage is not evidence that staff stopped working. A read-only audit/history view cannot repair a record. If no supported correction exists, retain record IDs and escalate to authorized system maintainer rather than inventing an undo/API/database workflow.

Use [index](../reference/backend/index.md) for every inspected explicit server message/condition, [coverage matrix](../coverage_matrix.md) for each control/form and [verification register](verification_register.md) for known mismatches.
