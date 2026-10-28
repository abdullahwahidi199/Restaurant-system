---
id: "operator_navigation_page_directory"
title: "Complete frontend page and route directory"
module: "navigation"
description: "Find every declared React route, page component, route-role guard and corresponding operating guide, including aliases and public route groups."
keywords: ["navigation", "complete", "frontend", "page", "route", "directory", "frontend route", "page location", "route alias"]
roles: []
related_docs: ["operator_navigation_application_navigation"]
frontend_routes: []
source_references: ["frontend/src/App.jsx", "frontend/src/config/staffRoutes.js", "frontend/src/api/ReauireAuth.jsx"]
status: "source_verified"
---

# Complete frontend page and route directory

Every route declaration in `App.jsx` is accounted for below. Child routes inherit the parent guard. `:id`, `:slug`, `:restaurantSlug`, and `:branchSlug` are runtime record parameters. Index routes share the parent URL. A route without an element is a route group. Sidebar labels and exact menu hierarchies are in the navigation guide; a route alone does not establish a sidebar link.

| Route | Page / component | Route access | Operating guide / control reference |
|---|---|---|---|
| `/` | &lt;AppDomainGuard&gt; &lt;RootLayout /&gt; &lt;/AppDomainGuard&gt; | Public/customer | [common interface controls](common_interface_controls.md) |
| `/` (index) | SystemLanding | Public/customer | [common interface controls](common_interface_controls.md) |
| `/landing` | SystemLanding | Public/customer | [common interface controls](common_interface_controls.md) |
| `/about` | PremiumAboutPage | Public/customer | [common interface controls](common_interface_controls.md) |
| `/founder` | PremiumFounderPage | Public/customer | [common interface controls](common_interface_controls.md) |
| `/privacy` | PremiumLegalPage | Public/customer | [common interface controls](common_interface_controls.md) |
| `/terms` | PremiumLegalPage | Public/customer | [common interface controls](common_interface_controls.md) |
| `/:restaurantSlug/:branchSlug` | Route group | Public/customer | [common interface controls](common_interface_controls.md) |
| `/:restaurantSlug/:branchSlug` (index) | HomePage | Public/customer | [customer handoff](../modules/public_ordering/customer_handoff.md); [page controls](../reference/interface/component_customer_homepage.md) |
| `/:restaurantSlug/:branchSlug/menu/item/:id` | OnlineMenuDetails | Public/customer | [customer handoff](../modules/public_ordering/customer_handoff.md); [page controls](../reference/interface/component_customer_onlinemenudetails.md) |
| `/:restaurantSlug/:branchSlug/menu/platter/:id` | OnlinePlatterDetails | Public/customer | [customer handoff](../modules/public_ordering/customer_handoff.md); [page controls](../reference/interface/component_customer_onlineplatterdetails.md) |
| `/:slug` | Route group | Public/customer | [common interface controls](common_interface_controls.md) |
| `/:slug` (index) | HomePage | Public/customer | [customer handoff](../modules/public_ordering/customer_handoff.md); [page controls](../reference/interface/component_customer_homepage.md) |
| `/:slug/info` | InfoPage | Public/customer | [customer handoff](../modules/public_ordering/customer_handoff.md); [page controls](../reference/interface/component_customer_infopage.md) |
| `/:slug/menu/item/:id` | OnlineMenuDetails | Public/customer | [customer handoff](../modules/public_ordering/customer_handoff.md); [page controls](../reference/interface/component_customer_onlinemenudetails.md) |
| `/:slug/menu/platter/:id` | OnlinePlatterDetails | Public/customer | [customer handoff](../modules/public_ordering/customer_handoff.md); [page controls](../reference/interface/component_customer_onlineplatterdetails.md) |
| `/signup` | CustomerSignupModal | Public/customer | [customer handoff](../modules/public_ordering/customer_handoff.md); [page controls](../reference/interface/component_customer_customersignupmodal.md) |
| `/login` | DomainAwareLogin | Public/customer | [common interface controls](common_interface_controls.md) |
| `/profile` | CustomerProfile | Public/customer | [customer handoff](../modules/public_ordering/customer_handoff.md) |
| `/orders` | Orders | Public/customer | [customer handoff](../modules/public_ordering/customer_handoff.md); [page controls](../reference/interface/component_customer_orders.md) |
| `/staff-login` | StaffLogin | Public/customer | [common interface controls](common_interface_controls.md); [page controls](../reference/interface/component_stafflogin.md) |
| `/select-branch` | BranchSelectionPage | Authenticated staff | [application navigation](application_navigation.md); [page controls](../reference/interface/component_branch_branchselectionpage.md) |
| `/super-admin` | SuperAdminMain | SuperAdmin | [platform](../modules/administration/platform.md); [page controls](../reference/interface/superadmin_superadminmain.md) |
| `/admin/dashboard` | adminDashboard | Admin, BranchAdmin | [common interface controls](common_interface_controls.md); [page controls](../reference/interface/component_admin_admindashboard.md) |
| `/admin/dashboard` (index) | DashboardBase | Admin, BranchAdmin | [dashboard](../modules/dashboard/dashboard.md); [page controls](../reference/interface/component_admin_dashboard_dashboardbase.md) |
| `/admin/dashboard/attendance` | attendance | Admin, BranchAdmin | [attendance shifts](../modules/employees/attendance_shifts.md); [page controls](../reference/interface/component_admin_attendance.md) |
| `/admin/dashboard/staff` | StaffManagement | Admin, BranchAdmin | [staff](../modules/employees/staff.md); [page controls](../reference/interface/component_admin_staff_staffmanagement.md) |
| `/admin/dashboard/branches` | BranchManagement | Admin | [branches](../modules/branches/branches.md); [page controls](../reference/interface/component_admin_branches_branchmanagement.md) |
| `/admin/dashboard/shifts` | shifts | Admin, BranchAdmin | [attendance shifts](../modules/employees/attendance_shifts.md); [page controls](../reference/interface/component_admin_shift_shifts.md) |
| `/admin/dashboard/menu` | MenuBaseModal | Admin, BranchAdmin | [menu](../modules/menu/menu.md) |
| `/admin/dashboard/stations` | StationsManagement | Admin, BranchAdmin | [stations](../modules/menu/stations.md); [page controls](../reference/interface/component_admin_stations_stationsmanagement.md) |
| `/admin/dashboard/menu/item/:id` | IndividualItem | Admin, BranchAdmin | [menu](../modules/menu/menu.md); [page controls](../reference/interface/component_admin_menumanagement_individualitem.md) |
| `/admin/dashboard/platters` | Platters | Admin, BranchAdmin | [menu](../modules/menu/menu.md) |
| `/admin/dashboard/menu/platter/:id` | PlatterDetails | Admin, BranchAdmin | [menu](../modules/menu/menu.md); [page controls](../reference/interface/component_admin_menumanagement_platterdetails.md) |
| `/admin/dashboard/daily_production` | DailyProduction | Admin, BranchAdmin | [daily production](../modules/production/daily_production.md); [page controls](../reference/interface/component_admin_dailyproduction_dailyproduction.md) |
| `/admin/dashboard/daily-production-movements` | ProductionMovementPage | Admin, BranchAdmin | [audit activity](../modules/audit/audit_activity.md); [page controls](../reference/interface/modules_audit_productionmovementpage.md) |
| `/admin/dashboard/orders` | OrderBase | Admin, BranchAdmin | [order lists](../modules/orders/order_lists.md); [page controls](../reference/interface/component_admin_order_orderbase.md) |
| `/admin/dashboard/tables` | TableBase | Admin, BranchAdmin | [table setup](../modules/tables/table_setup.md); [page controls](../reference/interface/component_admin_tables_tablebase.md) |
| `/admin/dashboard/expenses` | ExpensesMain | Admin, BranchAdmin | [expenses](../modules/expenses/expenses.md); [page controls](../reference/interface/component_admin_expenses_expensesmain.md) |
| `/admin/dashboard/expenses/history` | ExpensesHistory | Admin, BranchAdmin | [expenses](../modules/expenses/expenses.md); [page controls](../reference/interface/component_admin_expenses_expenseshistory.md) |
| `/admin/dashboard/expenses/:id` | IndividualExpense | Admin, BranchAdmin | [expenses](../modules/expenses/expenses.md); [page controls](../reference/interface/component_admin_expenses_individualexpense.md) |
| `/admin/dashboard/payroll` | PayrollWorkspace | Admin, BranchAdmin | [payroll](../modules/payroll/payroll.md); [page controls](../reference/interface/component_admin_payrollworkspace.md) |
| `/admin/dashboard/payroll/run` | PayrollWorkspace | Admin, BranchAdmin | [payroll](../modules/payroll/payroll.md); [page controls](../reference/interface/component_admin_payrollworkspace.md) |
| `/admin/dashboard/payroll/records` | PayrollWorkspace | Admin, BranchAdmin | [payroll](../modules/payroll/payroll.md); [page controls](../reference/interface/component_admin_payrollworkspace.md) |
| `/admin/dashboard/payroll/records/:id` | PayrollWorkspace | Admin, BranchAdmin | [payroll](../modules/payroll/payroll.md); [page controls](../reference/interface/component_admin_payrollworkspace.md) |
| `/admin/dashboard/payroll/advances` | PayrollWorkspace | Admin, BranchAdmin | [payroll](../modules/payroll/payroll.md); [page controls](../reference/interface/component_admin_payrollworkspace.md) |
| `/admin/dashboard/payroll/payments` | PayrollWorkspace | Admin, BranchAdmin | [payroll](../modules/payroll/payroll.md); [page controls](../reference/interface/component_admin_payrollworkspace.md) |
| `/admin/dashboard/payroll/employees/:id` | PayrollWorkspace | Admin, BranchAdmin | [payroll](../modules/payroll/payroll.md); [page controls](../reference/interface/component_admin_payrollworkspace.md) |
| `/admin/dashboard/contractors` | ContractorWorkspace | Admin, BranchAdmin | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/admin/dashboard/contractors/invoices` | ContractorWorkspace | Admin, BranchAdmin | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/admin/dashboard/contractors/invoices/new` | ContractorWorkspace | Admin, BranchAdmin | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/admin/dashboard/contractors/invoices/:id` | ContractorWorkspace | Admin, BranchAdmin | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/admin/dashboard/contractors/contractors` | ContractorWorkspace | Admin, BranchAdmin | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/admin/dashboard/contractors/contractors/:id` | ContractorWorkspace | Admin, BranchAdmin | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/admin/dashboard/contractors/contracts` | ContractorWorkspace | Admin, BranchAdmin | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/admin/dashboard/contractors/payments` | ContractorWorkspace | Admin, BranchAdmin | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/admin/dashboard/contractors/payables` | ContractorWorkspace | Admin, BranchAdmin | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/admin/dashboard/pending-discount-requests` | AdminDiscountsMain | Admin, BranchAdmin | [requests](../modules/discounts/requests.md); [page controls](../reference/interface/component_admin_discounts_admindiscountsmain.md) |
| `/admin/dashboard/all-discount-requests` | AllDiscounts | Admin, BranchAdmin | [requests](../modules/discounts/requests.md); [page controls](../reference/interface/component_admin_discounts_alldiscounts.md) |
| `/admin/dashboard/discount-cards` | DiscountCardsMain | Admin, BranchAdmin | [discount cards](../modules/discounts/discount_cards.md); [page controls](../reference/interface/component_admin_discountcards_discountcardsmain.md) |
| `/admin/dashboard/discount-cards/:id` | DiscountCardDetails | Admin, BranchAdmin | [discount cards](../modules/discounts/discount_cards.md); [page controls](../reference/interface/component_admin_discountcards_discountcarddetails.md) |
| `/admin/dashboard/discount-cards/:id/edit` | DiscountCardEdit | Admin, BranchAdmin | [discount cards](../modules/discounts/discount_cards.md); [page controls](../reference/interface/component_admin_discountcards_discountcardedit.md) |
| `/admin/dashboard/create-discount-cards` | CreateDiscountCard | Admin, BranchAdmin | [discount cards](../modules/discounts/discount_cards.md); [page controls](../reference/interface/component_admin_discountcards_creatediscountcard.md) |
| `/admin/dashboard/reports` | ReportsMainPage | Admin, BranchAdmin | [report controls](../modules/reports/report_controls.md); [page controls](../reference/interface/component_admin_reports_reportsmainpage.md) |
| `/admin/dashboard/audit-logs` | AuditLogPage | Admin, BranchAdmin | [audit activity](../modules/audit/audit_activity.md); [page controls](../reference/interface/modules_audit_auditlogpage.md) |
| `/admin/dashboard/activity` | ActivityDashboard | Admin, BranchAdmin | [audit activity](../modules/audit/audit_activity.md); [page controls](../reference/interface/modules_activity_activitydashboard.md) |
| `/admin/dashboard/reservations` | ReservationsMainPage | Admin, BranchAdmin | [reservations](../modules/reservations/reservations.md); [page controls](../reference/interface/component_admin_reservations_reservationsmainpage.md) |
| `/admin/dashboard/procurement` | ProcurementWorkspace | Admin, BranchAdmin | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/admin/dashboard/procurement/purchase-invoices` | ProcurementWorkspace | Admin, BranchAdmin | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/admin/dashboard/procurement/purchase-invoices/new` | ProcurementWorkspace | Admin, BranchAdmin | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/admin/dashboard/procurement/purchase-invoices/:id` | ProcurementWorkspace | Admin, BranchAdmin | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/admin/dashboard/procurement/suppliers` | ProcurementWorkspace | Admin, BranchAdmin | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/admin/dashboard/procurement/suppliers/:id` | ProcurementWorkspace | Admin, BranchAdmin | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/admin/dashboard/procurement/supplier-payments` | ProcurementWorkspace | Admin, BranchAdmin | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/admin/dashboard/procurement/payables` | ProcurementWorkspace | Admin, BranchAdmin | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/admin/dashboard/inventory` | InventoryPages | Admin, BranchAdmin | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/admin/dashboard/inventory/ingredients` | InventoryPages | Admin, BranchAdmin | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/admin/dashboard/inventory/stock-levels` | InventoryPages | Admin, BranchAdmin | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/admin/dashboard/inventory/stock-movements` | InventoryPages | Admin, BranchAdmin | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/admin/dashboard/inventory/stock-adjustments` | InventoryPages | Admin, BranchAdmin | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/admin/dashboard/inventory/low-stock` | InventoryPages | Admin, BranchAdmin | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/admin/dashboard/inventory/reports` | InventoryPages | Admin, BranchAdmin | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/admin/dashboard/feedbacks` | FeedbackBase | Admin, BranchAdmin | [feedback](../modules/customers/feedback.md); [page controls](../reference/interface/component_admin_feedbacks_feedbackbase.md) |
| `/admin/dashboard/settings` | SettingsBaseModal | Admin, BranchAdmin | [restaurant branch settings](../modules/settings/restaurant_branch_settings.md) |
| `/admin/dashboard/settings/:sectionId` | SettingsBaseModal | Admin, BranchAdmin | [restaurant branch settings](../modules/settings/restaurant_branch_settings.md) |
| `/manager` | ManagerRootLayout | Manager | [common interface controls](common_interface_controls.md); [page controls](../reference/interface/component_manager_managerrootlayout.md) |
| `/manager` (index) | ManagerOrdersBase | Manager | [order lists](../modules/orders/order_lists.md); [page controls](../reference/interface/component_manager_orders_managerordersbase.md) |
| `/manager/reservations` | ManagerReservationsBase | Manager | [reservations](../modules/reservations/reservations.md); [page controls](../reference/interface/component_manager_reservations_managerreservationsbase.md) |
| `/manager/tables` | ManagerTablesHome | Manager | [waiter tables](../modules/orders/waiter_tables.md) |
| `/manager/menu` | MenuBaseModal | Manager | [menu](../modules/menu/menu.md) |
| `/manager/discount-requests` | DiscountRequestMain | Manager | [requests](../modules/discounts/requests.md); [page controls](../reference/interface/component_manager_discountrequest_discountrequestmain.md) |
| `/manager/activity` | ActivityDashboard | Manager | [audit activity](../modules/audit/audit_activity.md); [page controls](../reference/interface/modules_activity_activitydashboard.md) |
| `/manager/new-order` | ManagerAddOrder | Authenticated staff (route guard has no role list) | [waiter tables](../modules/orders/waiter_tables.md); [page controls](../reference/interface/component_manager_tables_manageraddorder.md) |
| `/inventory-manager` | InventoryManagerRoot | InventoryManager | [common interface controls](common_interface_controls.md); [page controls](../reference/interface/component_inventorymanager_inventorymanagerroot.md) |
| `/inventory-manager` (index) | InventoryPages | InventoryManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/inventory-manager/menu` | MenuBaseModal | InventoryManager | [menu](../modules/menu/menu.md) |
| `/inventory-manager/stations` | StationsManagement | InventoryManager | [stations](../modules/menu/stations.md); [page controls](../reference/interface/component_admin_stations_stationsmanagement.md) |
| `/inventory-manager/tables` | TableBase | InventoryManager | [table setup](../modules/tables/table_setup.md); [page controls](../reference/interface/component_admin_tables_tablebase.md) |
| `/inventory-manager/menu/item/:id` | IndividualItem | InventoryManager | [menu](../modules/menu/menu.md); [page controls](../reference/interface/component_admin_menumanagement_individualitem.md) |
| `/inventory-manager/platters` | Platters | InventoryManager | [menu](../modules/menu/menu.md) |
| `/inventory-manager/menu/platter/:id` | PlatterDetails | InventoryManager | [menu](../modules/menu/menu.md); [page controls](../reference/interface/component_admin_menumanagement_platterdetails.md) |
| `/inventory-manager/inventory` | InventoryPages | InventoryManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/inventory-manager/inventory/ingredients` | InventoryPages | InventoryManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/inventory-manager/inventory/stock-levels` | InventoryPages | InventoryManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/inventory-manager/inventory/stock-movements` | InventoryPages | InventoryManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/inventory-manager/inventory/stock-adjustments` | InventoryPages | InventoryManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/inventory-manager/inventory/low-stock` | InventoryPages | InventoryManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/inventory-manager/inventory/reports` | InventoryPages | InventoryManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/inventory-manager/daily-production` | DailyProduction | InventoryManager | [daily production](../modules/production/daily_production.md); [page controls](../reference/interface/component_admin_dailyproduction_dailyproduction.md) |
| `/inventory-manager/expenses` | ExpensesMain | InventoryManager | [expenses](../modules/expenses/expenses.md); [page controls](../reference/interface/component_admin_expenses_expensesmain.md) |
| `/inventory-manager/expenses/history` | ExpensesHistory | InventoryManager | [expenses](../modules/expenses/expenses.md); [page controls](../reference/interface/component_admin_expenses_expenseshistory.md) |
| `/inventory-manager/expenses/:id` | IndividualExpense | InventoryManager | [expenses](../modules/expenses/expenses.md); [page controls](../reference/interface/component_admin_expenses_individualexpense.md) |
| `/finance-manager` | FinanceManagerLayout | FinanceManager | [common interface controls](common_interface_controls.md); [page controls](../reference/interface/component_financemanager_financemanagerlayout.md) |
| `/finance-manager` (index) | ExpensesMain | FinanceManager | [expenses](../modules/expenses/expenses.md); [page controls](../reference/interface/component_admin_expenses_expensesmain.md) |
| `/finance-manager/expenses` | ExpensesMain | FinanceManager | [expenses](../modules/expenses/expenses.md); [page controls](../reference/interface/component_admin_expenses_expensesmain.md) |
| `/finance-manager/expenses/history` | ExpensesHistory | FinanceManager | [expenses](../modules/expenses/expenses.md); [page controls](../reference/interface/component_admin_expenses_expenseshistory.md) |
| `/finance-manager/expenses/:id` | IndividualExpense | FinanceManager | [expenses](../modules/expenses/expenses.md); [page controls](../reference/interface/component_admin_expenses_individualexpense.md) |
| `/finance-manager/payroll` | PayrollWorkspace | FinanceManager | [payroll](../modules/payroll/payroll.md); [page controls](../reference/interface/component_admin_payrollworkspace.md) |
| `/finance-manager/payroll/run` | PayrollWorkspace | FinanceManager | [payroll](../modules/payroll/payroll.md); [page controls](../reference/interface/component_admin_payrollworkspace.md) |
| `/finance-manager/payroll/records` | PayrollWorkspace | FinanceManager | [payroll](../modules/payroll/payroll.md); [page controls](../reference/interface/component_admin_payrollworkspace.md) |
| `/finance-manager/payroll/records/:id` | PayrollWorkspace | FinanceManager | [payroll](../modules/payroll/payroll.md); [page controls](../reference/interface/component_admin_payrollworkspace.md) |
| `/finance-manager/payroll/advances` | PayrollWorkspace | FinanceManager | [payroll](../modules/payroll/payroll.md); [page controls](../reference/interface/component_admin_payrollworkspace.md) |
| `/finance-manager/payroll/payments` | PayrollWorkspace | FinanceManager | [payroll](../modules/payroll/payroll.md); [page controls](../reference/interface/component_admin_payrollworkspace.md) |
| `/finance-manager/payroll/employees/:id` | PayrollWorkspace | FinanceManager | [payroll](../modules/payroll/payroll.md); [page controls](../reference/interface/component_admin_payrollworkspace.md) |
| `/finance-manager/contractors` | ContractorWorkspace | FinanceManager | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/finance-manager/contractors/invoices` | ContractorWorkspace | FinanceManager | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/finance-manager/contractors/invoices/new` | ContractorWorkspace | FinanceManager | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/finance-manager/contractors/invoices/:id` | ContractorWorkspace | FinanceManager | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/finance-manager/contractors/contractors` | ContractorWorkspace | FinanceManager | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/finance-manager/contractors/contractors/:id` | ContractorWorkspace | FinanceManager | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/finance-manager/contractors/contracts` | ContractorWorkspace | FinanceManager | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/finance-manager/contractors/payments` | ContractorWorkspace | FinanceManager | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/finance-manager/contractors/payables` | ContractorWorkspace | FinanceManager | [services](../modules/contractors/services.md); [page controls](../reference/interface/component_admin_contractors_contractorworkspace.md) |
| `/finance-manager/procurement` | ProcurementWorkspace | FinanceManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/finance-manager/procurement/purchase-invoices` | ProcurementWorkspace | FinanceManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/finance-manager/procurement/purchase-invoices/new` | ProcurementWorkspace | FinanceManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/finance-manager/procurement/purchase-invoices/:id` | ProcurementWorkspace | FinanceManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/finance-manager/procurement/suppliers` | ProcurementWorkspace | FinanceManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/finance-manager/procurement/suppliers/:id` | ProcurementWorkspace | FinanceManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/finance-manager/procurement/supplier-payments` | ProcurementWorkspace | FinanceManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/finance-manager/procurement/payables` | ProcurementWorkspace | FinanceManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/finance-manager/audit-logs` | AuditLogPage | FinanceManager | [audit activity](../modules/audit/audit_activity.md); [page controls](../reference/interface/modules_audit_auditlogpage.md) |
| `/operations-manager` | OperationsManagerLayout | OperationsManager | [common interface controls](common_interface_controls.md); [page controls](../reference/interface/component_operationsmanager_operationsmanagerlayout.md) |
| `/operations-manager` (index) | shifts | OperationsManager | [attendance shifts](../modules/employees/attendance_shifts.md); [page controls](../reference/interface/component_admin_shift_shifts.md) |
| `/operations-manager/shifts` | shifts | OperationsManager | [attendance shifts](../modules/employees/attendance_shifts.md); [page controls](../reference/interface/component_admin_shift_shifts.md) |
| `/operations-manager/attendance` | attendance | OperationsManager | [attendance shifts](../modules/employees/attendance_shifts.md); [page controls](../reference/interface/component_admin_attendance.md) |
| `/operations-manager/menu` | MenuBaseModal | OperationsManager | [menu](../modules/menu/menu.md) |
| `/operations-manager/stations` | StationsManagement | OperationsManager | [stations](../modules/menu/stations.md); [page controls](../reference/interface/component_admin_stations_stationsmanagement.md) |
| `/operations-manager/menu/item/:id` | IndividualItem | OperationsManager | [menu](../modules/menu/menu.md); [page controls](../reference/interface/component_admin_menumanagement_individualitem.md) |
| `/operations-manager/platters` | Platters | OperationsManager | [menu](../modules/menu/menu.md) |
| `/operations-manager/menu/platter/:id` | PlatterDetails | OperationsManager | [menu](../modules/menu/menu.md); [page controls](../reference/interface/component_admin_menumanagement_platterdetails.md) |
| `/operations-manager/daily_production` | DailyProduction | OperationsManager | [daily production](../modules/production/daily_production.md); [page controls](../reference/interface/component_admin_dailyproduction_dailyproduction.md) |
| `/operations-manager/daily-production-movements` | ProductionMovementPage | OperationsManager | [audit activity](../modules/audit/audit_activity.md); [page controls](../reference/interface/modules_audit_productionmovementpage.md) |
| `/operations-manager/tables` | TableBase | OperationsManager | [table setup](../modules/tables/table_setup.md); [page controls](../reference/interface/component_admin_tables_tablebase.md) |
| `/operations-manager/expenses` | ExpensesMain | OperationsManager | [expenses](../modules/expenses/expenses.md); [page controls](../reference/interface/component_admin_expenses_expensesmain.md) |
| `/operations-manager/expenses/history` | ExpensesHistory | OperationsManager | [expenses](../modules/expenses/expenses.md); [page controls](../reference/interface/component_admin_expenses_expenseshistory.md) |
| `/operations-manager/expenses/:id` | IndividualExpense | OperationsManager | [expenses](../modules/expenses/expenses.md); [page controls](../reference/interface/component_admin_expenses_individualexpense.md) |
| `/operations-manager/procurement` | ProcurementWorkspace | OperationsManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/operations-manager/procurement/purchase-invoices` | ProcurementWorkspace | OperationsManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/operations-manager/procurement/purchase-invoices/new` | ProcurementWorkspace | OperationsManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/operations-manager/procurement/purchase-invoices/:id` | ProcurementWorkspace | OperationsManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/operations-manager/procurement/suppliers` | ProcurementWorkspace | OperationsManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/operations-manager/procurement/suppliers/:id` | ProcurementWorkspace | OperationsManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/operations-manager/procurement/supplier-payments` | ProcurementWorkspace | OperationsManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/operations-manager/procurement/payables` | ProcurementWorkspace | OperationsManager | [purchasing](../modules/procurement/purchasing.md); [page controls](../reference/interface/component_admin_procurement_procurementworkspace.md) |
| `/operations-manager/audit-logs` | AuditLogPage | OperationsManager | [audit activity](../modules/audit/audit_activity.md); [page controls](../reference/interface/modules_audit_auditlogpage.md) |
| `/operations-manager/inventory` | InventoryPages | OperationsManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/operations-manager/inventory/ingredients` | InventoryPages | OperationsManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/operations-manager/inventory/stock-levels` | InventoryPages | OperationsManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/operations-manager/inventory/stock-movements` | InventoryPages | OperationsManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/operations-manager/inventory/stock-adjustments` | InventoryPages | OperationsManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/operations-manager/inventory/low-stock` | InventoryPages | OperationsManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/operations-manager/inventory/reports` | InventoryPages | OperationsManager | [stock](../modules/inventory/stock.md); [page controls](../reference/interface/component_admin_inventory_inventorypages.md) |
| `/waiter` | HomePage | Waiter | [waiter tables](../modules/orders/waiter_tables.md); [page controls](../reference/interface/component_waiter_homepage.md) |
| `/waiter/new-order` | OrderAddModal | Waiter | [waiter tables](../modules/orders/waiter_tables.md); [page controls](../reference/interface/component_waiter_orderaddmodal.md) |
| `/kitchen` | KitchenRootLoyout | Kitchen_manager | [preparation](../modules/kitchen/preparation.md); [page controls](../reference/interface/component_kitchen_kitchenrootloyout.md) |
| `/kitchen` (index) | Homepage | Kitchen_manager | [preparation](../modules/kitchen/preparation.md); [page controls](../reference/interface/component_kitchen_homepage.md) |
| `/kitchen/stock` | KitchenManagerStockDashboard | Kitchen_manager | [stock](../modules/inventory/stock.md) |
| `/kitchen/menu` | MenuBase | Kitchen_manager | [menu](../modules/menu/menu.md); [page controls](../reference/interface/component_kitchen_menu_menubase.md) |
| `/kitchen/daily-production` | DailyProduction | Kitchen_manager | [daily production](../modules/production/daily_production.md); [page controls](../reference/interface/component_admin_dailyproduction_dailyproduction.md) |
| `/kitchen/daily_production` | DailyProduction | Kitchen_manager | [daily production](../modules/production/daily_production.md); [page controls](../reference/interface/component_admin_dailyproduction_dailyproduction.md) |
| `/kitchen/menu/items/:id` | IndividualItem | Kitchen_manager | [menu](../modules/menu/menu.md); [page controls](../reference/interface/component_kitchen_menu_individualitem.md) |
| `/kitchen/ready-orders` | ReadyOrders | Kitchen_manager | [preparation](../modules/kitchen/preparation.md); [page controls](../reference/interface/component_kitchen_readyorders.md) |
| `/cashier` | CashierManagment | Cashier | [cashier](../modules/billing/cashier.md); [page controls](../reference/interface/component_cashier_cashiermanagment.md) |
| `/call-operator` | DeliveryOrderForm | Call_operator | [cashier](../modules/billing/cashier.md); [page controls](../reference/interface/component_cashier_components_deliveryorderform.md) |
| `/cashier/takeaway` | TakeAwayOrderForm | Cashier | [cashier](../modules/billing/cashier.md); [page controls](../reference/interface/component_cashier_components_takeawayorderform.md) |
| `/cashier/delivery` | DeliveryOrderForm | Cashier | [cashier](../modules/billing/cashier.md); [page controls](../reference/interface/component_cashier_components_deliveryorderform.md) |
| `/cashier/reservations` | ReservationsList | Cashier | [reservations](../modules/reservations/reservations.md); [page controls](../reference/interface/component_cashier_components_reservationslist.md) |
| `/menu/:slug` | PublicMenu | Public/customer | [customer handoff](../modules/public_ordering/customer_handoff.md); [page controls](../reference/interface/component_publicmenu_publicmenu.md) |
| `/menu/:slug/item/:id` | MenuItemDetails | Public/customer | [customer handoff](../modules/public_ordering/customer_handoff.md); [page controls](../reference/interface/component_publicmenu_menuitemdetails.md) |
| `/menu/:slug/platter/:id` | PlatterDetails | Public/customer | [customer handoff](../modules/public_ordering/customer_handoff.md); [page controls](../reference/interface/component_publicmenu_platterdetails.md) |
| `/subscription-inactive` | SubscriptionInactive | Public/customer | [common interface controls](common_interface_controls.md) |
| `/*` | PageNotFound | Public/customer | [common interface controls](common_interface_controls.md); [page controls](../reference/interface/pagenotfound.md) |
