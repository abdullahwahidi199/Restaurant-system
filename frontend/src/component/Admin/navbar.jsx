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
  Receipt,
  Table2,
  Settings,
  User,
  X,
  BarChart,
  Star,
  Wallet,
  Package,
} from "lucide-react";
import { useTranslation } from "react-i18next";
function Navbar() {
  const [isOpen, setIsOpen] = useState(true);
  const toggleMenu = () => setIsOpen(!isOpen);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  const navItems = [
    {
      to: "/admin/dashboard",
      label: t("nav.dashboard"),
      icon: <LayoutDashboard size={18} />,
    },
    {
      to: "/admin/dashboard/attendance",
      label: t("nav.attendance"),
      icon: <CalendarCheck size={18} />,
    },
    {
      to: "/admin/dashboard/staff",
      label: t("nav.staff"),
      icon: <Users size={18} />,
    },
    {
      to: "/admin/dashboard/shifts",
      label: t("nav.shifts"),
      icon: <Clock size={18} />,
    },
    {
      to: "/admin/dashboard/menu",
      label: t("nav.menu"),
      icon: <Utensils size={18} />,
    },
    {
      to: "/admin/dashboard/orders",
      label: t("nav.orders"),
      icon: <Receipt size={18} />,
    },
    {
      to: "/admin/dashboard/tables",
      label: t("nav.tables"),
      icon: <Table2 size={18} />,
    },
    {
      to: "/admin/dashboard/expenses",
      label: t("nav.expenses"),
      icon: <Wallet size={18} />,
    },
    {
      to: "/admin/dashboard/reservations",
      label: "Reservations",
      icon: <Wallet size={18} />,
    },
    {
      to: "/admin/dashboard/reports",
      label: t("nav.reports"),
      icon: <BarChart size={18} />,
    },
    {
      to: "/admin/dashboard/settings",
      label: t("nav.settings"),
      icon: <Settings size={18} />,
    },
    {
      to: "/admin/dashboard/customers",
      label: t("nav.customers"),
      icon: <User size={18} />,
    },

    {
      to: "/admin/dashboard/feedbacks",
      label: t("nav.feedbacks"),
      icon: <Star size={18} />,
    },
    {
      to: "/admin/dashboard/inventory",
      label: t("nav.inventory"),
      icon: <Package size={18} />,
    },
  ];

  return (
    <nav
      dir={isRTL ? "rtl" : "ltr"}
      className={`bg-gray-200 shadow-lg border border-t-0 border-r-gray-500 fixed md:static z-50 transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      } h-screen flex flex-col`}
    >
      <div className="flex items-center justify-between bg-white px-4 py-4 border-b border-gray-500 flex-shrink-0">
        <h1
          className={`text-2xl font-bold text-gray-800 transition-all duration-300 ${!isOpen && "opacity-0 hidden"}`}
        >
          {t("nav.admin")}
        </h1>
        <button
          className="text-gray-700 cursor-pointer hover:text-gray-900 transition"
          onClick={toggleMenu}
        >
          {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Scrollable Menu */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto">
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
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
