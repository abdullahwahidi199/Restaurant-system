---
id: "operator_modules_discounts_requests"
title: "Request, approve, or reject a manual discount"
module: "discounts"
description: "Request a manual order discount, obtain approval within manager/admin limits, reject a request, or resubmit after rejection; distinguishes requests from immediate card discounts."
keywords: ["discounts", "request", "approve", "reject", "manual", "discount", "discount approval", "request discount", "reject discount", "approval limit"]
roles: ["Cashier", "Manager", "Admin", "BranchAdmin"]
related_docs: ["operator_troubleshooting_verification_register", "operator_modules_discounts_discount_cards", "operator_modules_billing_cashier", "operator_reference_interface_component_cashier_components_discountrequestmodal", "operator_reference_interface_component_manager_discountrequest_discountrequestmain", "operator_reference_interface_component_manager_discountrequest_discountrequestcard", "operator_reference_interface_component_admin_discounts_admindiscountsmain", "operator_reference_interface_component_admin_discounts_alldiscounts", "operator_reference_backend_orders_fields", "operator_reference_backend_orders_validation", "operator_reference_backend_orders_access"]
frontend_routes: ["/cashier", "/manager/discount-requests", "/admin/dashboard/pending-discount-requests", "/admin/dashboard/all-discount-requests"]
source_references: ["frontend/src/component/Cashier/components/DiscountRequestModal.jsx", "frontend/src/component/Manager/DiscountRequest/DiscountRequestMain.jsx", "frontend/src/component/Manager/DiscountRequest/DiscountRequestCard.jsx", "frontend/src/component/Admin/Discounts/AdminDiscountsMain.jsx", "frontend/src/component/Admin/Discounts/AllDiscounts.jsx", "backend/backend/orders/views.py:request_discount", "backend/backend/orders/views.py:approve_discount_or_reject", "backend/backend/orders/signals.py:discount_post_save", "backend/backend/orders/tests.py:OrderPaymentIntegrityTests.test_paid_order_allows_pending_discount_approval"]
status: "source_verified"
---

# Request, approve, or reject a manual discount

## Pages and access

Cashier: **Discount** on an active order card at `/cashier`. Manager: **Discount Requests**, `/manager/discount-requests`. Admin/BranchAdmin: **Operations → Discount Requests**, `/admin/dashboard/pending-discount-requests`; **All Discount Requests** at `/admin/dashboard/all-discount-requests` is a hidden/searchable navigation destination. Requests are scoped to current branch. Restaurant discount limits determine approval authority.

## Cashier request form

The modal defaults to **Discount Card**. Choose the manual/request tab to request approval. Enter **Discount Percentage** and **Reason**, inspect **Discount Amount** / **Final Total** preview, then **Submit Request**. **Cancel** closes without submitting. Submission disables during loading for the manual branch.

| Field | Required | Type/default | Frontend vs server |
|---|---|---|---|
| Discount Percentage | Yes | Number, empty | Frontend checks present and >0. Server requires >0 and ≤100 and no already applied discount. Preview is not an approval. |
| Reason | Frontend yes | Text area, empty | Frontend trims and requires it; backend request function defaults missing reason to empty and does not repeat the nonblank check. |
| Manager limit | Calculated/read-only | From order response | Above it, UI warns admin approval required; threshold does not cap requested input in the browser. |

Success creates a pending `DiscountRequest` linked to order/requesting staff; it leaves `discount_percent` unchanged. The card displays **Discount Request Pending**. The discount signal broadcasts after commit. The backend checks approved requests/already discounted orders but does not block every duplicate pending request. Do not double-submit; refresh if the response is uncertain.

## Approve/reject

1. Authorized manager/admin opens their pending queue and reviews order, percentage, reason, requester and preview totals.
2. Use **Approve** or **Reject** on the request card. The handler sends the chosen action. Pending-only controls disappear when processed.
3. At or below `manager_discount_limit`, Manager/Admin/BranchAdmin may decide. Above manager but at or below `admin_discount_limit`, only Admin/BranchAdmin. Above the admin limit, both actions currently fail **Discount exceeds allowed limit** because the authority check runs before action handling.
4. Approve sets approved status/approver/time and writes the percentage onto the order: **Approved and applied**. The cashier sees the reduced total after update/refresh. Reject sets rejected status and reviewer/time: **Rejected**; order amount is unchanged. Cashier can **Request Again** after rejection.

Same-action retries return **Already approved/rejected**; switching a previously processed request returns a conflict **Discount request already {status}**. No approve→reject/undo operation exists. Correct a pending request operationally by rejecting and making a new accurate request if allowed.

Finalize the discount before cash collection. Current code permits approval on `completed` orders, but blocks `delivered`/`cancelled`. That changes the total without creating a refund or changing paid metadata. See [verification register](../../troubleshooting/verification_register.md); do not present that exception as a supported refund procedure.

## Failures and recovery

**Please enter a valid discount percentage** → enter a positive percentage; server additionally caps at 100. **Reason is required** → explain why. **Discount already applied** / **Order already discounted** → inspect the applied card/request, do not stack another discount. **Only Manager/Admin can approve** / **Only Admin can approve** → use the authorized approver. Finalized/stale conflicts → refresh and hand the case to the responsible administrator.

Card application uses a different immediate path: [discount cards](discount_cards.md). Checkout next step: [cashier](../billing/cashier.md).

## Detailed controls, fields, and server rules

- [Discount Request Modal — controls and fields](../../reference/interface/component_cashier_components_discountrequestmodal.md)
- [Discount Request Main — controls and fields](../../reference/interface/component_manager_discountrequest_discountrequestmain.md)
- [Discount Request Card — controls and fields](../../reference/interface/component_manager_discountrequest_discountrequestcard.md)
- [Admin Discounts Main — controls and fields](../../reference/interface/component_admin_discounts_admindiscountsmain.md)
- [All Discounts — controls and fields](../../reference/interface/component_admin_discounts_alldiscounts.md)
- [Orders — backend fields reference](../../reference/backend/orders_fields.md)
- [Orders — backend validation reference](../../reference/backend/orders_validation.md)
- [Orders — backend access reference](../../reference/backend/orders_access.md)
