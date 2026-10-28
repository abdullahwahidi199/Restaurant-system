---
id: "operator_modules_dashboard_dashboard"
title: "Dashboard and operational notifications"
module: "dashboard"
description: "Open the administrator dashboard, locate operational notifications, and mark a notification as read; excludes analytics definitions and business metrics."
keywords: ["dashboard", "operational", "notifications", "mark as read", "recent activity", "notification"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_navigation_common_interface_controls", "operator_modules_orders_order_lists", "operator_reference_interface_component_admin_dashboard_dashboardbase", "operator_reference_interface_component_admin_dashboard_notifications", "operator_reference_interface_component_admin_admintopheader"]
frontend_routes: ["/admin/dashboard"]
source_references: ["frontend/src/component/Admin/dashboard/DashboardBase.jsx", "frontend/src/component/Admin/dashboard/Notifications.jsx", "frontend/src/component/Admin/AdminTopHeader.jsx", "backend/backend/reports/views.py", "backend/backend/orders/signals.py"]
status: "source_verified"
---

# Dashboard and operational notifications

## Open the dashboard

**Open:** Admin/BranchAdmin home, `/admin/dashboard`; **Dashboard** in the sidebar. An active restaurant and branch context are required. This guide covers navigation and notifications only; analytics and metric definitions are deliberately outside this knowledge base.

## Displayed information and navigation

The dashboard displays overview panels and a notification area. Date/range controls change the requested overview period. Opening a sidebar/quick link navigates to the corresponding implemented module; it does not create an order or payment. Use the Orders, Reservations, Stock, Production, and Finance guides for operational records.

## Read an operational notification

Notifications are loaded for the staff restaurant/branch. Order creation schedules an order notification after commit. Select the check icon titled **Mark read** beside an entry. This posts the read request; on success the backend sets `is_read=true` and the entry disappears from the local list. It does not change the referenced order. The component defaults to four visible entries from the latest unread notifications returned by the API; there is no separate delete/dismiss workflow or unread/undo control here. On failure the entry remains visible without a dedicated error message. An empty panel can mean no matching notifications or a loading/API problem; confirm the current branch and reload before assuming a record was never created.

## Header controls and next steps

The header includes branch context, navigation search, language/theme controls, settings entry, and logout where rendered by the layout. All dashboard controls and their conditions are enumerated in the linked component references in the index. [common interface controls](../../navigation/common_interface_controls.md) explains shared interactions; [order lists](../orders/order_lists.md) explains the operational order list.

## Detailed controls, fields, and server rules

- [Dashboard Base — controls and fields](../../reference/interface/component_admin_dashboard_dashboardbase.md)
- [Notifications — controls and fields](../../reference/interface/component_admin_dashboard_notifications.md)
- [Admin Top Header — controls and fields](../../reference/interface/component_admin_admintopheader.md)
