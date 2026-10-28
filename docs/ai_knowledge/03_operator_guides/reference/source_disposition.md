---
id: "operator_reference_source_disposition"
title: "Source inspection and excluded/unmounted interface inventory"
module: "reference"
description: "Source inspection and excluded/unmounted interface inventory — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["reference", "source", "inspection", "excluded", "unmounted", "interface", "inventory"]
roles: ["See access section"]
related_docs: ["operator_coverage_matrix", "operator_troubleshooting_verification_register"]
frontend_routes: []
source_references: ["frontend/src/App.jsx", "backend/backend/backend/urls.py", "app/lib/app/router/app_router.dart"]
status: "source_verified"
---

# Source inspection and excluded/unmounted interface inventory

Repository inspection scope and disposition. React source was parsed with Babel JSX traversal; Django application source was parsed with Python AST and risk-bearing workflows were traced across UI, serializers, views, models, services and signals. This inventory makes unmounted/legacy and excluded marketing/analytics files explicit. Static imports can include components which a runtime condition never renders; route association is an upper bound.

## React sources

| Source | Disposition | Documentation |
|---|---|---|
| `frontend/src/api/activityApi.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/api/auditApi.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/api/auth.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/api/authforRBC.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/api/axiosInstance.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/api/contractorApi.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/api/customerSession.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/api/inventoryApi.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/api/payrollApi.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/api/procurementApi.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/api/publicOrdering.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/api/ReauireAuth.jsx` | Controls/fields inventoried; shared mounted wrapper/control; runtime Needs Verification | [api reauireauth](interface/api_reauireauth.md) |
| `frontend/src/api/RequireActiveRestaurant.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/App.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/adminDashboard.jsx` | Controls/fields inventoried; parent routes traced | [component admin admindashboard](interface/component_admin_admindashboard.md) |
| `frontend/src/component/Admin/adminNavigation.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/AdminTopHeader.jsx` | Controls/fields inventoried; parent routes traced | [component admin admintopheader](interface/component_admin_admintopheader.md) |
| `frontend/src/component/Admin/Analytics/AnalyticsBaseModal.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/attendance.jsx` | Controls/fields inventoried; parent routes traced | [component admin attendance](interface/component_admin_attendance.md) |
| `frontend/src/component/Admin/branches/BranchManagement.jsx` | Controls/fields inventoried; parent routes traced | [component admin branches branchmanagement](interface/component_admin_branches_branchmanagement.md) |
| `frontend/src/component/Admin/ConfirmDeleteModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin confirmdeletemodal](interface/component_admin_confirmdeletemodal.md) |
| `frontend/src/component/Admin/Contractors/ContractorWorkspace.jsx` | Controls/fields inventoried; parent routes traced | [component admin contractors contractorworkspace](interface/component_admin_contractors_contractorworkspace.md) |
| `frontend/src/component/Admin/Customers/CustomersBaseModal.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/Customers/CustomersTable.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/Customers/FilterBar.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component admin customers filterbar](interface/component_admin_customers_filterbar.md) |
| `frontend/src/component/Admin/DailyProduction/CreateProductionModal.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component admin dailyproduction createproductionmodal](interface/component_admin_dailyproduction_createproductionmodal.md) |
| `frontend/src/component/Admin/DailyProduction/DailyProduction.jsx` | Controls/fields inventoried; parent routes traced | [component admin dailyproduction dailyproduction](interface/component_admin_dailyproduction_dailyproduction.md) |
| `frontend/src/component/Admin/DailyProduction/ProductionCard.jsx` | Controls/fields inventoried; parent routes traced | [component admin dailyproduction productioncard](interface/component_admin_dailyproduction_productioncard.md) |
| `frontend/src/component/Admin/DailyProduction/ProductionItemCard.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component admin dailyproduction productionitemcard](interface/component_admin_dailyproduction_productionitemcard.md) |
| `frontend/src/component/Admin/dashboard/BestSellingItems.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/dashboard/DailySalesChart.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/dashboard/DashboardAnalytics.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/dashboard/DashboardBase.jsx` | Controls/fields inventoried; parent routes traced | [component admin dashboard dashboardbase](interface/component_admin_dashboard_dashboardbase.md) |
| `frontend/src/component/Admin/dashboard/DashboardSideRail.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/dashboard/DeliveryPerformance.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/dashboard/MonthOverview.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/dashboard/Notifications.jsx` | Controls/fields inventoried; parent routes traced | [component admin dashboard notifications](interface/component_admin_dashboard_notifications.md) |
| `frontend/src/component/Admin/dashboard/salesChartUtils.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/dashboard/SalesDateRangeControl.jsx` | Controls/fields inventoried; parent routes traced | [component admin dashboard salesdaterangecontrol](interface/component_admin_dashboard_salesdaterangecontrol.md) |
| `frontend/src/component/Admin/dashboard/TopSectionStatsCard.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/DiscountCards/CreateDiscountCard.jsx` | Controls/fields inventoried; parent routes traced | [component admin discountcards creatediscountcard](interface/component_admin_discountcards_creatediscountcard.md) |
| `frontend/src/component/Admin/DiscountCards/DiscountCardDetails.jsx` | Controls/fields inventoried; parent routes traced | [component admin discountcards discountcarddetails](interface/component_admin_discountcards_discountcarddetails.md) |
| `frontend/src/component/Admin/DiscountCards/DiscountCardEdit.jsx` | Controls/fields inventoried; parent routes traced | [component admin discountcards discountcardedit](interface/component_admin_discountcards_discountcardedit.md) |
| `frontend/src/component/Admin/DiscountCards/DiscountCardsMain.jsx` | Controls/fields inventoried; parent routes traced | [component admin discountcards discountcardsmain](interface/component_admin_discountcards_discountcardsmain.md) |
| `frontend/src/component/Admin/Discounts/AdminDiscountsMain.jsx` | Controls/fields inventoried; parent routes traced | [component admin discounts admindiscountsmain](interface/component_admin_discounts_admindiscountsmain.md) |
| `frontend/src/component/Admin/Discounts/AllDiscounts.jsx` | Controls/fields inventoried; parent routes traced | [component admin discounts alldiscounts](interface/component_admin_discounts_alldiscounts.md) |
| `frontend/src/component/Admin/Expenses/ExpensesHistory.jsx` | Controls/fields inventoried; parent routes traced | [component admin expenses expenseshistory](interface/component_admin_expenses_expenseshistory.md) |
| `frontend/src/component/Admin/Expenses/ExpensesMain.jsx` | Controls/fields inventoried; parent routes traced | [component admin expenses expensesmain](interface/component_admin_expenses_expensesmain.md) |
| `frontend/src/component/Admin/Expenses/ExpenseVoucher.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/Expenses/helpers.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/Expenses/hooks.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/Expenses/IndividualExpense.jsx` | Controls/fields inventoried; parent routes traced | [component admin expenses individualexpense](interface/component_admin_expenses_individualexpense.md) |
| `frontend/src/component/Admin/Expenses/Pagination.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/Feedbacks/FeedbackBase.jsx` | Controls/fields inventoried; parent routes traced | [component admin feedbacks feedbackbase](interface/component_admin_feedbacks_feedbackbase.md) |
| `frontend/src/component/Admin/Feedbacks/FeedbacksDisplayModel.jsx` | Controls/fields inventoried; parent routes traced | [component admin feedbacks feedbacksdisplaymodel](interface/component_admin_feedbacks_feedbacksdisplaymodel.md) |
| `frontend/src/component/Admin/GlobalSearch.jsx` | Controls/fields inventoried; parent routes traced | [component admin globalsearch](interface/component_admin_globalsearch.md) |
| `frontend/src/component/Admin/Inventory/AdjustStockModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin inventory adjuststockmodal](interface/component_admin_inventory_adjuststockmodal.md) |
| `frontend/src/component/Admin/Inventory/CreateIngredient.jsx` | Controls/fields inventoried; parent routes traced | [component admin inventory createingredient](interface/component_admin_inventory_createingredient.md) |
| `frontend/src/component/Admin/Inventory/EditIngredientModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin inventory editingredientmodal](interface/component_admin_inventory_editingredientmodal.md) |
| `frontend/src/component/Admin/Inventory/EditStockModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin inventory editstockmodal](interface/component_admin_inventory_editstockmodal.md) |
| `frontend/src/component/Admin/Inventory/IngredientList.jsx` | Controls/fields inventoried; parent routes traced | [component admin inventory ingredientlist](interface/component_admin_inventory_ingredientlist.md) |
| `frontend/src/component/Admin/Inventory/InventoryDashboard.jsx` | Controls/fields inventoried; parent routes traced | [component admin inventory inventorydashboard](interface/component_admin_inventory_inventorydashboard.md) |
| `frontend/src/component/Admin/Inventory/InventoryPages.jsx` | Controls/fields inventoried; parent routes traced | [component admin inventory inventorypages](interface/component_admin_inventory_inventorypages.md) |
| `frontend/src/component/Admin/Inventory/InventorySearch.jsx` | Controls/fields inventoried; parent routes traced | [component admin inventory inventorysearch](interface/component_admin_inventory_inventorysearch.md) |
| `frontend/src/component/Admin/Inventory/LowStockItems.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/Inventory/StockMovementList.jsx` | Controls/fields inventoried; parent routes traced | [component admin inventory stockmovementlist](interface/component_admin_inventory_stockmovementlist.md) |
| `frontend/src/component/Admin/Inventory/StockTransferPanel.jsx` | Controls/fields inventoried; parent routes traced | [component admin inventory stocktransferpanel](interface/component_admin_inventory_stocktransferpanel.md) |
| `frontend/src/component/Admin/Inventory/TopConsumedChart.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/MenuManagement/AddCategoryModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin menumanagement addcategorymodal](interface/component_admin_menumanagement_addcategorymodal.md) |
| `frontend/src/component/Admin/MenuManagement/AddItemModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin menumanagement additemmodal](interface/component_admin_menumanagement_additemmodal.md) |
| `frontend/src/component/Admin/MenuManagement/Catagories.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component admin menumanagement catagories](interface/component_admin_menumanagement_catagories.md) |
| `frontend/src/component/Admin/MenuManagement/CategoryDeleteModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin menumanagement categorydeletemodal](interface/component_admin_menumanagement_categorydeletemodal.md) |
| `frontend/src/component/Admin/MenuManagement/EditCategoryModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin menumanagement editcategorymodal](interface/component_admin_menumanagement_editcategorymodal.md) |
| `frontend/src/component/Admin/MenuManagement/IndividualItem.jsx` | Controls/fields inventoried; parent routes traced | [component admin menumanagement individualitem](interface/component_admin_menumanagement_individualitem.md) |
| `frontend/src/component/Admin/MenuManagement/ItemDeleteModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin menumanagement itemdeletemodal](interface/component_admin_menumanagement_itemdeletemodal.md) |
| `frontend/src/component/Admin/MenuManagement/MenuBaseModal.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/MenuManagement/MenuList.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component admin menumanagement menulist](interface/component_admin_menumanagement_menulist.md) |
| `frontend/src/component/Admin/MenuManagement/menuOrdering.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/MenuManagement/MenuWorkspace.jsx` | Controls/fields inventoried; parent routes traced | [component admin menumanagement menuworkspace](interface/component_admin_menumanagement_menuworkspace.md) |
| `frontend/src/component/Admin/MenuManagement/PlatterAddModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin menumanagement platteraddmodal](interface/component_admin_menumanagement_platteraddmodal.md) |
| `frontend/src/component/Admin/MenuManagement/PlatterDetails.jsx` | Controls/fields inventoried; parent routes traced | [component admin menumanagement platterdetails](interface/component_admin_menumanagement_platterdetails.md) |
| `frontend/src/component/Admin/MenuManagement/Platters.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/MenuManagement/RecipeIngredientRow.jsx` | Controls/fields inventoried; parent routes traced | [component admin menumanagement recipeingredientrow](interface/component_admin_menumanagement_recipeingredientrow.md) |
| `frontend/src/component/Admin/MenuManagement/SingleItemDispalyModal.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/MenuManagement/useCategoryItems.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/navbar.jsx` | Controls/fields inventoried; parent routes traced | [component admin navbar](interface/component_admin_navbar.md) |
| `frontend/src/component/Admin/order/OrderBase.jsx` | Controls/fields inventoried; parent routes traced | [component admin order orderbase](interface/component_admin_order_orderbase.md) |
| `frontend/src/component/Admin/order/OrderDetailsModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin order orderdetailsmodal](interface/component_admin_order_orderdetailsmodal.md) |
| `frontend/src/component/Admin/order/OrderFilters.jsx` | Controls/fields inventoried; parent routes traced | [component admin order orderfilters](interface/component_admin_order_orderfilters.md) |
| `frontend/src/component/Admin/order/orderPeriod.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/order/OrderPeriodBar.jsx` | Controls/fields inventoried; parent routes traced | [component admin order orderperiodbar](interface/component_admin_order_orderperiodbar.md) |
| `frontend/src/component/Admin/order/OrdersTable.jsx` | Controls/fields inventoried; parent routes traced | [component admin order orderstable](interface/component_admin_order_orderstable.md) |
| `frontend/src/component/Admin/order/OrderStats.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/PayrollWorkspace.jsx` | Controls/fields inventoried; parent routes traced | [component admin payrollworkspace](interface/component_admin_payrollworkspace.md) |
| `frontend/src/component/Admin/Procurement/ProcurementWorkspace.jsx` | Controls/fields inventoried; parent routes traced | [component admin procurement procurementworkspace](interface/component_admin_procurement_procurementworkspace.md) |
| `frontend/src/component/Admin/Reports/FinanceReport.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/Reports/InventoryReport.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/Reports/menuItemReportUtils.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/Reports/MenuItemSalesReport.jsx` | Controls/fields inventoried; parent routes traced | [component admin reports menuitemsalesreport](interface/component_admin_reports_menuitemsalesreport.md) |
| `frontend/src/component/Admin/Reports/OrdersReport.jsx` | Controls/fields inventoried; parent routes traced | [component admin reports ordersreport](interface/component_admin_reports_ordersreport.md) |
| `frontend/src/component/Admin/Reports/ReportHeader.jsx` | Controls/fields inventoried; parent routes traced | [component admin reports reportheader](interface/component_admin_reports_reportheader.md) |
| `frontend/src/component/Admin/Reports/ReportsMainPage.jsx` | Controls/fields inventoried; parent routes traced | [component admin reports reportsmainpage](interface/component_admin_reports_reportsmainpage.md) |
| `frontend/src/component/Admin/Reports/StaffReport.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/Reservations/ReservationDetails.jsx` | Controls/fields inventoried; parent routes traced | [component admin reservations reservationdetails](interface/component_admin_reservations_reservationdetails.md) |
| `frontend/src/component/Admin/Reservations/ReservationsMainPage.jsx` | Controls/fields inventoried; parent routes traced | [component admin reservations reservationsmainpage](interface/component_admin_reservations_reservationsmainpage.md) |
| `frontend/src/component/Admin/Reservations/ReservationsTable.jsx` | Controls/fields inventoried; parent routes traced | [component admin reservations reservationstable](interface/component_admin_reservations_reservationstable.md) |
| `frontend/src/component/Admin/settings/components/BranchSettings.jsx` | Controls/fields inventoried; parent routes traced | [component admin settings components branchsettings](interface/component_admin_settings_components_branchsettings.md) |
| `frontend/src/component/Admin/settings/components/BrandingSettings.jsx` | Controls/fields inventoried; parent routes traced | [component admin settings components brandingsettings](interface/component_admin_settings_components_brandingsettings.md) |
| `frontend/src/component/Admin/settings/components/DeliverySettings.jsx` | Controls/fields inventoried; parent routes traced | [component admin settings components deliverysettings](interface/component_admin_settings_components_deliverysettings.md) |
| `frontend/src/component/Admin/settings/components/DiscountSettings.jsx` | Controls/fields inventoried; parent routes traced | [component admin settings components discountsettings](interface/component_admin_settings_components_discountsettings.md) |
| `frontend/src/component/Admin/settings/components/GeneralSettings.jsx` | Controls/fields inventoried; parent routes traced | [component admin settings components generalsettings](interface/component_admin_settings_components_generalsettings.md) |
| `frontend/src/component/Admin/settings/components/LocationSettings.jsx` | Controls/fields inventoried; parent routes traced | [component admin settings components locationsettings](interface/component_admin_settings_components_locationsettings.md) |
| `frontend/src/component/Admin/settings/components/PublicLinksSettings.jsx` | Controls/fields inventoried; parent routes traced | [component admin settings components publiclinkssettings](interface/component_admin_settings_components_publiclinkssettings.md) |
| `frontend/src/component/Admin/settings/components/ReceiptSettings.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component admin settings components receiptsettings](interface/component_admin_settings_components_receiptsettings.md) |
| `frontend/src/component/Admin/settings/components/SettingsPrimitives.jsx` | Controls/fields inventoried; parent routes traced | [component admin settings components settingsprimitives](interface/component_admin_settings_components_settingsprimitives.md) |
| `frontend/src/component/Admin/settings/components/SocialMediaSettings.jsx` | Controls/fields inventoried; parent routes traced | [component admin settings components socialmediasettings](interface/component_admin_settings_components_socialmediasettings.md) |
| `frontend/src/component/Admin/settings/FormInput.jsx` | Controls/fields inventoried; parent routes traced | [component admin settings forminput](interface/component_admin_settings_forminput.md) |
| `frontend/src/component/Admin/settings/hooks/useRestaurantSettings.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/settings/LanguageSwitcher.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component admin settings languageswitcher](interface/component_admin_settings_languageswitcher.md) |
| `frontend/src/component/Admin/settings/LogoUpload.jsx` | Controls/fields inventoried; parent routes traced | [component admin settings logoupload](interface/component_admin_settings_logoupload.md) |
| `frontend/src/component/Admin/settings/RestaurantInfoDisplay.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/settings/RestaurantSettings.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/settings/RestaurantSettingsLayout.jsx` | Controls/fields inventoried; parent routes traced | [component admin settings restaurantsettingslayout](interface/component_admin_settings_restaurantsettingslayout.md) |
| `frontend/src/component/Admin/settings/SettingsBaseModal.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/settings/settingsConfig.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/settings/SettingsContext.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/settings/SettingsSidebar.jsx` | Controls/fields inventoried; parent routes traced | [component admin settings settingssidebar](interface/component_admin_settings_settingssidebar.md) |
| `frontend/src/component/Admin/shift/addShiftModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin shift addshiftmodal](interface/component_admin_shift_addshiftmodal.md) |
| `frontend/src/component/Admin/shift/AttendanceTable.jsx` | Controls/fields inventoried; parent routes traced | [component admin shift attendancetable](interface/component_admin_shift_attendancetable.md) |
| `frontend/src/component/Admin/shift/ShiftList.jsx` | Controls/fields inventoried; parent routes traced | [component admin shift shiftlist](interface/component_admin_shift_shiftlist.md) |
| `frontend/src/component/Admin/shift/shifts.jsx` | Controls/fields inventoried; parent routes traced | [component admin shift shifts](interface/component_admin_shift_shifts.md) |
| `frontend/src/component/Admin/shift/StaffAvatar.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/staff/StaffFormModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin staff staffformmodal](interface/component_admin_staff_staffformmodal.md) |
| `frontend/src/component/Admin/staff/StaffManagement.jsx` | Controls/fields inventoried; parent routes traced | [component admin staff staffmanagement](interface/component_admin_staff_staffmanagement.md) |
| `frontend/src/component/Admin/staff/StaffModal.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Admin/staff/StaffTable.jsx` | Controls/fields inventoried; parent routes traced | [component admin staff stafftable](interface/component_admin_staff_stafftable.md) |
| `frontend/src/component/Admin/stations/StationDeleteModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin stations stationdeletemodal](interface/component_admin_stations_stationdeletemodal.md) |
| `frontend/src/component/Admin/stations/StationFormModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin stations stationformmodal](interface/component_admin_stations_stationformmodal.md) |
| `frontend/src/component/Admin/stations/StationsManagement.jsx` | Controls/fields inventoried; parent routes traced | [component admin stations stationsmanagement](interface/component_admin_stations_stationsmanagement.md) |
| `frontend/src/component/Admin/tables/TableAddModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin tables tableaddmodal](interface/component_admin_tables_tableaddmodal.md) |
| `frontend/src/component/Admin/tables/TableBase.jsx` | Controls/fields inventoried; parent routes traced | [component admin tables tablebase](interface/component_admin_tables_tablebase.md) |
| `frontend/src/component/Admin/tables/TablesDisplayModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin tables tablesdisplaymodal](interface/component_admin_tables_tablesdisplaymodal.md) |
| `frontend/src/component/Admin/tables/TableUpdateDeleteModal.jsx` | Controls/fields inventoried; parent routes traced | [component admin tables tableupdatedeletemodal](interface/component_admin_tables_tableupdatedeletemodal.md) |
| `frontend/src/component/branch/BranchSelectionPage.jsx` | Controls/fields inventoried; parent routes traced | [component branch branchselectionpage](interface/component_branch_branchselectionpage.md) |
| `frontend/src/component/branch/BranchSwitcher.jsx` | Controls/fields inventoried; parent routes traced | [component branch branchswitcher](interface/component_branch_branchswitcher.md) |
| `frontend/src/component/Cashier/cashierApi.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Cashier/cashierData.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Cashier/CashierManagment.jsx` | Controls/fields inventoried; parent routes traced | [component cashier cashiermanagment](interface/component_cashier_cashiermanagment.md) |
| `frontend/src/component/Cashier/components/AddReservation.jsx` | Controls/fields inventoried; parent routes traced | [component cashier components addreservation](interface/component_cashier_components_addreservation.md) |
| `frontend/src/component/Cashier/components/BillPrintModal.jsx` | Controls/fields inventoried; parent routes traced | [component cashier components billprintmodal](interface/component_cashier_components_billprintmodal.md) |
| `frontend/src/component/Cashier/components/DeliveryAssignmentModal.jsx` | Controls/fields inventoried; parent routes traced | [component cashier components deliveryassignmentmodal](interface/component_cashier_components_deliveryassignmentmodal.md) |
| `frontend/src/component/Cashier/components/DeliveryOrderForm.jsx` | Controls/fields inventoried; parent routes traced | [component cashier components deliveryorderform](interface/component_cashier_components_deliveryorderform.md) |
| `frontend/src/component/Cashier/components/DiscountRequestModal.jsx` | Controls/fields inventoried; parent routes traced | [component cashier components discountrequestmodal](interface/component_cashier_components_discountrequestmodal.md) |
| `frontend/src/component/Cashier/components/FilterBar.jsx` | Controls/fields inventoried; parent routes traced | [component cashier components filterbar](interface/component_cashier_components_filterbar.md) |
| `frontend/src/component/Cashier/components/OrderCard.jsx` | Controls/fields inventoried; parent routes traced | [component cashier components ordercard](interface/component_cashier_components_ordercard.md) |
| `frontend/src/component/Cashier/components/OrderDetailsModal.jsx` | Controls/fields inventoried; parent routes traced | [component cashier components orderdetailsmodal](interface/component_cashier_components_orderdetailsmodal.md) |
| `frontend/src/component/Cashier/components/OrderEditModal.jsx` | Controls/fields inventoried; parent routes traced | [component cashier components ordereditmodal](interface/component_cashier_components_ordereditmodal.md) |
| `frontend/src/component/Cashier/components/OrderList.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Cashier/components/ReservationCancellationToast.jsx` | Controls/fields inventoried; parent routes traced | [component cashier components reservationcancellationtoast](interface/component_cashier_components_reservationcancellationtoast.md) |
| `frontend/src/component/Cashier/components/ReservationPrintModal.jsx` | Controls/fields inventoried; parent routes traced | [component cashier components reservationprintmodal](interface/component_cashier_components_reservationprintmodal.md) |
| `frontend/src/component/Cashier/components/ReservationsList.jsx` | Controls/fields inventoried; parent routes traced | [component cashier components reservationslist](interface/component_cashier_components_reservationslist.md) |
| `frontend/src/component/Cashier/components/ReservationUpdateForms.jsx` | Controls/fields inventoried; parent routes traced | [component cashier components reservationupdateforms](interface/component_cashier_components_reservationupdateforms.md) |
| `frontend/src/component/Cashier/components/SalesSummary.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Cashier/components/TakeawayCheckoutForm.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component cashier components takeawaycheckoutform](interface/component_cashier_components_takeawaycheckoutform.md) |
| `frontend/src/component/Cashier/components/TakeAwayOrderForm.jsx` | Controls/fields inventoried; parent routes traced | [component cashier components takeawayorderform](interface/component_cashier_components_takeawayorderform.md) |
| `frontend/src/component/Customer/BranchSelectionPage.jsx` | Controls/fields inventoried; parent routes traced | [component customer branchselectionpage](interface/component_customer_branchselectionpage.md) |
| `frontend/src/component/Customer/CheckoutForm.jsx` | Controls/fields inventoried; parent routes traced | [component customer checkoutform](interface/component_customer_checkoutform.md) |
| `frontend/src/component/Customer/CustomerAccountMenu.jsx` | Controls/fields inventoried; parent routes traced | [component customer customeraccountmenu](interface/component_customer_customeraccountmenu.md) |
| `frontend/src/component/Customer/CustomerAuthLayout.jsx` | Controls/fields inventoried; parent routes traced | [component customer customerauthlayout](interface/component_customer_customerauthlayout.md) |
| `frontend/src/component/Customer/CustomerLoginModal.jsx` | Controls/fields inventoried; parent routes traced | [component customer customerloginmodal](interface/component_customer_customerloginmodal.md) |
| `frontend/src/component/Customer/CustomerProfile.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Customer/CustomerSignupModal.jsx` | Controls/fields inventoried; parent routes traced | [component customer customersignupmodal](interface/component_customer_customersignupmodal.md) |
| `frontend/src/component/Customer/Header.jsx` | Controls/fields inventoried; parent routes traced | [component customer header](interface/component_customer_header.md) |
| `frontend/src/component/Customer/HomePage.jsx` | Controls/fields inventoried; parent routes traced | [component customer homepage](interface/component_customer_homepage.md) |
| `frontend/src/component/Customer/i18n.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Customer/InfoPage.jsx` | Controls/fields inventoried; parent routes traced | [component customer infopage](interface/component_customer_infopage.md) |
| `frontend/src/component/Customer/LanguageSwitcher.jsx` | Controls/fields inventoried; parent routes traced | [component customer languageswitcher](interface/component_customer_languageswitcher.md) |
| `frontend/src/component/Customer/MenuCard.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component customer menucard](interface/component_customer_menucard.md) |
| `frontend/src/component/Customer/MenuDetails.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component customer menudetails](interface/component_customer_menudetails.md) |
| `frontend/src/component/Customer/MenuPage.jsx` | Controls/fields inventoried; parent routes traced | [component customer menupage](interface/component_customer_menupage.md) |
| `frontend/src/component/Customer/OnlineMenuDetails.jsx` | Controls/fields inventoried; parent routes traced | [component customer onlinemenudetails](interface/component_customer_onlinemenudetails.md) |
| `frontend/src/component/Customer/OnlinePlatterDetails.jsx` | Controls/fields inventoried; parent routes traced | [component customer onlineplatterdetails](interface/component_customer_onlineplatterdetails.md) |
| `frontend/src/component/Customer/Orders.jsx` | Controls/fields inventoried; parent routes traced | [component customer orders](interface/component_customer_orders.md) |
| `frontend/src/component/Customer/PlatterDetails.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component customer platterdetails](interface/component_customer_platterdetails.md) |
| `frontend/src/component/Customer/ReviewPage.jsx` | Controls/fields inventoried; parent routes traced | [component customer reviewpage](interface/component_customer_reviewpage.md) |
| `frontend/src/component/Customer/utils/setDirection.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/DomainAwareLogin.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/FinanceManager/FinanceManagerLayout.jsx` | Controls/fields inventoried; parent routes traced | [component financemanager financemanagerlayout](interface/component_financemanager_financemanagerlayout.md) |
| `frontend/src/component/FinanceManager/FinanceManagerNavbar.jsx` | Controls/fields inventoried; parent routes traced | [component financemanager financemanagernavbar](interface/component_financemanager_financemanagernavbar.md) |
| `frontend/src/component/FinanceManager/FinanceManagerSearch.jsx` | Controls/fields inventoried; parent routes traced | [component financemanager financemanagersearch](interface/component_financemanager_financemanagersearch.md) |
| `frontend/src/component/FinanceManager/FinanceManagerTopHeader.jsx` | Controls/fields inventoried; parent routes traced | [component financemanager financemanagertopheader](interface/component_financemanager_financemanagertopheader.md) |
| `frontend/src/component/FinanceManager/financeManangerNavigation.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/InventoryManager/InventoryManagerNavbar.jsx` | Controls/fields inventoried; parent routes traced | [component inventorymanager inventorymanagernavbar](interface/component_inventorymanager_inventorymanagernavbar.md) |
| `frontend/src/component/InventoryManager/InventoryManagerRoot.jsx` | Controls/fields inventoried; parent routes traced | [component inventorymanager inventorymanagerroot](interface/component_inventorymanager_inventorymanagerroot.md) |
| `frontend/src/component/kitchen/CompactOrderCard.jsx` | Controls/fields inventoried; parent routes traced | [component kitchen compactordercard](interface/component_kitchen_compactordercard.md) |
| `frontend/src/component/kitchen/FilterBar.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component kitchen filterbar](interface/component_kitchen_filterbar.md) |
| `frontend/src/component/kitchen/Homepage.jsx` | Controls/fields inventoried; parent routes traced | [component kitchen homepage](interface/component_kitchen_homepage.md) |
| `frontend/src/component/kitchen/KitchenBillPrintModal.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/kitchen/KitchenRootLoyout.jsx` | Controls/fields inventoried; parent routes traced | [component kitchen kitchenrootloyout](interface/component_kitchen_kitchenrootloyout.md) |
| `frontend/src/component/kitchen/Menu/CategoriesListModal.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component kitchen menu categorieslistmodal](interface/component_kitchen_menu_categorieslistmodal.md) |
| `frontend/src/component/kitchen/Menu/IndividualItem.jsx` | Controls/fields inventoried; parent routes traced | [component kitchen menu individualitem](interface/component_kitchen_menu_individualitem.md) |
| `frontend/src/component/kitchen/Menu/MenuBase.jsx` | Controls/fields inventoried; parent routes traced | [component kitchen menu menubase](interface/component_kitchen_menu_menubase.md) |
| `frontend/src/component/kitchen/Menu/MenuList.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component kitchen menu menulist](interface/component_kitchen_menu_menulist.md) |
| `frontend/src/component/kitchen/MetricsBar.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/kitchen/OrderCard.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component kitchen ordercard](interface/component_kitchen_ordercard.md) |
| `frontend/src/component/kitchen/OrderDetailSidebar.jsx` | Controls/fields inventoried; parent routes traced | [component kitchen orderdetailsidebar](interface/component_kitchen_orderdetailsidebar.md) |
| `frontend/src/component/kitchen/OrderItem.jsx` | Controls/fields inventoried; parent routes traced | [component kitchen orderitem](interface/component_kitchen_orderitem.md) |
| `frontend/src/component/kitchen/orderStatusError.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/kitchen/ReadyOrders.jsx` | Controls/fields inventoried; parent routes traced | [component kitchen readyorders](interface/component_kitchen_readyorders.md) |
| `frontend/src/component/kitchen/Stock/IngredientList.jsx` | Controls/fields inventoried; parent routes traced | [component kitchen stock ingredientlist](interface/component_kitchen_stock_ingredientlist.md) |
| `frontend/src/component/kitchen/Stock/KitchenManagerStockDashboard.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/AnalyticsSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/CTAButton.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/CuisineSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/DownloadAppButton.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/FAQSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/FeaturesSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/FinalCTASection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/HeroSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/HowItWorksSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/LandingFooter.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/LandingNavbar.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/MarketplaceFooter.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/MarketplaceNavbar.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/MarketplaceSearch.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/PopularRestaurantsSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/PremiumPublicChrome.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/PricingSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/ProblemSolutionSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/ProductMockup.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/ProductShowcaseSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/QRMenuSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/RestaurantCard.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/RestaurantDiscoverySection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/RestaurantOwnerSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/SectionHeading.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/SolutionsSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/TrustSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/useAndroidRelease.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/landing/WhyPakhlaiSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Manager/DiscountRequest/DiscountRequestCard.jsx` | Controls/fields inventoried; parent routes traced | [component manager discountrequest discountrequestcard](interface/component_manager_discountrequest_discountrequestcard.md) |
| `frontend/src/component/Manager/DiscountRequest/DiscountRequestMain.jsx` | Controls/fields inventoried; parent routes traced | [component manager discountrequest discountrequestmain](interface/component_manager_discountrequest_discountrequestmain.md) |
| `frontend/src/component/Manager/ManagerDashboard.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Manager/ManagerNavbar.jsx` | Controls/fields inventoried; parent routes traced | [component manager managernavbar](interface/component_manager_managernavbar.md) |
| `frontend/src/component/Manager/ManagerRootLayout.jsx` | Controls/fields inventoried; parent routes traced | [component manager managerrootlayout](interface/component_manager_managerrootlayout.md) |
| `frontend/src/component/Manager/orders/ManagerOrdersBase.jsx` | Controls/fields inventoried; parent routes traced | [component manager orders managerordersbase](interface/component_manager_orders_managerordersbase.md) |
| `frontend/src/component/Manager/orders/ManagerOrdersTable.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component manager orders managerorderstable](interface/component_manager_orders_managerorderstable.md) |
| `frontend/src/component/Manager/reservations/ManagerReservationsBase.jsx` | Controls/fields inventoried; parent routes traced | [component manager reservations managerreservationsbase](interface/component_manager_reservations_managerreservationsbase.md) |
| `frontend/src/component/Manager/reservations/ManagerReservationsTable.jsx` | Controls/fields inventoried; parent routes traced | [component manager reservations managerreservationstable](interface/component_manager_reservations_managerreservationstable.md) |
| `frontend/src/component/Manager/tables/ManagerAddOrder.jsx` | Controls/fields inventoried; parent routes traced | [component manager tables manageraddorder](interface/component_manager_tables_manageraddorder.md) |
| `frontend/src/component/Manager/tables/ManagerTableActionModal.jsx` | Controls/fields inventoried; parent routes traced | [component manager tables managertableactionmodal](interface/component_manager_tables_managertableactionmodal.md) |
| `frontend/src/component/Manager/tables/ManagerTables.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component manager tables managertables](interface/component_manager_tables_managertables.md) |
| `frontend/src/component/Manager/tables/ManagerTablesHome.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Manager/tables/ManagerTablesMain.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/Manager/tables/ManagerTablesWorkspace.jsx` | Controls/fields inventoried; parent routes traced | [component manager tables managertablesworkspace](interface/component_manager_tables_managertablesworkspace.md) |
| `frontend/src/component/Manager/tables/MangerAddNewItem.jsx` | Controls/fields inventoried; parent routes traced | [component manager tables mangeraddnewitem](interface/component_manager_tables_mangeraddnewitem.md) |
| `frontend/src/component/OperationsManager/OperationsManagerLayout.jsx` | Controls/fields inventoried; parent routes traced | [component operationsmanager operationsmanagerlayout](interface/component_operationsmanager_operationsmanagerlayout.md) |
| `frontend/src/component/OperationsManager/OperationsManagerNavbar.jsx` | Controls/fields inventoried; parent routes traced | [component operationsmanager operationsmanagernavbar](interface/component_operationsmanager_operationsmanagernavbar.md) |
| `frontend/src/component/OperationsManager/OperationsManagerNavigation.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/OperationsManager/OperationsManagerSearch.jsx` | Controls/fields inventoried; parent routes traced | [component operationsmanager operationsmanagersearch](interface/component_operationsmanager_operationsmanagersearch.md) |
| `frontend/src/component/OperationsManager/OperationsManagerTopHeader.jsx` | Controls/fields inventoried; parent routes traced | [component operationsmanager operationsmanagertopheader](interface/component_operationsmanager_operationsmanagertopheader.md) |
| `frontend/src/component/OrderCancellationToast.jsx` | Controls/fields inventoried; parent routes traced | [component ordercancellationtoast](interface/component_ordercancellationtoast.md) |
| `frontend/src/component/PublicMenu/MenuItemDetails.jsx` | Controls/fields inventoried; parent routes traced | [component publicmenu menuitemdetails](interface/component_publicmenu_menuitemdetails.md) |
| `frontend/src/component/PublicMenu/PlatterDetails.jsx` | Controls/fields inventoried; parent routes traced | [component publicmenu platterdetails](interface/component_publicmenu_platterdetails.md) |
| `frontend/src/component/PublicMenu/PublicMenu.jsx` | Controls/fields inventoried; parent routes traced | [component publicmenu publicmenu](interface/component_publicmenu_publicmenu.md) |
| `frontend/src/component/RistrictedAction.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/RistrictionMessage.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/shared/PortalLogoutButton.jsx` | Controls/fields inventoried; shared mounted wrapper/control; runtime Needs Verification | [component shared portallogoutbutton](interface/component_shared_portallogoutbutton.md) |
| `frontend/src/component/StaffLogin.jsx` | Controls/fields inventoried; parent routes traced | [component stafflogin](interface/component_stafflogin.md) |
| `frontend/src/component/ui/card.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/ui/ConfirmationDialog.jsx` | Controls/fields inventoried; parent routes traced | [component ui confirmationdialog](interface/component_ui_confirmationdialog.md) |
| `frontend/src/component/ui/PaginationControls.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/ui/RestaurantTableCard.jsx` | Controls/fields inventoried; parent routes traced | [component ui restauranttablecard](interface/component_ui_restauranttablecard.md) |
| `frontend/src/component/ui/RestaurantTableDetails.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/component/ui/TableWorkspaceToolbar.jsx` | Controls/fields inventoried; parent routes traced | [component ui tableworkspacetoolbar](interface/component_ui_tableworkspacetoolbar.md) |
| `frontend/src/component/waiter/AddNewItemModal.jsx` | Controls/fields inventoried; parent routes traced | [component waiter addnewitemmodal](interface/component_waiter_addnewitemmodal.md) |
| `frontend/src/component/waiter/ChangeTableModal.jsx` | Controls/fields inventoried; parent routes traced | [component waiter changetablemodal](interface/component_waiter_changetablemodal.md) |
| `frontend/src/component/waiter/HomePage.jsx` | Controls/fields inventoried; parent routes traced | [component waiter homepage](interface/component_waiter_homepage.md) |
| `frontend/src/component/waiter/OrderAddModal.jsx` | Controls/fields inventoried; parent routes traced | [component waiter orderaddmodal](interface/component_waiter_orderaddmodal.md) |
| `frontend/src/component/waiter/OrderCheckoutForm.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [component waiter ordercheckoutform](interface/component_waiter_ordercheckoutform.md) |
| `frontend/src/component/waiter/TableActionModal.jsx` | Controls/fields inventoried; parent routes traced | [component waiter tableactionmodal](interface/component_waiter_tableactionmodal.md) |
| `frontend/src/component/waiter/TablesDisplayModal.jsx` | Controls/fields inventoried; parent routes traced | [component waiter tablesdisplaymodal](interface/component_waiter_tablesdisplaymodal.md) |
| `frontend/src/config/appDownload.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/config/appEnvironment.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/config/runtimeConfig.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/config/staffRoutes.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/data/landing/landingData.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/data/landing/marketplaceData.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/hooks/presenceRuntime.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/hooks/presenceRuntimeUtils.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/hooks/useDiscoutSocket.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/hooks/useOrdersSocket.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/hooks/useRestaurantDiscovery.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/i18n.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/main.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/activity/ActivityDashboard.jsx` | Controls/fields inventoried; parent routes traced | [modules activity activitydashboard](interface/modules_activity_activitydashboard.md) |
| `frontend/src/modules/audit/auditConfig.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/audit/AuditLogPage.jsx` | Controls/fields inventoried; parent routes traced | [modules audit auditlogpage](interface/modules_audit_auditlogpage.md) |
| `frontend/src/modules/audit/components/AuditActionBadge.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/audit/components/AuditChangeDiff.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/audit/components/AuditLogDetailsModal.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/audit/components/AuditLogFilters.jsx` | Controls/fields inventoried; parent routes traced | [modules audit components auditlogfilters](interface/modules_audit_components_auditlogfilters.md) |
| `frontend/src/modules/audit/components/AuditLogTable.jsx` | Controls/fields inventoried; parent routes traced | [modules audit components auditlogtable](interface/modules_audit_components_auditlogtable.md) |
| `frontend/src/modules/audit/components/AuditTimeline.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/audit/ProductionMovementPage.jsx` | Controls/fields inventoried; parent routes traced | [modules audit productionmovementpage](interface/modules_audit_productionmovementpage.md) |
| `frontend/src/modules/contractors/components/ContractFormModal.jsx` | Controls/fields inventoried; parent routes traced | [modules contractors components contractformmodal](interface/modules_contractors_components_contractformmodal.md) |
| `frontend/src/modules/contractors/components/ContractorFormModal.jsx` | Controls/fields inventoried; parent routes traced | [modules contractors components contractorformmodal](interface/modules_contractors_components_contractorformmodal.md) |
| `frontend/src/modules/contractors/components/ContractorInvoiceDetailModal.jsx` | Controls/fields inventoried; parent routes traced | [modules contractors components contractorinvoicedetailmodal](interface/modules_contractors_components_contractorinvoicedetailmodal.md) |
| `frontend/src/modules/contractors/components/ContractorInvoiceTable.jsx` | Controls/fields inventoried; parent routes traced | [modules contractors components contractorinvoicetable](interface/modules_contractors_components_contractorinvoicetable.md) |
| `frontend/src/modules/contractors/components/ContractorPaymentModal.jsx` | Controls/fields inventoried; parent routes traced | [modules contractors components contractorpaymentmodal](interface/modules_contractors_components_contractorpaymentmodal.md) |
| `frontend/src/modules/contractors/components/ContractorProfileModal.jsx` | Controls/fields inventoried; parent routes traced | [modules contractors components contractorprofilemodal](interface/modules_contractors_components_contractorprofilemodal.md) |
| `frontend/src/modules/contractors/constants.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/contractors/ContractorWorkspace.jsx` | Controls/fields inventoried; parent routes traced | [modules contractors contractorworkspace](interface/modules_contractors_contractorworkspace.md) |
| `frontend/src/modules/contractors/hooks/useContractorWorkspace.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/contractors/pages/ContractorInvoices.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/contractors/pages/ContractorPayables.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/contractors/pages/ContractorPayments.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/contractors/pages/ContractorsDashboard.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/contractors/pages/ContractorsList.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/contractors/pages/CreateContractorInvoice.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/contractors/pages/ServiceContracts.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/contractors/services/contractorApi.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/contractors/utils/calculations.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/payroll/components/AdvanceTable.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/payroll/components/PaymentTable.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/payroll/components/PayrollPaymentModal.jsx` | Controls/fields inventoried; parent routes traced | [modules payroll components payrollpaymentmodal](interface/modules_payroll_components_payrollpaymentmodal.md) |
| `frontend/src/modules/payroll/components/PayrollTable.jsx` | Controls/fields inventoried; parent routes traced | [modules payroll components payrolltable](interface/modules_payroll_components_payrolltable.md) |
| `frontend/src/modules/payroll/components/SalaryAdvanceModal.jsx` | Controls/fields inventoried; parent routes traced | [modules payroll components salaryadvancemodal](interface/modules_payroll_components_salaryadvancemodal.md) |
| `frontend/src/modules/payroll/constants.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/payroll/hooks/usePayrollWorkspace.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/payroll/pages/EmployeeSalaryProfile.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/payroll/pages/PayrollDashboard.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/payroll/pages/PayrollPayments.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/payroll/pages/PayrollRecordDetail.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/payroll/pages/PayrollRecords.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/payroll/pages/PayrollRun.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/payroll/pages/SalaryAdvances.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/payroll/PayrollWorkspace.jsx` | Controls/fields inventoried; parent routes traced | [modules payroll payrollworkspace](interface/modules_payroll_payrollworkspace.md) |
| `frontend/src/modules/payroll/services/payrollApi.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/procurement/components/PaymentVoucherModal.jsx` | Controls/fields inventoried; parent routes traced | [modules procurement components paymentvouchermodal](interface/modules_procurement_components_paymentvouchermodal.md) |
| `frontend/src/modules/procurement/components/PurchaseAttachmentList.jsx` | Controls/fields inventoried; parent routes traced | [modules procurement components purchaseattachmentlist](interface/modules_procurement_components_purchaseattachmentlist.md) |
| `frontend/src/modules/procurement/components/PurchaseInvoiceDetailModal.jsx` | Controls/fields inventoried; parent routes traced | [modules procurement components purchaseinvoicedetailmodal](interface/modules_procurement_components_purchaseinvoicedetailmodal.md) |
| `frontend/src/modules/procurement/components/PurchaseInvoiceLinesTable.jsx` | Controls/fields inventoried; parent routes traced | [modules procurement components purchaseinvoicelinestable](interface/modules_procurement_components_purchaseinvoicelinestable.md) |
| `frontend/src/modules/procurement/components/PurchaseInvoiceTable.jsx` | Controls/fields inventoried; parent routes traced | [modules procurement components purchaseinvoicetable](interface/modules_procurement_components_purchaseinvoicetable.md) |
| `frontend/src/modules/procurement/components/PurchaseLineEditor.jsx` | Controls/fields inventoried; parent routes traced | [modules procurement components purchaselineeditor](interface/modules_procurement_components_purchaselineeditor.md) |
| `frontend/src/modules/procurement/components/PurchasePaymentHistory.jsx` | Controls/fields inventoried; parent routes traced | [modules procurement components purchasepaymenthistory](interface/modules_procurement_components_purchasepaymenthistory.md) |
| `frontend/src/modules/procurement/components/SupplierFormModal.jsx` | Controls/fields inventoried; parent routes traced | [modules procurement components supplierformmodal](interface/modules_procurement_components_supplierformmodal.md) |
| `frontend/src/modules/procurement/components/SupplierPaymentModal.jsx` | Controls/fields inventoried; parent routes traced | [modules procurement components supplierpaymentmodal](interface/modules_procurement_components_supplierpaymentmodal.md) |
| `frontend/src/modules/procurement/components/SupplierProfileModal.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/procurement/constants.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/procurement/hooks/useProcurementWorkspace.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/procurement/pages/CreatePurchaseInvoice.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/procurement/pages/OutstandingPayables.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/procurement/pages/ProcurementDashboard.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/procurement/pages/PurchaseInvoices.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/procurement/pages/SupplierPayments.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/procurement/pages/Suppliers.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/procurement/ProcurementWorkspace.jsx` | Controls/fields inventoried; parent routes traced | [modules procurement procurementworkspace](interface/modules_procurement_procurementworkspace.md) |
| `frontend/src/modules/procurement/services/procurementApi.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/procurement/utils/calculations.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/shared/erp/components/ActionButton.jsx` | Controls/fields inventoried; parent routes traced | [modules shared erp components actionbutton](interface/modules_shared_erp_components_actionbutton.md) |
| `frontend/src/modules/shared/erp/components/Alert.jsx` | Controls/fields inventoried; parent routes traced | [modules shared erp components alert](interface/modules_shared_erp_components_alert.md) |
| `frontend/src/modules/shared/erp/components/AttachmentPreviewModal.jsx` | Controls/fields inventoried; parent routes traced | [modules shared erp components attachmentpreviewmodal](interface/modules_shared_erp_components_attachmentpreviewmodal.md) |
| `frontend/src/modules/shared/erp/components/ConfirmModal.jsx` | Controls/fields inventoried; parent routes traced | [modules shared erp components confirmmodal](interface/modules_shared_erp_components_confirmmodal.md) |
| `frontend/src/modules/shared/erp/components/DataTable.jsx` | Controls/fields inventoried; parent routes traced | [modules shared erp components datatable](interface/modules_shared_erp_components_datatable.md) |
| `frontend/src/modules/shared/erp/components/EmptyState.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/shared/erp/components/Field.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/shared/erp/components/FileUploader.jsx` | Controls/fields inventoried; parent routes traced | [modules shared erp components fileuploader](interface/modules_shared_erp_components_fileuploader.md) |
| `frontend/src/modules/shared/erp/components/FormSection.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/shared/erp/components/LoadingState.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/shared/erp/components/MiniBarChart.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/shared/erp/components/Modal.jsx` | Controls/fields inventoried; parent routes traced | [modules shared erp components modal](interface/modules_shared_erp_components_modal.md) |
| `frontend/src/modules/shared/erp/components/PageHeader.jsx` | Controls/fields inventoried; parent routes traced | [modules shared erp components pageheader](interface/modules_shared_erp_components_pageheader.md) |
| `frontend/src/modules/shared/erp/components/Panel.jsx` | Controls/fields inventoried; parent routes traced | [modules shared erp components panel](interface/modules_shared_erp_components_panel.md) |
| `frontend/src/modules/shared/erp/components/SearchBox.jsx` | Controls/fields inventoried; parent routes traced | [modules shared erp components searchbox](interface/modules_shared_erp_components_searchbox.md) |
| `frontend/src/modules/shared/erp/components/StatCard.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/shared/erp/components/StatusBadge.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/shared/erp/components/TablePagination.jsx` | Controls/fields inventoried; parent routes traced | [modules shared erp components tablepagination](interface/modules_shared_erp_components_tablepagination.md) |
| `frontend/src/modules/shared/erp/components/Timeline.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/shared/erp/components/Toolbar.jsx` | Controls/fields inventoried; parent routes traced | [modules shared erp components toolbar](interface/modules_shared_erp_components_toolbar.md) |
| `frontend/src/modules/shared/erp/constants.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/modules/shared/erp/formatters.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/PageNotFound.jsx` | Controls/fields inventoried; parent routes traced | [pagenotfound](interface/pagenotfound.md) |
| `frontend/src/pages/AboutPage.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/pages/FounderPage.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/pages/landing/LandingPage.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/pages/landing/SmoothMarketplace.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/pages/LegalPage.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/pages/PremiumAboutPage.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/pages/PremiumFounderPage.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/pages/PremiumLegalPage.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/RestaurantNotFoundPage.jsx` | Controls/fields inventoried; parent routes traced | [restaurantnotfoundpage](interface/restaurantnotfoundpage.md) |
| `frontend/src/rootLayout.jsx` | Controls/fields inventoried; shared mounted wrapper/control; runtime Needs Verification | [rootlayout](interface/rootlayout.md) |
| `frontend/src/routing/AppDomainGuard.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/seo/Seo.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/seo/seoConfig.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/SubscriptionInactive.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/superAdmin/RestaurantCard.jsx` | Controls/fields inventoried; parent routes traced | [superadmin restaurantcard](interface/superadmin_restaurantcard.md) |
| `frontend/src/superAdmin/RestaurantModal.jsx` | Controls/fields inventoried; parent routes traced | [superadmin restaurantmodal](interface/superadmin_restaurantmodal.md) |
| `frontend/src/superAdmin/RestaurantsList.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/superAdmin/SubscriptionModal.jsx` | Controls/fields inventoried; parent routes traced | [superadmin subscriptionmodal](interface/superadmin_subscriptionmodal.md) |
| `frontend/src/superAdmin/SuperAdminMain.jsx` | Controls/fields inventoried; parent routes traced | [superadmin superadminmain](interface/superadmin_superadminmain.md) |
| `frontend/src/SystemLanding.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/tailwind.config.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/theme/ThemeContext.jsx` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/theme/themeRuntime.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |
| `frontend/src/theme/ThemeSwitcher.jsx` | Controls/fields inventoried; no mounted route traced; Needs Verification | [theme themeswitcher](interface/theme_themeswitcher.md) |
| `frontend/src/utils/orderSnapshot.js` | Marketing/analytics visualization or noninteractive supporting source; no additional operator page inferred | [page directory](../navigation/page_directory.md) |

## Django application sources

| Source | Disposition |
|---|---|
| `backend/backend/audit/admin.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/audit/apps.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/audit/constants.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/audit/models.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/audit/serializers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/audit/services.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/audit/tests.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/audit/urls.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/audit/views.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/audit/__init__.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/contractors/admin.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/contractors/apps.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/contractors/models.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/contractors/serializers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/contractors/services.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/contractors/urls.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/contractors/views.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/contractors/__init__.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/customers/admin.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/customers/apps.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/customers/consumers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/customers/marketplace.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/customers/models.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/customers/routing.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/customers/serializers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/customers/tests.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/customers/urls.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/customers/views.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/customers/__init__.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/expenses/admin.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/expenses/apps.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/expenses/models.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/expenses/serializers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/expenses/signals.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/expenses/tests.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/expenses/urls.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/expenses/views.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/expenses/__init__.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/inventory/admin.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/inventory/apps.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/inventory/models.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/inventory/pagination.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/inventory/serializers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/inventory/services.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/inventory/tests.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/inventory/urls.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/inventory/utils.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/inventory/views.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/inventory/__init__.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/menu/admin.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/menu/apps.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/menu/models.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/menu/permissions.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/menu/production_utils.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/menu/public_serializers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/menu/serializers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/menu/services.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/menu/signals.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/menu/tests.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/menu/test_production_movements.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/menu/urls.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/menu/views.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/menu/__init__.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/orders/admin.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/orders/apps.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/orders/consumers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/orders/models.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/orders/routing.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/orders/seriailizers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/orders/signals.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/orders/tests.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/orders/urls.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/orders/views.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/orders/__init__.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/orders/utils/distance.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/otp/admin.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/otp/apps.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/otp/models.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/otp/serializers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/otp/services.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/otp/sms_backends.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/otp/tests.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/otp/urls.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/otp/views.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/otp/__init__.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/procurement/urls.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/procurement/__init__.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/admin.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/apps.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/menu_item_views.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/models.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/serializers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/tests.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/reports/test_dashboard_sales.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/reports/urls.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/views.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/__init__.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/services/customers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/services/dashboard_sales.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/services/finance.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/services/inventory.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/services/menu_items.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/services/orders.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/reports/services/staff.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/restaurants/admin.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/restaurants/apps.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/restaurants/branching.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/restaurants/data_migration.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/restaurants/enterprise.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/restaurants/models.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/restaurants/permissions.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/restaurants/serializers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/restaurants/tests.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/restaurants/test_discovery.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/restaurants/urls.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/restaurants/views.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/restaurants/__init__.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/system/admin.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/system/apps.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/system/models.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/system/serializers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/system/tests.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/system/urls.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/system/views.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/system/__init__.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/admin.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/apps.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/authentication.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/consumers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/login_rate_limit.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/models.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/payroll_services.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/permissions.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/presence.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/routing.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/serializers.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/session_tokens.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/session_views.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/signals.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/tests.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/users/test_activity.py` | Existing tests inspected as supporting evidence; not executed against a database |
| `backend/backend/users/urls.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/views.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |
| `backend/backend/users/__init__.py` | Parsed declarations/behavior; relevant contracts indexed by module; no extra UI inferred |

