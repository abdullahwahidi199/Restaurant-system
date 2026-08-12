import React from "react";
import { useTranslation } from "react-i18next";
import {
  ClipboardList,
  FileText,
  Globe2,
  PackageSearch,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function Tooltip({ label }) {
  return <span className="admin-nav-tooltip">{label}</span>;
}

const languageOptions = [
  { code: "en", label: "EN", nameKey: "inventory_manager.languages.english" },
  { code: "fa", label: "FA", nameKey: "inventory_manager.languages.dari" },
  { code: "ps", label: "PS", nameKey: "inventory_manager.languages.pashto" },
];

function LanguageControl({ expanded, i18n, t }) {
  const handleChange = (event) => {
    const nextLanguage = event.target.value;
    i18n.changeLanguage(nextLanguage).then(() => {
      window.location.reload();
    });
  };

  const currentLanguage =
    languageOptions.find((language) => language.code === i18n.language) ||
    languageOptions[0];

  return (
    <label
      className={`admin-nav-row admin-sidebar-language ${
        expanded ? "admin-nav-link-expanded" : "admin-nav-link-collapsed"
      }`}
      title={
        expanded
          ? undefined
          : t("inventory_manager.languages.language", {
              defaultValue: "Language",
            })
      }
    >
      <span className="admin-nav-icon-wrap">
        <Globe2 className="admin-nav-icon" />
      </span>
      {expanded && (
        <span className="admin-nav-label">
          {t("inventory_manager.languages.language", {
            defaultValue: "Language",
          })}
        </span>
      )}
      <select
        value={i18n.language}
        onChange={handleChange}
        aria-label={t("inventory_manager.languages.language", {
          defaultValue: "Language",
        })}
        className="admin-sidebar-language-select"
      >
        {languageOptions.map((language) => (
          <option key={language.code} value={language.code}>
            {expanded ? t(language.nameKey) : language.label}
          </option>
        ))}
      </select>
      {!expanded && <Tooltip label={t(currentLanguage.nameKey)} />}
    </label>
  );
}

export default function InventoryManagerNavbar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";
  const expanded = !collapsed || mobileOpen;

  const navItems = [
    {
      to: "/inventory-manager",
      label: t("inventory_manager.nav.dashboard", { defaultValue: "Dashboard" }),
      icon: ClipboardList,
      end: true,
    },
    {
      to: "/inventory-manager/inventory/ingredients",
      label: t("inventory_manager.nav.ingredients", { defaultValue: "Ingredients" }),
      icon: ClipboardList,
    },
    {
      to: "/inventory-manager/inventory/stock-levels",
      label: t("inventory_manager.nav.stock_levels", { defaultValue: "Stock Levels" }),
      icon: PackageSearch,
    },
    {
      to: "/inventory-manager/inventory/stock-movements",
      label: t("inventory_manager.nav.stock_movements", { defaultValue: "Stock Movements" }),
      icon: FileText,
    },
    {
      to: "/inventory-manager/inventory/stock-adjustments",
      label: t("inventory_manager.nav.stock_adjustments", { defaultValue: "Stock Adjustments" }),
      icon: SlidersHorizontal,
    },
    {
      to: "/inventory-manager/inventory/low-stock",
      label: t("inventory_manager.nav.low_stock_alerts", { defaultValue: "Low Stock Alerts" }),
      icon: PackageSearch,
    },
    {
      to: "/inventory-manager/inventory/reports",
      label: t("inventory_manager.nav.inventory_reports", { defaultValue: "Inventory Reports" }),
      icon: FileText,
    },
    {
      to: "/inventory-manager/menu",
      label: t("inventory_manager.nav.menu", { defaultValue: "Menu" }),
      icon: UtensilsCrossed,
    },
  ];

  return (
    <>
      <button
        type="button"
        className={`admin-sidebar-backdrop ${
          mobileOpen ? "admin-sidebar-backdrop-open" : ""
        }`}
        onClick={onCloseMobile}
        aria-label={t("inventory_manager.a11y.close_navigation", { defaultValue: "Close navigation" })}
      />

      <aside
        dir={isRTL ? "rtl" : "ltr"}
        className={`admin-sidebar ${
          expanded ? "admin-sidebar-expanded" : "admin-sidebar-collapsed"
        } ${mobileOpen ? "admin-sidebar-mobile-open" : ""}`}
        aria-label={t("inventory_manager.a11y.navigation", { defaultValue: "Inventory manager navigation" })}
      >
        <div className="admin-sidebar-brand">
          <div className="admin-brand-content">
            <div className="admin-brand-mark" aria-hidden={expanded}>
              <span>I</span>
            </div>
            {expanded && (
              <div className="admin-brand-copy">
                <span className="admin-brand-title">
                  {t("inventory_manager.sidebar.title", { defaultValue: "Inventory" })}
                </span>
                <span className="admin-brand-subtitle">
                  {t("inventory_manager.sidebar.subtitle", { defaultValue: "Stock Control" })}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="admin-sidebar-collapse"
            onClick={onToggleCollapse}
            aria-label={
              collapsed
                ? t("inventory_manager.a11y.expand_sidebar", { defaultValue: "Expand sidebar" })
                : t("inventory_manager.a11y.collapse_sidebar", { defaultValue: "Collapse sidebar" })
            }
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            className="admin-sidebar-mobile-close"
            onClick={onCloseMobile}
            aria-label={t("inventory_manager.a11y.close_sidebar", { defaultValue: "Close sidebar" })}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="admin-sidebar-scroll">
          <ul className="admin-tree-list">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <li key={to} className="admin-tree-item">
                <NavLink
                  to={to}
                  end={end ?? true}
                  onClick={onCloseMobile}
                  title={expanded ? undefined : label}
                  className={({ isActive }) =>
                    `admin-nav-row admin-nav-link ${
                      isActive ? "admin-nav-link-active" : ""
                    } ${
                      expanded
                        ? "admin-nav-link-expanded"
                        : "admin-nav-link-collapsed"
                    } admin-nav-parent-link`
                  }
                  style={{ "--nav-depth": 0 }}
                >
                  <span className="admin-nav-icon-wrap">
                    <Icon className="admin-nav-icon" />
                  </span>
                  {expanded && <span className="admin-nav-label">{label}</span>}
                  {!expanded && <Tooltip label={label} />}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-sidebar-footer">
          <LanguageControl expanded={expanded} i18n={i18n} t={t} />
        </div>
      </aside>
    </>
  );
}
