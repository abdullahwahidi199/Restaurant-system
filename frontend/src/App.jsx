import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import "./forTailwind.css";
import "./styles/theme.css";
import RootLayout from "./rootLayout";
import AdminDashboard from "./component/Admin/adminDashboard";

import Attendance from "./component/Admin/attendance";
import StaffManagement from "./component/Admin/staff/StaffManagement";
import Shifts from "./component/Admin/shift/shifts";
import Dashboard from "./component/Admin/dashboard/DashboardBase";
import Menu from "./component/Admin/MenuManagement/MenuBaseModal";
import IndividaulItem from "./component/Admin/MenuManagement/IndividualItem";
import OrderBase from "./component/Admin/order/OrderBase";
import StationManagement from "./component/Admin/stations/StationsManagement";

import TableBaseModal from "./component/Admin/tables/TableBase";
import HomePage from "./component/waiter/HomePage";
import KitchenHomepage from "./component/kitchen/Homepage";
import CustomerHomepage from "./component/Customer/HomePage";
import CustomerSignUpModal from "./component/Customer/CustomerSignupModal";
import Login from "./component/Customer/CustomerLoginModal";
import Orders from "./component/Customer/Orders";
import RestaurantSettings from "./component/Admin/settings/SettingsBaseModal";
import Infopage from "./component/Customer/InfoPage";
import CustomerProfile from "./component/Customer/CustomerProfile";
import CashierManagement from "./component/Cashier/CashierManagment";
import AnalyticsBaseModal from "./component/Admin/Analytics/AnalyticsBaseModal";

import RequireAuth from "./api/ReauireAuth";
import StaffLogin from "./component/StaffLogin";
import Feedbacks from "./component/Admin/Feedbacks/FeedbackBase";
import {
  IngredientsPage,
  InventoryOverviewPage,
  InventoryReportsPage,
  LowStockAlertsPage,
  StockAdjustmentsPage,
  StockLevelsPage,
  StockMovementsPage,
} from "./component/Admin/Inventory/InventoryPages";
import {
  CreatePurchaseInvoicePage,
  OutstandingPayablesPage,
  ProcurementDashboardPage,
  PurchaseInvoiceDetailPage,
  PurchaseInvoicesPage,
  SupplierPaymentsPage,
  SupplierProfilePage,
  SuppliersPage,
} from "./component/Admin/Procurement/ProcurementWorkspace";
import {
  ContractorDashboardPage,
  ContractorInvoiceDetailPage,
  ContractorInvoicesPage,
  ContractorPayablesPage,
  ContractorPaymentsPage,
  ContractorProfilePage,
  ContractorsPage,
  CreateContractorInvoicePage,
  ServiceContractsPage,
} from "./component/Admin/Contractors/ContractorWorkspace";
import {
  EmployeeSalaryProfilePage,
  PayrollAdvancesPage,
  PayrollDashboardPage,
  PayrollPaymentsPage,
  PayrollRecordDetailPage,
  PayrollRecordsPage,
  PayrollRunPage,
} from "./component/Admin/PayrollWorkspace";
import TakeAwayForm from "./component/Cashier/components/TakeAwayOrderForm";
import OrderAddModal from "./component/waiter/OrderAddModal";
import ReportsMainPage from "./component/Admin/Reports/ReportsMainPage";
import SuperAdminMain from "./superAdmin/SuperAdminMain";
import SystemLanding from "./SystemLanding";
import AboutPage from "./pages/AboutPage";
import FounderPage from "./pages/FounderPage";
import ExpensesMain from "./component/Admin/Expenses/ExpensesMain";
import ExpenseHistory from "./component/Admin/Expenses/ExpensesHistory";
import IndividualExpense from "./component/Admin/Expenses/IndividualExpense";
import AddReservation from "./component/Cashier/components/AddReservation";
import ReservationsList from "./component/Cashier/components/ReservationsList";
import RequireActiveRestaurant from "./api/RequireActiveRestaurant";
import SubscriptionInactive from "./SubscriptionInactive";
import ReservationsMainPage from "./component/Admin/Reservations/ReservationsMainPage";
import PublicMenu from "./component/PublicMenu/PublicMenu";
import MenuItemDetails from "./component/PublicMenu/MenuItemDetails";
import ManagerRootLayout from "./component/Manager/ManagerRootLayout";
import ManagerOrderBase from "./component/Manager/orders/ManagerOrdersBase";
import ManagerReservationBase from "./component/Manager/reservations/ManagerReservationsBase";
import ManagerOrderAddModal from "./component/Manager/tables/ManagerAddOrder";
import ManagerTablesHome from "./component/Manager/tables/ManagerTablesHome";
import KitchenManagerStockDashboard from "./component/kitchen/Stock/KitchenManagerStockDashboard";
import KitchenManagerMenu from "./component/kitchen/Menu/MenuBase";
import KitchenManagerItemDetails from "./component/kitchen/Menu/IndividualItem";
import KitchenRootLoyout from "./component/kitchen/KitchenRootLoyout";
import DiscountRequestMain from "./component/Manager/DiscountRequest/DiscountRequestMain";
import AdminDiscountsMain from "./component/Admin/Discounts/AdminDiscountsMain";
import AllDiscounts from "./component/Admin/Discounts/AllDiscounts";
import DeliveryOrderForm from "./component/Cashier/components/DeliveryOrderForm";
import PlatterDetails from "./component/Admin/MenuManagement/PlatterDetails";
import PublicPlatterDetails from "./component/PublicMenu/PlatterDetails";
import Platters from "./component/Admin/MenuManagement/Platters";
import NotFound from "./PageNotFound";
import OnlinePlatterDetails from "./component/Customer/OnlinePlatterDetails";
import OnlineMenuItemDetails from "./component/Customer/OnlineMenuDetails";
import DiscountCardsMain from "./component/Admin/DiscountCards/DiscountCardsMain";
import CreateDiscountCard from "./component/Admin/DiscountCards/CreateDiscountCard";
import DiscountCardDetails from "./component/Admin/DiscountCards/DiscountCardDetails";
import DiscountCardEdit from "./component/Admin/DiscountCards/DiscountCardEdit";
import ReadyOrders from "./component/kitchen/ReadyOrders";
import DailyProduction from "./component/Admin/DailyProduction/DailyProduction";
import InventoryManagerRoot from "./component/InventoryManager/InventoryManagerRoot";
import BranchManagement from "./component/Admin/branches/BranchManagement";
import AuditLogPage from "./modules/audit/AuditLogPage";
import BranchSelectionPage from "./component/branch/BranchSelectionPage";
import FinanceManagerLayout from "./component/FinanceManager/FinanceManagerLayout";
import OperationsManagerLayout from "./component/OperationsManager/OperationsManagerLayout";

