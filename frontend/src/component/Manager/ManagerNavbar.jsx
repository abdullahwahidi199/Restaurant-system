import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { NavLink } from "react-router-dom";
export default function ManagerNavbar() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";
  const [isOpen, setIsOpen] = useState(true);
  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    {
      to: "/manager",
      label: t("nav.orders"),
      icon: <CalendarCheck size={18} />,
    },
    {
      to: "/manager/reservations",
      label: t("landing.features.groups.operations.items.reservations"),
      icon: <Users size={18} />,
    },
    {
      to: "/manager/tables",
      label: t("nav.tables"),
      icon: <Clock size={18} />,
    },
    {
      to: "/manager/menu",
      label: t("nav.menu"),
      icon: <Utensils size={18} />,
    },
    {
      to: "/manager/discount-requests",
      label: t("legacy.discount_requests_ff7e6c6c"),
      icon: <Clock size={18} />,
    },
  ];
  return (
    <nav
      dir={isRTL ? "rtl" : "ltr"}
      className={`fixed z-50 flex h-screen flex-col border-e border-[var(--theme-sidebar-border)] bg-[var(--theme-sidebar-bg)] shadow-sm transition-all duration-200 md:static ${
        isOpen ? "w-[17rem]" : "w-[4.5rem]"
      }`}
    >
      <div className={`flex min-h-[68px] flex-shrink-0 items-center border-b border-[var(--theme-sidebar-border)] px-3 ${isOpen ? "justify-between" : "justify-center"}`}>
        <h1
          className={`truncate text-base font-bold theme-text-primary transition-all duration-200 ${!isOpen && "hidden"}`}
        >
          {/* {t("nav.admin")} */}
          {t("staff.roles.manager")}
        </h1>
        <button
          type="button"
          className="theme-btn theme-btn-ghost theme-btn-icon cursor-pointer"
          onClick={toggleMenu}
          aria-label={isOpen ? t("inventory_manager.a11y.collapse_sidebar") : t("inventory_manager.a11y.expand_sidebar")}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={18} /> : <MenuIcon size={18} />}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
          <ul className="space-y-1">
            {navItems.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  title={isOpen ? undefined : label}
                  className={({ isActive }) =>
                    `flex min-h-10 items-center rounded-lg text-sm transition-colors ${isOpen ? "gap-3 px-3" : "justify-center px-2"} ${
                      isActive
                        ? "bg-[var(--theme-sidebar-active-bg)] font-semibold text-[var(--theme-sidebar-active-text)] ring-1 ring-inset ring-[var(--theme-primary)]/15"
                        : "font-medium text-[var(--theme-sidebar-text)] hover:bg-[var(--theme-hover)] hover:text-[var(--theme-text-primary)]"
                    }`
                  }
                >
                  {icon}
                  {isOpen && <span className="truncate">{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
    </nav>
  );
}
