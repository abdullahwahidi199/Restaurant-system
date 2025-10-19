import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import './App.css'
import './forTailwind.css';
import RootLayout from './rootLayout'
import AdminDashboard from './component/Admin/adminDashboard';

import Attendance from './component/Admin/attendance';
import StaffManagement from './component/Admin/staff/StaffManagement';
import Shifts from './component/Admin/shift/shifts';
import Dashboard from './component/Admin/dashboard/DashboardBase';
import Menu from './component/Admin/MenuManagement/MenuBaseModal';
import IndividaulItem from './component/Admin/MenuManagement/individualItem';
import OrderBase from './component/Admin/order/OrderBase';

import TableBaseModal from './component/Admin/tables/TableBase';
import HomePage from './component/waiter/HomePage';
import KitchenHomepage from './component/kitchen/Homepage';





function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout />}>
        <Route path='admin/dashboard' element={<AdminDashboard />}>
          <Route index element={<Dashboard />} />
          <Route path='attendance' element={<Attendance />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="shifts" element={<Shifts/>}/>
          <Route path='menu' element={<Menu/>}/>
          <Route path='menu/item/:id' element={<IndividaulItem/>}/>
          <Route path="orders" element={<OrderBase/>}/>
          <Route path='tables' element={<TableBaseModal/>}/>
        </Route>

        <Route path='waiter'>
          <Route index element={<HomePage/>}/>
        </Route>

        <Route path='kitchen'>
          <Route index element={<KitchenHomepage/>}/>
        </Route>
        
      </Route>

    )
  )
  return (

    <RouterProvider router={router} />

  )
}

export default App