const BASE_URL = import.meta.env.VITE_API_URL;

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route index element={<SystemLanding />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="founder" element={<FounderPage />} />
        <Route path=":restaurantSlug/:branchSlug">
          <Route index element={<CustomerHomepage />} />
          <Route path="menu/item/:id" element={<OnlineMenuItemDetails />} />
          <Route path="menu/platter/:id" element={<OnlinePlatterDetails />} />
        </Route>

        <Route path=":slug">
          <Route index element={<CustomerHomepage />} />
          <Route path="info" element={<Infopage />} />
          <Route path="menu/item/:id" element={<OnlineMenuItemDetails />} />
          <Route path="menu/platter/:id" element={<OnlinePlatterDetails />} />
        </Route>

        <Route path="signup" element={<CustomerSignUpModal />} />
        <Route path="login" element={<Login />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="orders" element={<Orders />} />

        <Route path="staff-login" element={<StaffLogin />} />
        <Route
          path="select-branch"
          element={
            <RequireAuth>
              <BranchSelectionPage />
            </RequireAuth>
          }
        />
        <Route
          path="super-admin"
          element={
            <RequireAuth allowedRoles={["SuperAdmin"]}>
              <SuperAdminMain />
            </RequireAuth>
          }
        ></Route>
        <Route
          path="admin/dashboard"
          element={
            <RequireAuth allowedRoles={["Admin", "BranchAdmin"]}>
              <RequireActiveRestaurant>
                <AdminDashboard />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route
            path="branches"
            element={
              <RequireAuth allowedRoles={["Admin"]}>
                <BranchManagement />
              </RequireAuth>
            }
          />
          <Route path="shifts" element={<Shifts />} />
          <Route path="menu" element={<Menu />} />
          <Route path="stations" element={<StationManagement />} />
          <Route path="menu/item/:id" element={<IndividaulItem />} />
          <Route path="platters" element={<Platters />} />

          <Route path="menu/platter/:id" element={<PlatterDetails />} />
          <Route path="daily_production" element={<DailyProduction />} />
          <Route path="orders" element={<OrderBase />} />
          <Route path="tables" element={<TableBaseModal />} />
          <Route path="expenses" element={<ExpensesMain />} />
          <Route path="expenses/history" element={<ExpenseHistory />} />
          <Route path="expenses/:id" element={<IndividualExpense />} />
          <Route path="payroll" element={<PayrollDashboardPage />} />
          <Route path="payroll/run" element={<PayrollRunPage />} />
          <Route path="payroll/records" element={<PayrollRecordsPage />} />
          <Route
            path="payroll/records/:id"
            element={<PayrollRecordDetailPage />}
          />
          <Route path="payroll/advances" element={<PayrollAdvancesPage />} />
          <Route path="payroll/payments" element={<PayrollPaymentsPage />} />
          <Route
            path="payroll/employees/:id"
            element={<EmployeeSalaryProfilePage />}
          />
          <Route path="contractors" element={<ContractorDashboardPage />} />
          <Route
            path="contractors/invoices"
            element={<ContractorInvoicesPage />}
          />
          <Route
            path="contractors/invoices/new"
            element={<CreateContractorInvoicePage />}
          />
          <Route
            path="contractors/invoices/:id"
            element={<ContractorInvoiceDetailPage />}
          />
          <Route path="contractors/contractors" element={<ContractorsPage />} />
          <Route
            path="contractors/contractors/:id"
            element={<ContractorProfilePage />}
          />
          <Route
            path="contractors/contracts"
            element={<ServiceContractsPage />}
          />
          <Route
            path="contractors/payments"
            element={<ContractorPaymentsPage />}
          />
          <Route
            path="contractors/payables"
            element={<ContractorPayablesPage />}
          />
          <Route
            path="pending-discount-requests"
            element={<AdminDiscountsMain />}
          />
          <Route path="all-discount-requests" element={<AllDiscounts />} />
          <Route path="discount-cards" element={<DiscountCardsMain />} />
          <Route path="discount-cards/:id" element={<DiscountCardDetails />} />
          <Route
            path="discount-cards/:id/edit"
            element={<DiscountCardEdit />}
          />
          <Route
            path="create-discount-cards"
            element={<CreateDiscountCard />}
          />
          <Route path="reports" element={<ReportsMainPage />} />
          <Route path="audit-logs" element={<AuditLogPage />} />
          <Route path="reservations" element={<ReservationsMainPage />} />
          <Route path="procurement" element={<ProcurementDashboardPage />} />
          <Route
            path="procurement/purchase-invoices"
            element={<PurchaseInvoicesPage />}
          />
          <Route
            path="procurement/purchase-invoices/new"
            element={<CreatePurchaseInvoicePage />}
          />
          <Route
            path="procurement/purchase-invoices/:id"
            element={<PurchaseInvoiceDetailPage />}
          />
          <Route path="procurement/suppliers" element={<SuppliersPage />} />
          <Route
            path="procurement/suppliers/:id"
            element={<SupplierProfilePage />}
          />
          <Route
            path="procurement/supplier-payments"
            element={<SupplierPaymentsPage />}
          />
          <Route
            path="procurement/payables"
            element={<OutstandingPayablesPage />}
          />
          <Route path="inventory" element={<InventoryOverviewPage />} />
          <Route path="inventory/ingredients" element={<IngredientsPage />} />
          <Route path="inventory/stock-levels" element={<StockLevelsPage />} />
          <Route
            path="inventory/stock-movements"
            element={<StockMovementsPage />}
          />
          <Route
            path="inventory/stock-adjustments"
            element={<StockAdjustmentsPage />}
          />
          <Route path="inventory/low-stock" element={<LowStockAlertsPage />} />
          <Route path="inventory/reports" element={<InventoryReportsPage />} />
          <Route path="feedbacks" element={<Feedbacks />} />
          <Route path="settings" element={<RestaurantSettings />} />
          <Route path="settings/:sectionId" element={<RestaurantSettings />} />
        </Route>

        <Route
          path="manager"
          element={
            <RequireAuth allowedRoles={["Manager"]}>
              <RequireActiveRestaurant>
                <ManagerRootLayout />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        >
          <Route index element={<ManagerOrderBase />} />
          <Route path="reservations" element={<ManagerReservationBase />} />
          <Route path="tables" element={<ManagerTablesHome />} />
          <Route
            path="menu"
            element={
              <Menu
                canManage={false}
                title="Menu Management"
                description="Browse menu pricing, visibility and availability for the active branch."
              />
            }
          />
          <Route path="discount-requests" element={<DiscountRequestMain />} />
        </Route>
        <Route
          path="manager/new-order"
          element={
            <RequireAuth>
              <RequireActiveRestaurant>
                <ManagerOrderAddModal />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        />

        <Route
          path="inventory-manager"
          element={
            <RequireAuth allowedRoles={["InventoryManager"]}>
              <RequireActiveRestaurant>
                <InventoryManagerRoot />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        >
          <Route index element={<InventoryOverviewPage />} />
          <Route path="menu" element={<Menu />} />
          <Route path="stations" element={<StationManagement />} />
          <Route path="tables" element={<TableBaseModal />} />
          <Route path="menu/item/:id" element={<IndividaulItem />} />
          <Route path="platters" element={<Platters />} />
          <Route path="menu/platter/:id" element={<PlatterDetails />} />
          <Route path="inventory" element={<InventoryOverviewPage />} />
          <Route path="inventory/ingredients" element={<IngredientsPage />} />
          <Route path="inventory/stock-levels" element={<StockLevelsPage />} />
          <Route
            path="inventory/stock-movements"
            element={<StockMovementsPage />}
          />
          <Route
            path="inventory/stock-adjustments"
            element={<StockAdjustmentsPage />}
          />
          <Route path="inventory/low-stock" element={<LowStockAlertsPage />} />
          <Route path="inventory/reports" element={<InventoryReportsPage />} />
          <Route path="daily-production" element={<DailyProduction />} />
          <Route path="expenses" element={<ExpensesMain />} />
          <Route path="expenses/history" element={<ExpenseHistory />} />
          <Route path="expenses/:id" element={<IndividualExpense />} />
        </Route>

        <Route
          path="finance-manager"
          element={
            <RequireAuth allowedRoles={["FinanceManager"]}>
              <RequireActiveRestaurant>
                <FinanceManagerLayout />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        >
          <Route index element={<ExpensesMain />} />
          <Route path="expenses" element={<ExpensesMain />} />
          <Route path="expenses/history" element={<ExpenseHistory />} />
          <Route path="expenses/:id" element={<IndividualExpense />} />
          <Route path="payroll" element={<PayrollDashboardPage />} />
          <Route path="payroll/run" element={<PayrollRunPage />} />
          <Route path="payroll/records" element={<PayrollRecordsPage />} />
          <Route
            path="payroll/records/:id"
            element={<PayrollRecordDetailPage />}
          />
          <Route path="payroll/advances" element={<PayrollAdvancesPage />} />
          <Route path="payroll/payments" element={<PayrollPaymentsPage />} />
          <Route
            path="payroll/employees/:id"
            element={<EmployeeSalaryProfilePage />}
          />
          <Route path="contractors" element={<ContractorDashboardPage />} />
          <Route
            path="contractors/invoices"
            element={<ContractorInvoicesPage />}
          />
          <Route
            path="contractors/invoices/new"
            element={<CreateContractorInvoicePage />}
          />
          <Route
            path="contractors/invoices/:id"
            element={<ContractorInvoiceDetailPage />}
          />
          <Route path="contractors/contractors" element={<ContractorsPage />} />
          <Route
            path="contractors/contractors/:id"
            element={<ContractorProfilePage />}
          />
          <Route
            path="contractors/contracts"
            element={<ServiceContractsPage />}
          />
          <Route
            path="contractors/payments"
            element={<ContractorPaymentsPage />}
          />
          <Route
            path="contractors/payables"
            element={<ContractorPayablesPage />}
          />

          <Route path="procurement" element={<ProcurementDashboardPage />} />
          <Route
            path="procurement/purchase-invoices"
            element={<PurchaseInvoicesPage />}
          />
          <Route
            path="procurement/purchase-invoices/new"
            element={<CreatePurchaseInvoicePage />}
          />
          <Route
            path="procurement/purchase-invoices/:id"
            element={<PurchaseInvoiceDetailPage />}
          />
          <Route path="procurement/suppliers" element={<SuppliersPage />} />
          <Route
            path="procurement/suppliers/:id"
            element={<SupplierProfilePage />}
          />
          <Route
            path="procurement/supplier-payments"
            element={<SupplierPaymentsPage />}
          />
          <Route
            path="procurement/payables"
            element={<OutstandingPayablesPage />}
          />
          <Route path="audit-logs" element={<AuditLogPage />} />
        </Route>

        <Route
          path="operations-manager"
          element={
            <RequireAuth allowedRoles={["OperationsManager"]}>
              <RequireActiveRestaurant>
                <OperationsManagerLayout />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        >
          <Route index element={<Shifts />} />
          <Route path="shifts" element={<Shifts />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="menu" element={<Menu />} />
          <Route path="stations" element={<StationManagement />} />
          <Route path="menu/item/:id" element={<IndividaulItem />} />
          <Route path="platters" element={<Platters />} />

          <Route path="menu/platter/:id" element={<PlatterDetails />} />
          <Route path="daily_production" element={<DailyProduction />} />

          <Route path="tables" element={<TableBaseModal />} />
          <Route path="expenses" element={<ExpensesMain />} />
          <Route path="expenses/history" element={<ExpenseHistory />} />
          <Route path="expenses/:id" element={<IndividualExpense />} />

          <Route path="procurement" element={<ProcurementDashboardPage />} />
          <Route
            path="procurement/purchase-invoices"
            element={<PurchaseInvoicesPage />}
          />
          <Route
            path="procurement/purchase-invoices/new"
            element={<CreatePurchaseInvoicePage />}
          />
          <Route
            path="procurement/purchase-invoices/:id"
            element={<PurchaseInvoiceDetailPage />}
          />
          <Route path="procurement/suppliers" element={<SuppliersPage />} />
          <Route
            path="procurement/suppliers/:id"
            element={<SupplierProfilePage />}
          />
          <Route
            path="procurement/supplier-payments"
            element={<SupplierPaymentsPage />}
          />
          <Route
            path="procurement/payables"
            element={<OutstandingPayablesPage />}
          />
          <Route path="audit-logs" element={<AuditLogPage />} />
          <Route path="inventory" element={<InventoryOverviewPage />} />
          <Route path="inventory/ingredients" element={<IngredientsPage />} />
          <Route path="inventory/stock-levels" element={<StockLevelsPage />} />
          <Route
            path="inventory/stock-movements"
            element={<StockMovementsPage />}
          />
          <Route
            path="inventory/stock-adjustments"
            element={<StockAdjustmentsPage />}
          />
          <Route path="inventory/low-stock" element={<LowStockAlertsPage />} />
          <Route path="inventory/reports" element={<InventoryReportsPage />} />
        </Route>
        <Route
          path="waiter"
          element={
            <RequireAuth allowedRoles={["Waiter"]}>
              <RequireActiveRestaurant>
                <HomePage />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        />
        <Route
          path="waiter/new-order"
          element={
            <RequireAuth allowedRoles={["Waiter"]}>
              <RequireActiveRestaurant>
                <OrderAddModal />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        />

        <Route
          path="kitchen"
          element={
            <RequireAuth allowedRoles={["Kitchen_manager"]}>
              <RequireActiveRestaurant>
                <KitchenRootLoyout />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        >
          <Route index element={<KitchenHomepage />} />
          <Route path="stock" element={<KitchenManagerStockDashboard />} />
          <Route path="menu" element={<KitchenManagerMenu />} />
          <Route path="daily-production" element={<DailyProduction />} />
          <Route path="daily_production" element={<DailyProduction />} />
          <Route
            path="menu/items/:id"
            element={<KitchenManagerItemDetails />}
          />
          <Route path="ready-orders" element={<ReadyOrders />} />
        </Route>

        <Route
          path="cashier"
          element={
            <RequireAuth allowedRoles={["Cashier"]}>
              <RequireActiveRestaurant>
                <CashierManagement />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        />
        <Route
          path="call-operator"
          element={
            <RequireAuth allowedRoles={["Call_operator"]}>
              <RequireActiveRestaurant>
                <DeliveryOrderForm />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        />
        <Route
          path="cashier/takeaway"
          element={
            <RequireAuth allowedRoles={["Cashier"]}>
              <RequireActiveRestaurant>
                <TakeAwayForm />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        />
        <Route
          path="cashier/delivery"
          element={
            <RequireAuth allowedRoles={["Cashier"]}>
              <RequireActiveRestaurant>
                <DeliveryOrderForm />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        />
        <Route
          path="cashier/reservations"
          element={
            <RequireAuth allowedRoles={["Cashier"]}>
              <RequireActiveRestaurant>
                <ReservationsList />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        />
        <Route path="/menu/:slug" element={<PublicMenu />} />
        <Route path="/menu/:slug/item/:id" element={<MenuItemDetails />} />
        <Route
          path="/menu/:slug/platter/:id"
          element={<PublicPlatterDetails />}
        />
        <Route
          path="subscription-inactive"
          element={<SubscriptionInactive />}
        />
        <Route path="*" element={<NotFound />} />
      </Route>,
    ),
  );
  return <RouterProvider router={router} />;
}

export default App;
