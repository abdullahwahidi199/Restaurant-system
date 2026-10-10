import React from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  CalendarCheck,
  Clock,
  Utensils,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { NavLink } from "react-router-dom";
export default function ManagerNavbar({
  collapsed = false,
  mobileOpen = false,
  onToggleCollapse,
  onCloseMobile,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  const navItems = [
    {
      to: "/manager",
      label: t("nav.orders"),
      icon: CalendarCheck,
    },
    {
      to: "/manager/reservations",
      label: t("landing.features.groups.operations.items.reservations"),
      icon: Users,
    },
    {
      to: "/manager/tables",
      label: t("nav.tables"),
      icon: Clock,
    },
    {
      to: "/manager/menu",
      label: t("nav.menu"),
      icon: Utensils,
    },
    {
      to: "/manager/discount-requests",
      label: t("legacy.discount_requests_ff7e6c6c"),
      icon: Clock,
    },
  ];
  return (
    <>
      <button
        type="button"
        className={`admin-sidebar-backdrop ${mobileOpen ? "admin-sidebar-backdrop-open" : ""}`}
        onClick={onCloseMobile}
        aria-label={t("menuDetails.close")}
      />
      <nav
        dir={isRTL ? "rtl" : "ltr"}
        className={`admin-sidebar ${collapsed ? "admin-sidebar-collapsed" : "admin-sidebar-expanded"} ${mobileOpen ? "admin-sidebar-mobile-open" : ""}`}
      >
      <div className="admin-sidebar-brand">
        <div className="admin-brand-content">
          <span className="admin-brand-mark">M</span>
          {!collapsed && <div className="admin-brand-copy"><span className="admin-brand-title">{t("staff.roles.manager")}</span><span className="admin-brand-subtitle">Pakhlai RMS</span></div>}
        </div>
        <button
          type="button"
          className="admin-sidebar-collapse"
          onClick={onToggleCollapse}
          aria-label={collapsed ? t("inventory_manager.a11y.expand_sidebar") : t("inventory_manager.a11y.collapse_sidebar")}
          aria-expanded={!collapsed}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
        <button type="button" className="admin-sidebar-mobile-close" onClick={onCloseMobile} aria-label={t("menuDetails.close")}>
          <X size={16} />
        </button>
      </div>

      <div className="admin-sidebar-scroll">
          <ul className="admin-tree-list admin-tree-level-0">
            {navItems.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  title={collapsed ? label : undefined}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `admin-nav-row admin-nav-link ${collapsed ? "admin-nav-link-collapsed" : "admin-nav-link-expanded"} ${isActive ? "admin-nav-link-active" : ""}`
                  }
                >
                  <span className="admin-nav-icon-wrap">{React.createElement(icon, { className: "admin-nav-icon" })}</span>
                  {!collapsed && <span className="admin-nav-label">{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
