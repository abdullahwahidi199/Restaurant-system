---
id: "operator_navigation_sidebar_directory"
title: "Sidebar menu labels and exact destinations"
module: "navigation"
description: "Find source-declared sidebar labels, parent menu paths, destinations and hidden navigation entries without equating menu visibility with API permission."
keywords: ["navigation", "sidebar", "menu", "labels", "exact", "destinations", "menu path", "hidden navigation", "sidebar destination"]
roles: []
related_docs: ["operator_navigation_application_navigation", "operator_navigation_page_directory"]
frontend_routes: []
source_references: ["frontend/src/component/Admin/adminNavigation.jsx", "frontend/src/component/FinanceManager/financeManangerNavigation.jsx", "frontend/src/component/InventoryManager/InventoryManagerNavbar.jsx", "frontend/src/component/kitchen/KitchenRootLoyout.jsx", "frontend/src/component/Manager/ManagerNavbar.jsx", "frontend/src/component/OperationsManager/OperationsManagerNavigation.jsx"]
status: "source_verified"
---

# Sidebar menu labels and exact destinations

Exact static navigation declarations, including items hidden from sidebar but available to navigation search. Parent labels form the menu path. Dynamic entries preserve their source expression; their values require the runtime context. Route guards and backend policy still apply.

| Navigation source | Menu path | Destination | Conditional visibility |
|---|---|---|---|
| `component/Admin/adminNavigation.jsx` | Dashboard | `adminBase` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Operations → Orders | `/admin/dashboard/orders` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Operations → Tables | `/admin/dashboard/tables` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Operations → Reservations | `/admin/dashboard/reservations` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Operations → Daily Productions | `/admin/dashboard/daily_production` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Operations → Production Movements | `/admin/dashboard/daily-production-movements` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Operations → Discount Requests | `/admin/dashboard/pending-discount-requests` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Operations → All Discount Requests | `/admin/dashboard/all-discount-requests` | Hidden from sidebar; indexed in search |
| `component/Admin/adminNavigation.jsx` | Operations → Discount Cards | `/admin/dashboard/discount-cards` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Menu | `/admin/dashboard/menu` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Kitchen Stations | `/admin/dashboard/stations` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Inventory → Dashboard | `/admin/dashboard/inventory` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Inventory → Ingredients | `/admin/dashboard/inventory/ingredients` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Inventory → Stock Levels | `/admin/dashboard/inventory/stock-levels` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Inventory → Stock Movements | `/admin/dashboard/inventory/stock-movements` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Inventory → Stock Adjustments | `/admin/dashboard/inventory/stock-adjustments` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Inventory → Low Stock Alerts | `/admin/dashboard/inventory/low-stock` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Inventory → Reports | `/admin/dashboard/inventory/reports` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Procurement → Dashboard | `/admin/dashboard/procurement` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Procurement → Purchase Invoices | `/admin/dashboard/procurement/purchase-invoices` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Procurement → Create Purchase Invoice | `/admin/dashboard/procurement/purchase-invoices/new` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Procurement → Suppliers | `/admin/dashboard/procurement/suppliers` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Procurement → Supplier Payments | `/admin/dashboard/procurement/supplier-payments` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Procurement → Outstanding Payables | `/admin/dashboard/procurement/payables` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Restaurant → Audit Logs | `/admin/dashboard/audit-logs` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | HR → Staff | `/admin/dashboard/staff` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | HR → Attendance | `/admin/dashboard/attendance` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | HR → Shifts | `/admin/dashboard/shifts` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | HR → Payroll → Dashboard | `/admin/dashboard/payroll` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | HR → Payroll → Payroll Wizard | `/admin/dashboard/payroll/run` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | HR → Payroll → Payroll Records | `/admin/dashboard/payroll/records` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | HR → Payroll → Salary Advances | `/admin/dashboard/payroll/advances` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | HR → Payroll → Payroll Payments | `/admin/dashboard/payroll/payments` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Contractors → Dashboard | `/admin/dashboard/contractors` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Contractors → Contractors | `/admin/dashboard/contractors/contractors` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Contractors → Service Contracts | `/admin/dashboard/contractors/contracts` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Contractors → Service Invoices | `/admin/dashboard/contractors/invoices` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Contractors → Create Invoice | `/admin/dashboard/contractors/invoices/new` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Contractors → Payments | `/admin/dashboard/contractors/payments` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Contractors → Payables | `/admin/dashboard/contractors/payables` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Finance → Expenses | `/admin/dashboard/expenses` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Finance → Reports | `/admin/dashboard/reports` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Administration → "User activity" | `/admin/dashboard/activity` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Administration → Branches | `/admin/dashboard/branches` | Admin only; Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Administration → Feedbacks | `/admin/dashboard/feedbacks` | Parent role/layout conditions apply |
| `component/Admin/adminNavigation.jsx` | Administration → Settings | `/admin/dashboard/settings` | Hidden from sidebar; indexed in search |
| `component/FinanceManager/financeManangerNavigation.jsx` | Expenses → Expenses | `/finance-manager/expenses` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Procurement → Dashboard | `/finance-manager/procurement` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Procurement → Purchase Invoices | `/finance-manager/procurement/purchase-invoices` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Procurement → Create Purchase Invoice | `/finance-manager/procurement/purchase-invoices/new` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Procurement → Suppliers | `/finance-manager/procurement/suppliers` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Procurement → Supplier Payments | `/finance-manager/procurement/supplier-payments` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Procurement → Outstanding Payables | `/finance-manager/procurement/payables` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Payroll → Dashboard | `/finance-manager/payroll` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Payroll → Payroll Wizard | `/finance-manager/payroll/run` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Payroll → Payroll Records | `/finance-manager/payroll/records` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Payroll → Salary Advances | `/finance-manager/payroll/advances` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Payroll → Payroll Payments | `/finance-manager/payroll/payments` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Contractors → Dashboard | `/finance-manager/contractors` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Contractors → Contractors | `/finance-manager/contractors/contractors` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Contractors → Service Contracts | `/finance-manager/contractors/contracts` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Contractors → Service Invoices | `/finance-manager/contractors/invoices` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Contractors → Create Invoice | `/finance-manager/contractors/invoices/new` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Contractors → Payments | `/finance-manager/contractors/payments` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Contractors → Payables | `/finance-manager/contractors/payables` | Parent role/layout conditions apply |
| `component/FinanceManager/financeManangerNavigation.jsx` | Audit → Audit Logs | `/finance-manager/audit-logs` | Parent role/layout conditions apply |
| `component/InventoryManager/InventoryManagerNavbar.jsx` | Dashboard | `/inventory-manager` | Parent role/layout conditions apply |
| `component/InventoryManager/InventoryManagerNavbar.jsx` | Ingredients | `/inventory-manager/inventory/ingredients` | Parent role/layout conditions apply |
| `component/InventoryManager/InventoryManagerNavbar.jsx` | Stock Levels | `/inventory-manager/inventory/stock-levels` | Parent role/layout conditions apply |
| `component/InventoryManager/InventoryManagerNavbar.jsx` | Stock Movements | `/inventory-manager/inventory/stock-movements` | Parent role/layout conditions apply |
| `component/InventoryManager/InventoryManagerNavbar.jsx` | Stock Adjustments | `/inventory-manager/inventory/stock-adjustments` | Parent role/layout conditions apply |
| `component/InventoryManager/InventoryManagerNavbar.jsx` | Low Stock Alerts | `/inventory-manager/inventory/low-stock` | Parent role/layout conditions apply |
| `component/InventoryManager/InventoryManagerNavbar.jsx` | Inventory Reports | `/inventory-manager/inventory/reports` | Parent role/layout conditions apply |
| `component/InventoryManager/InventoryManagerNavbar.jsx` | Daily Production | `/inventory-manager/daily-production` | Parent role/layout conditions apply |
| `component/kitchen/KitchenRootLoyout.jsx` | Orders | `/kitchen` | Parent role/layout conditions apply |
| `component/kitchen/KitchenRootLoyout.jsx` | Ready | `/kitchen/ready-orders` | Parent role/layout conditions apply |
| `component/kitchen/KitchenRootLoyout.jsx` | Production | `/kitchen/daily-production` | Parent role/layout conditions apply |
| `component/kitchen/KitchenRootLoyout.jsx` | Stock | `/kitchen/stock` | Parent role/layout conditions apply |
| `component/kitchen/KitchenRootLoyout.jsx` | Menu | `/kitchen/menu` | Parent role/layout conditions apply |
| `component/Manager/ManagerNavbar.jsx` | Orders | `/manager` | Parent role/layout conditions apply |
| `component/Manager/ManagerNavbar.jsx` | Reservations | `/manager/reservations` | Parent role/layout conditions apply |
| `component/Manager/ManagerNavbar.jsx` | Tables | `/manager/tables` | Parent role/layout conditions apply |
| `component/Manager/ManagerNavbar.jsx` | Menu | `/manager/menu` | Parent role/layout conditions apply |
| `component/Manager/ManagerNavbar.jsx` | Discount requests | `/manager/discount-requests` | Parent role/layout conditions apply |
| `component/Manager/ManagerNavbar.jsx` | "User activity" | `/manager/activity` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Operations → t?.("nav.shifts") \|\| "Shifts" | `/operations-manager/shifts` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Operations → t?.("nav.attendance") \|\| "Attendance" | `/operations-manager/attendance` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Operations → t?.("nav.tables") \|\| "Tables" | `/operations-manager/tables` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Operations → t?.("nav.stations") \|\| "Stations" | `/operations-manager/stations` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Operations → t?.("nav.dailyProduction") \|\| "Daily Production" | `/operations-manager/daily_production` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Operations → t?.("production.movements", {               defaultValue: "Production Movements",             }) \|\| "Production Movements" | `/operations-manager/daily-production-movements` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Menu → t?.("nav.menu") \|\| "Menu Items" | `/operations-manager/menu` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Expenses → t?.("nav.expenses") \|\| "Expenses" | `/operations-manager/expenses` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Expenses → t?.("nav.expensesHistory") \|\| "Expense History" | `/operations-manager/expenses/history` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Procurement → Dashboard | `/operations-manager/procurement` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Procurement → Purchase Invoices | `/operations-manager/procurement/purchase-invoices` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Procurement → Create Purchase Invoice | `/operations-manager/procurement/purchase-invoices/new` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Procurement → Suppliers | `/operations-manager/procurement/suppliers` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Procurement → Supplier Payments | `/operations-manager/procurement/supplier-payments` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Procurement → Outstanding Payables | `/operations-manager/procurement/payables` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Audit → Audit Logs | `/operations-manager/audit-logs` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Inventory → Overview | `/operations-manager/inventory` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Inventory → Ingredients | `/operations-manager/inventory/ingredients` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Inventory → Stock Levels | `/operations-manager/inventory/stock-levels` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Inventory → Stock Movements | `/operations-manager/inventory/stock-movements` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Inventory → Stock Adjustments | `/operations-manager/inventory/stock-adjustments` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Inventory → Low Stock Alerts | `/operations-manager/inventory/low-stock` | Parent role/layout conditions apply |
| `component/OperationsManager/OperationsManagerNavigation.jsx` | Inventory → Inventory Reports | `/operations-manager/inventory/reports` | Parent role/layout conditions apply |
