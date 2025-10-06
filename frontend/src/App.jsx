import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import './App.css'
import './forTailwind.css';
import RootLayout from './rootLayout'
import AdminDashboard from './component/Admin/adminDashboard';
import HomePage from './component/Admin/home';
import Attendance from './component/Admin/attendance';
import StaffManagement from './component/Admin/staff/StaffManagement';


function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout />}>
        <Route path='admin/dashboard' element={<AdminDashboard />}>
          <Route index element={<HomePage />} />
          <Route path='attendance' element={<Attendance />} />
          <Route path="staff" element={<StaffManagement />} />

        </Route>
        
      </Route>

    )
  )
  return (

    <RouterProvider router={router} />

  )
}

export default App
