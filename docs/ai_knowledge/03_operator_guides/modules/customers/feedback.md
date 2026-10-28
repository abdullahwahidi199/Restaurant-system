---
id: "operator_modules_customers_feedback"
title: "Review customer feedback and respond"
module: "customers"
description: "Find customer feedback, filter answered or unanswered reviews, and submit a response; customer administration and review edit/delete are not mounted workflows."
keywords: ["customers", "review", "customer", "feedback", "respond", "customer review", "unanswered feedback", "review response"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_reference_backend_menu_access", "operator_reference_backend_menu_validation", "operator_modules_public_ordering_customer_handoff", "operator_reference_interface_component_admin_feedbacks_feedbackbase", "operator_reference_interface_component_admin_feedbacks_feedbacksdisplaymodel", "operator_reference_backend_customers_fields", "operator_reference_backend_customers_validation", "operator_reference_backend_customers_access"]
frontend_routes: ["/admin/dashboard/feedbacks"]
source_references: ["frontend/src/component/Admin/Feedbacks/FeedbackBase.jsx", "frontend/src/component/Admin/Feedbacks/FeedbacksDisplayModel.jsx", "frontend/src/component/Admin/Customers/CustomersBaseModal.jsx", "backend/backend/menu/views.py", "backend/backend/menu/serializers.py:ReveiwSerializer", "frontend/src/App.jsx"]
status: "source_verified"
---

# Review customer feedback and respond

## Open feedback and filter reviews

Admin/BranchAdmin **Administration → Feedbacks**, `/admin/dashboard/feedbacks`. The page fetches `/menu/reviews/` then filters loaded reviews client-side. **All**, **Responded**, **Not Responded** filters use presence of response; start/end date filter only runs when both dates exist. It compares JavaScript dates to exact date bounds; the end-day midnight comparison can omit later times on that day. Clearing dates or checking a wider interval can help locate an apparently missing review.

## Respond to an unanswered review

Review display shows customer/menu item, rating/comment, response and dates according to `FeedbacksDisplayModel`. For a review without a response, **Response** opens the text area; **Submit** sends and **Cancel** closes local entry. Existing responses are displayed without a mounted edit/delete action. Enter nonblank response text and activate **Submit**; this updates stored review response and refreshes reviews. It does not send an email/SMS unless a separate implementation explicitly does so. There is no review-delete confirmation/action in this mounted component. Do not treat feedback response as a customer refund or order status update.

## Loading errors and permissions

Permissions and restaurant scoping depend on the menu review views; see [menu access](../../reference/backend/menu_access.md) and [menu validation](../../reference/backend/menu_validation.md). Loading failure currently logs an error; an empty display is not a definitive “no reviews” statement. Reload/verify scope before claiming none exist.

## Customer-management availability

The repository contains `CustomersBaseModal`, customer table and filter components, plus customer APIs. No customer-management page is mounted by App.jsx. Those are retained as unmounted references, not an invented Administration → Customers menu. Customer account/profile/order history are public customer flows: [customer handoff](../public_ordering/customer_handoff.md).

## Detailed controls, fields, and server rules

- [Feedback Base — controls and fields](../../reference/interface/component_admin_feedbacks_feedbackbase.md)
- [Feedbacks Display Model — controls and fields](../../reference/interface/component_admin_feedbacks_feedbacksdisplaymodel.md)
- [Customers — backend fields reference](../../reference/backend/customers_fields.md)
- [Customers — backend validation reference](../../reference/backend/customers_validation.md)
- [Customers — backend access reference](../../reference/backend/customers_access.md)