## Flutter customer client

The mobile client is customer-only; no additional staff portal was found. Its routes, checkout/retry and order handoff are covered in [customer handoff](../modules/public_ordering/customer_handoff.md). Operator action/field counts concern React staff/public handoff references; customer-only Flutter widgets are excluded from staff training counts.

| Source | Scope |
|---|---|
| `app/lib/app/app.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/app/bootstrap/app_bootstrap.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/app/bootstrap/app_preferences_controller.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/app/router/app_router.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/app/router/app_routes.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/app/router/main_navigation_shell.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/api/api_client.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/api/api_endpoints.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/api/api_error_mapper.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/api/api_exception.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/auth/session_events.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/config/app_config.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/constants/app_constants.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/errors/app_exception.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/errors/customer_error_message.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/storage/preferences_service.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/storage/secure_storage_service.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/theme/app_colors.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/theme/app_radius.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/theme/app_shadows.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/theme/app_spacing.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/theme/app_theme.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/theme/app_typography.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/theme/premium_theme.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/utils/currency_formatter.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/utils/json_parsing.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/app_badge.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/app_buttons.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/app_scaffold.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/app_text_field.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/app_top_bar.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/bottom_sheet_container.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/brand_mark.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/divider_row.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/form_feedback.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/network_image_view.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/pressable_scale.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/price_text.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/quantity_stepper.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/search_field.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/section_header.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/skeleton_card.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/core/widgets/state_views.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/addresses/application/customer_addresses_controller.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/addresses/application/delivery_location_controller.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/addresses/data/address_repository.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/addresses/data/location_service.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/addresses/domain/customer_address.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/addresses/domain/delivery_location.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/addresses/domain/delivery_point.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/addresses/presentation/address_editor.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/addresses/presentation/addresses_screen.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/addresses/presentation/delivery_map.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/auth/application/auth_controller.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/auth/data/auth_repository.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/auth/domain/auth_status.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/auth/presentation/auth_validators.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/auth/presentation/forgot_password_screen.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/auth/presentation/guest_gate.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/auth/presentation/login_screen.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/auth/presentation/register_screen.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/auth/presentation/widgets/auth_layout.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/cart/application/cart_controller.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/cart/data/cart_repository.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/cart/domain/cart_models.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/cart/presentation/cart_actions.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/cart/presentation/cart_screen.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/cart/presentation/widgets/contextual_cart_bar.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/checkout/presentation/checkout_address_card.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/checkout/presentation/checkout_screen.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/customers/application/customer_providers.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/customers/data/customer_repository.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/customers/domain/customer_models.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/home/presentation/home_screen.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/home/presentation/widgets/restaurant_preview_card.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/marketplace/application/marketplace_providers.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/marketplace/data/marketplace_repository.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/marketplace/domain/discovery_data.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/marketplace/domain/menu_models.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/marketplace/domain/restaurant_models.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/marketplace/presentation/widgets/branch_selector_sheet.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/marketplace/presentation/widgets/discovery_dish_card.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/marketplace/presentation/widgets/menu_item_card.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/marketplace/presentation/widgets/menu_item_sheet.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/marketplace/presentation/widgets/restaurant_cards.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/marketplace/presentation/widgets/restaurant_status_badge.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/orders/application/order_providers.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/orders/data/order_repository.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/orders/data/pending_order_store.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/orders/domain/order_models.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/orders/presentation/order_detail_screen.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/orders/presentation/order_status_label.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/orders/presentation/order_success_screen.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/orders/presentation/orders_screen.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/profile/presentation/profile_screen.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/restaurants/presentation/restaurant_screen.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/search/application/recent_searches_controller.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/search/presentation/search_screen.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/features/startup/presentation/startup_screen.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/l10n/app_localizations.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/l10n/app_localizations_en.dart` | Customer client / supporting code; no staff operating page |
| `app/lib/main.dart` | Customer client / supporting code; no staff operating page |

Environment files, secrets, generated dependencies, build assets and production data were not used as documentation content. Migrations establish schema history rather than new operator workflows; current models/serializers are primary evidence.
