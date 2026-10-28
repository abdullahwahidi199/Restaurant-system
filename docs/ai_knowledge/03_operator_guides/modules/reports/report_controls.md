---
id: "operator_modules_reports_report_controls"
title: "Open operational reports and export records"
module: "reports"
description: "Select an operational report, apply a date range, and use supported export controls; covers scope and errors without analytics interpretation."
keywords: ["reports", "open", "operational", "export", "records", "Run", "date range", "PDF report"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_navigation_common_interface_controls", "operator_reference_interface_component_admin_reports_reportsmainpage", "operator_coverage_matrix", "operator_reference_interface_component_admin_reports_ordersreport", "operator_reference_interface_component_admin_reports_menuitemsalesreport"]
frontend_routes: ["/admin/dashboard/reports"]
source_references: ["frontend/src/component/Admin/Reports/ReportsMainPage.jsx", "frontend/src/component/Admin/Reports/menuItemReportUtils.js", "frontend/src/component/Admin/Reports/OrdersReport.jsx", "frontend/src/component/Admin/Reports/FinanceReport.jsx", "frontend/src/component/Admin/Reports/InventoryReport.jsx", "frontend/src/component/Admin/Reports/StaffReport.jsx", "frontend/src/component/Admin/Reports/MenuItemSalesReport.jsx", "backend/backend/reports/urls.py", "backend/backend/reports/views.py", "frontend/src/App.jsx"]
status: "source_verified"
---

# Open operational reports and export records

## Open reports and check scope

Admin/BranchAdmin **Finance → Reports**, `/admin/dashboard/reports`. This document covers report selection, date controls, export actions, permissions and failures only. Business analytics, metric definitions, formulas and interpretation are outside the task.

## Choose a report and apply dates

Choose a report tab: Orders, Finance, Inventory, Staff Performance, Menu Items (labels use REPORT_OPTIONS translation). Start/end date defaults today. Presets **Today**, **Last 7 days**, **Last 30 days**, **This month** populate input dates. Select the date bounds and activate the **Run** control to apply them; just typing or choosing a preset does not update `appliedRange`. Missing dates or start>end shows **Choose a valid date range.** and leaves previously applied report intact.

## Export the applied report

Each mounted report component has its own record filters, table controls, refresh/export/download actions. Read its interface reference for exact labels and conditions. A download uses report’s applied period and backend authorization, not necessarily the unsaved date inputs. PDF/export failures display component fallback or returned error; allow browser downloads and retry after verifying the applied period. Generating/exporting reports does not create or modify orders, stock, payroll or payments.

## Find other operational output controls

Other output controls are located in operational modules: menu CSV/PDF, inventory Full Inventory / Low Stock / Out of Stock PDF, daily production **Download PDF**, supplier voucher PDFs, expense vouchers and customer/kitchen/reservation printing. Their permissions and side effects differ; bill/ticket printing flags are documented separately.

## Role restrictions and unmounted analytics

Inventory report pages are mounted under the Admin/InventoryManager/OperationsManager prefixes. Backend report endpoints can grant different roles from those page wrappers. Do not promise FinanceManager has the general Reports route merely because it can use finance APIs. There is an imported but unmounted AnalyticsBaseModal; no additional Analytics page should be taught.

See [common interface controls](../../navigation/common_interface_controls.md), [component admin reports reportsmainpage](../../reference/interface/component_admin_reports_reportsmainpage.md), and [coverage matrix](../../coverage_matrix.md).

## Detailed controls, fields, and server rules

- [Reports Main Page — controls and fields](../../reference/interface/component_admin_reports_reportsmainpage.md)
- [Orders Report — controls and fields](../../reference/interface/component_admin_reports_ordersreport.md)
- [Menu Item Sales Report — controls and fields](../../reference/interface/component_admin_reports_menuitemsalesreport.md)
