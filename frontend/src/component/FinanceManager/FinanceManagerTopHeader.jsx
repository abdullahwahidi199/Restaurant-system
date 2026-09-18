import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Check,
  ChevronDown,
  Globe2,
  LogOut,
  Menu,
  Palette,
  UserCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../api/authforRBC";
import { useTheme } from "../../theme/ThemeContext";
import { findActiveFinanceManagerNavigationItem } from "./financeManangerNavigation";
import FinanceGlobalSearch from "./FinanceManagerSearch";
import { useTranslation as useAutoTranslation } from "react-i18next";
import i18n from "../../i18n";
import { getStaffLoginPath } from "../../config/appEnvironment";

const languageOptions = [
  { code: "en", label: i18n.t("legacy.en_734a78cd"), name: "English" },
  { code: "fa", label: i18n.t("legacy.fa_c919853c"), name: "Dari" },
  { code: "ps", label: i18n.t("legacy.ps_02543e7a"), name: "Pashto" },
];

const getInitials = (value) => {
  const parts = String(value || "User")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

function ThemeControl({ open, onToggle, onClose }) {
  const { t: autoT } = useAutoTranslation();
  const { theme, setTheme, themes } = useTheme();
  const currentTheme = themes.find((item) => item.id === theme) || themes[0];

  return (
    <div className="admin-header-menu-wrap">
      <button
        type="button"
        className="admin-header-control admin-header-control-wide"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Palette className="h-4 w-4" />
        <span className="admin-header-control-label">{currentTheme?.name}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="admin-header-menu-panel" role="menu">
          <div className="admin-menu-caption">{autoT("legacy.theme_a797e309")}</div>
          {themes.map((item) => {
            const selected = item.id === theme;
            return (
              <button
                key={item.id}
                type="button"
                className={`admin-menu-item ${
                  selected ? "admin-menu-item-active" : ""
                }`}
                onClick={() => {
                  setTheme(item.id);
                  onClose();
                }}
                role="menuitemradio"
                aria-checked={selected}
              >
                <span className="admin-theme-dot" />
                <span className="admin-menu-item-copy">
                  <span>{item.name}</span>
                  <small>{item.description}</small>
                </span>
                {selected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LanguageControl({ i18n }) {
  const { t: autoT } = useAutoTranslation();
  const handleChange = (event) => {
    const nextLanguage = event.target.value;
    i18n.changeLanguage(nextLanguage).then(() => {
      window.location.reload();
    });
  };

  return (
    <label className="admin-header-control admin-language-control">
      <Globe2 className="h-4 w-4" />
      <select
        value={i18n.language}
        onChange={handleChange}
        aria-label={autoT("inventory_manager.languages.language")}
      >
        {languageOptions.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProfileMenu({ open, onToggle, onClose }) {
  const { t: autoT } = useAutoTranslation();
  const { auth, logout, activeBranch } = useContext(AuthContext);
  const navigate = useNavigate();
  const user = auth?.user || {};
  const displayName = user.name || user.username || "Finance Manager";
  const role = user.role || "Finance Manager";
  const initials = getInitials(displayName);

  const handleLogout = () => {
    logout();
    onClose();
    navigate(getStaffLoginPath(), { replace: true });
  };

  return (
    <div className="admin-header-menu-wrap">
      <button
        type="button"
        className="admin-profile-button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="admin-avatar">{initials}</span>
        <span className="admin-profile-copy">
          <span>{displayName}</span>
          <small>{role}</small>
        </span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          className="admin-header-menu-panel admin-profile-panel"
          role="menu"
        >
          <div className="admin-profile-summary">
            <span className="admin-avatar admin-avatar-large">{initials}</span>
            <div>
              <strong>{displayName}</strong>
              <span>{role}</span>
              {activeBranch?.name && <small>{activeBranch.name}</small>}
            </div>
          </div>

          <button
            type="button"
            className="admin-menu-item admin-menu-item-danger"
            onClick={handleLogout}
            role="menuitem"
          >
            <LogOut className="h-4 w-4" />
            <span>{autoT("legacy.sign_out_dc1649a1")}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function FinanceTopHeader({ navigationGroups, onOpenSidebar }) {
                 const { t: autoT } = useAutoTranslation();
  const { i18n } = useTranslation();
  const location = useLocation();
  const [openPanel, setOpenPanel] = useState(null);
  const headerRef = useRef(null);

  const activeItem = useMemo(
    () =>
      findActiveFinanceManagerNavigationItem(
        navigationGroups,
        location.pathname,
      ),
    [navigationGroups, location.pathname],
  );

  useEffect(() => {
    const closeOnPointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setOpenPanel(null);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpenPanel(null);
    };

    document.addEventListener("mousedown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const togglePanel = (panel) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  return (
    <header className="admin-topbar" ref={headerRef}>
      <div className="admin-topbar-left">
        <button
          type="button"
          className="admin-mobile-menu-button"
          onClick={onOpenSidebar}
          aria-label={autoT("inventory_manager.a11y.open_navigation")}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="admin-page-heading">
          <div className="admin-breadcrumb">
            <span>{activeItem?.groupLabel || autoT("landing.features.groups.finance.title")}</span>
            <span aria-hidden="true">/</span>
            <span>{activeItem?.label || autoT("nav.expenses")}</span>
          </div>
        </div>
      </div>

      <div className="admin-topbar-search">
        <FinanceGlobalSearch navigationGroups={navigationGroups} />
      </div>

      <div className="admin-topbar-actions">
        <ThemeControl
          open={openPanel === "theme"}
          onToggle={() => togglePanel("theme")}
          onClose={() => setOpenPanel(null)}
        />

        <LanguageControl i18n={i18n} />

        <ProfileMenu
          open={openPanel === "profile"}
          onToggle={() => togglePanel("profile")}
          onClose={() => setOpenPanel(null)}
        />
      </div>
    </header>
  );
}
