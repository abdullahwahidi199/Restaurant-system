import React, { lazy, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Clock,
  Utensils,
  Info,
  Menu as MenuIcon,
  Receipt,Table2,
  Settings,
  User,
  X,
  BarChart,
  Star
  
} from "lucide-react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(true); 
  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/admin/dashboard/attendance", label: "Attendance", icon: <CalendarCheck size={18} /> },
    { to: "/admin/dashboard/staff", label: "Staff", icon: <Users size={18} /> },
    { to: "/admin/dashboard/shifts", label: "Shifts", icon: <Clock size={18} /> },
    { to: "/admin/dashboard/menu", label: "Menu", icon: <Utensils size={18} /> },
    {to:"/admin/dashboard/orders",label:"Orders",icon:<Receipt size={18}/>},
    {to:"/admin/dashboard/tables",label:"Tables ",icon:<Table2 size={18}/>},
    {to:"/admin/dashboard/settings",label:"Settings",icon:<Settings size={18}/>},
    {to:"/admin/dashboard/customers",label:"Customers",icon:<User size={18}/>},
    {to:"/admin/dashboard/analytics",label:"Analytics",icon:<BarChart size={18}/>},
    {to:"/admin/dashboard/feedbacks",label:"Feedbacks",icon:<Star size={18}/>}
  ];

  return (
    <nav
      className={`bg-gray-200 shadow-lg border border-t-0 border-r-gray-500 fixed md:static z-50 transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between bg-white px-4 py-4 border-b border-gray-500">
        <h1 className={`text-2xl font-bold text-gray-800 transition-all duration-300 ${!isOpen && "opacity-0 hidden"}`}>
          Admin
        </h1>
        <button
          className="text-gray-700 cursor-pointer hover:text-gray-900 transition"
          onClick={toggleMenu}
        >
          {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {isOpen && (
        <>
          <ul className="py-4 space-y-2 md:space-y-1">
            {navItems.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-gray-200 text-gray-900 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  {icon}
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
            <li className="flex items-center gap-3 px-5 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg cursor-pointer transition">
              <Info size={18} />
              <span>About</span>
            </li>
          </ul>

          <div className="px-5 py-4 border-t border-gray-100 text-gray-500 text-sm cursor-pointer hover:text-gray-700 transition">
            Info
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
