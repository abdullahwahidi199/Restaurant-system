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
import { useEffect, useState } from "react";
import Infopage from "./component/Customer/InfoPage";
import CustomerProfile from "./component/Customer/CustomerProfile";
import CustomersBaseModal from "./component/Admin/Customers/CustomersBaseModal";
import CashierManagement from "./component/Cashier/CashierManagment";
import AnalyticsBaseModal from "./component/Admin/Analytics/AnalyticsBaseModal";

import RequireAuth from "./api/ReauireAuth";
import StaffLogin from "./component/StaffLogin";
import Feedbacks from "./component/Admin/Feedbacks/FeedbackBase";
import i18n from "./i18n";
import RistrictionMessage from "./component/RistrictionMessage";
import InventoryDashboard from "./component/Admin/Inventory/InventoryDashboard";
import TakeAwayForm from "./component/Cashier/components/TakeAwayOrderForm";
import OrderAddModal from "./component/waiter/OrderAddModal";
import ReportsMainPage from "./component/Admin/Reports/ReportsMainPage";
import SuperAdminMain from "./superAdmin/SuperAdminMain";
import SystemLanding from "./SystemLanding";
import ExpensesMain from "./component/Admin/Expenses/ExpensesMain";
import ExpenseHistory from "./component/Admin/Expenses/expensesHistory";
import IndividualExpense from "./component/Admin/Expenses/IndividualExpense";
import AddReservation from "./component/Cashier/components/AddReservation";
import ReservationsList from "./component/Cashier/components/ReservationsList";
import RequireActiveRestaurant from "./api/RequireActiveRestaurant";
import SubscriptionInactive from "./SubscriptionInactive";
import ReservationsMainPage from "./component/Admin/Reservations/ReservationsMainPage";

const BASE_URL = import.meta.env.VITE_API_URL;

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route index element={<SystemLanding />} />
        <Route path=":slug">
          <Route index element={<CustomerHomepage />} />
          <Route path="signup" element={<CustomerSignUpModal />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="login" element={<Login />} />
          <Route path="info" element={<Infopage />} />
        </Route>

        <Route path="staff-login" element={<StaffLogin />} />
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
            <RequireAuth allowedRoles={["Admin"]}>
              <RequireActiveRestaurant>
                <AdminDashboard />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="shifts" element={<Shifts />} />
          <Route path="menu" element={<Menu />} />
          <Route path="menu/item/:id" element={<IndividaulItem />} />
          <Route path="orders" element={<OrderBase />} />
          <Route path="tables" element={<TableBaseModal />} />
          <Route path="expenses" element={<ExpensesMain />} />
          <Route path="expenses/history" element={<ExpenseHistory />} />
          <Route path="expenses/history/:id" element={<IndividualExpense />} />
          <Route path="reports" element={<ReportsMainPage />} />
          <Route path="reservations" element={<ReservationsMainPage />} />
          <Route path="inventory" element={<InventoryDashboard />} />
          <Route path="customers" element={<CustomersBaseModal />} />
          <Route path="feedbacks" element={<Feedbacks />} />
          <Route path="settings" element={<RestaurantSettings />} />
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
                <KitchenHomepage />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        ></Route>

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
          path="cashier/reservations"
          element={
            <RequireAuth allowedRoles={["Cashier"]}>
              <RequireActiveRestaurant>
                <ReservationsList />
              </RequireActiveRestaurant>
            </RequireAuth>
          }
        />
        <Route
          path="subscription-inactive"
          element={<SubscriptionInactive />}
        />
      </Route>,
    ),
  );
  return <RouterProvider router={router} />;
}

export default App;
