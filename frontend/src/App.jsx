import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import "./forTailwind.css";
import RootLayout from "./rootLayout";
import AdminDashboard from "./component/Admin/adminDashboard";

import Attendance from "./component/Admin/attendance";
import StaffManagement from "./component/Admin/staff/StaffManagement";
import Shifts from "./component/Admin/shift/shifts";
import Dashboard from "./component/Admin/dashboard/DashboardBase";
import Menu from "./component/Admin/MenuManagement/MenuBaseModal";
// import IndividaulItem from './component/Admin/MenuManagement/IndividualItem';
import IndividaulItem from "./component/Admin/MenuManagement/IndividualItem";
import OrderBase from "./component/Admin/order/OrderBase";

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
import InventoryDashboard from "./component/Admin/Inventory/InventoryDashboard";
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
import BranchSelectionPage from "./component/branch/BranchSelectionPage";

const BASE_URL = import.meta.env.VITE_API_URL;

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route index element={<SystemLanding />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="founder" element={<FounderPage />} />
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
          <Route path="menu/item/:id" element={<IndividaulItem />} />
          <Route path="platters" element={<Platters />} />

          <Route path="menu/platter/:id" element={<PlatterDetails />} />
          <Route path="daily_production" element={<DailyProduction />} />
          <Route path="orders" element={<OrderBase />} />
          <Route path="tables" element={<TableBaseModal />} />
          <Route path="expenses" element={<ExpensesMain />} />
          <Route path="expenses/history" element={<ExpenseHistory />} />
          <Route path="expenses/:id" element={<IndividualExpense />} />
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
          <Route path="reservations" element={<ReservationsMainPage />} />
          <Route path="inventory" element={<InventoryDashboard />} />
          {/* <Route path="customers" element={<CustomersBaseModal />} /> */}
          <Route path="feedbacks" element={<Feedbacks />} />
          <Route path="settings" element={<RestaurantSettings />} />
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
          {/* <Route index element={<ManagerDashboard />} /> */}
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
          <Route index element={<InventoryDashboard />} />
          <Route path="menu" element={<Menu />} />
          <Route path="tables" element={<TableBaseModal />} />
          <Route path="menu/item/:id" element={<IndividaulItem />} />
          <Route path="platters" element={<Platters />} />
          <Route path="menu/platter/:id" element={<PlatterDetails />} />
          <Route path="inventory" element={<InventoryDashboard />} />
          <Route path="daily-production" element={<DailyProduction />} />
          <Route path="expenses" element={<ExpensesMain />} />
          <Route path="expenses/history" element={<ExpenseHistory />} />
          <Route path="expenses/:id" element={<IndividualExpense />} />
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
