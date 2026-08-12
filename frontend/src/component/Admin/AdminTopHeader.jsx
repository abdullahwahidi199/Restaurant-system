import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  ChevronDown,
  Globe2,
  LogOut,
  Menu,
  Palette,
  Settings,
  UserCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../api/authforRBC";
import BranchSwitcher from "../branch/BranchSwitcher";
import { useTheme } from "../../theme/ThemeContext";
import { findActiveNavigationItem } from "./adminNavigation";
import GlobalSearch from "./GlobalSearch";

const languageOptions = [
  { code: "en", label: "EN", name: "English" },
  { code: "fa", label: "FA", name: "Dari" },
  { code: "ps", label: "PS", name: "Pashto" },
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
          <div className="admin-menu-caption">Theme</div>
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
        aria-label="Language"
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
  const { auth, logout, activeBranch } = useContext(AuthContext);
  const navigate = useNavigate();
  const user = auth?.user || {};
  const displayName = user.name || user.username || "User";
  const role = user.role || "Team member";
  const initials = getInitials(displayName);

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/staff-login", { replace: true });
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
        <div className="admin-header-menu-panel admin-profile-panel" role="menu">
          <div className="admin-profile-summary">
            <span className="admin-avatar admin-avatar-large">{initials}</span>
            <div>
              <strong>{displayName}</strong>
              <span>{role}</span>
              {activeBranch?.name && <small>{activeBranch.name}</small>}
            </div>
          </div>

          <Link
            to="/admin/dashboard/settings"
            className="admin-menu-item"
            onClick={onClose}
            role="menuitem"
          >
            <UserCircle className="h-4 w-4" />
            <span>Account settings</span>
          </Link>

          <button
            type="button"
            className="admin-menu-item admin-menu-item-danger"
            onClick={handleLogout}
            role="menuitem"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminTopHeader({ navigationGroups, onOpenSidebar }) {
  const { i18n } = useTranslation();
  const location = useLocation();
  const [openPanel, setOpenPanel] = useState(null);
  const headerRef = useRef(null);
  const activeItem = useMemo(
    () => findActiveNavigationItem(navigationGroups, location.pathname),
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
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="admin-page-heading">
          <div className="admin-breadcrumb">
            <span>{activeItem?.groupLabel || "Workspace"}</span>
            <span aria-hidden="true">/</span>
            <span>{activeItem?.label || "Dashboard"}</span>
          </div>
        </div>
      </div>

      <div className="admin-topbar-search">
        <GlobalSearch navigationGroups={navigationGroups} />
      </div>

      <div className="admin-topbar-actions">
        <div className="admin-branch-control">
          <BranchSwitcher compact />
        </div>

        <ThemeControl
          open={openPanel === "theme"}
          onToggle={() => togglePanel("theme")}
          onClose={() => setOpenPanel(null)}
        />

        <LanguageControl i18n={i18n} />

        <Link
          to="/admin/dashboard/settings"
          className="admin-header-icon-button"
          aria-label="Settings"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Link>

        <button
          type="button"
          className="admin-header-icon-button admin-notification-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span aria-hidden="true" />
        </button>

        <ProfileMenu
          open={openPanel === "profile"}
          onToggle={() => togglePanel("profile")}
          onClose={() => setOpenPanel(null)}
        />
      </div>
    </header>
  );
}
