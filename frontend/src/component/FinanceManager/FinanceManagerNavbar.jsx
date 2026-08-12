import React, { useContext, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../api/authforRBC";
import {
  findActiveFinanceManagerNavigationItem,
  getFinanceManagerNavigationGroups,
  getExpandedIdsForFinanceManagerPath,
  isFinanceManagerNavigationItemActive,
} from "./financeManangerNavigation";

const EXPANDED_STORAGE_KEY = "pakhlai-finance-sidebar-expanded";
const mediaBaseUrl = import.meta.env.VITE_MEDIA_URL || "";

const getLogoUrl = (logo) => {
  if (!logo) return null;
  if (logo.startsWith("http") || logo.startsWith("data:")) return logo;
  return `${mediaBaseUrl}${logo}`;
};

const readExpandedIds = () => {
  if (typeof window === "undefined") return new Set();
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(EXPANDED_STORAGE_KEY) || "[]",
    );
    return new Set(Array.isArray(saved) ? saved : []);
  } catch {
    window.localStorage.removeItem(EXPANDED_STORAGE_KEY);
    return new Set();
  }
};

function BrandMark({ logoUrl, collapsed, name }) {
  return (
    <div
      className="admin-brand-mark"
      aria-hidden={collapsed ? undefined : true}
    >
      {logoUrl ? (
        <img src={logoUrl} alt={collapsed ? `${name} logo` : ""} />
      ) : (
        <span>P</span>
      )}
    </div>
  );
}

function Tooltip({ label }) {
  return <span className="admin-nav-tooltip">{label}</span>;
}

function TreeLink({ item, expanded, level, onNavigate, active }) {
  const Icon = item.icon;
  const depth = expanded ? level : 0;

  return (
    <li className="admin-tree-item">
      <NavLink
        to={item.to}
        end={item.end ?? true}
        onClick={onNavigate}
        className={() =>
          `admin-nav-row admin-nav-link ${
            active ? "admin-nav-link-active" : ""
          } ${expanded ? "admin-nav-link-expanded" : "admin-nav-link-collapsed"} ${
            level > 0 ? "admin-nav-child-link" : "admin-nav-parent-link"
          }`
        }
        style={{ "--nav-depth": depth }}
        title={expanded ? undefined : item.label}
      >
        <span className="admin-nav-icon-wrap">
          <Icon className="admin-nav-icon" />
        </span>
        {expanded && <span className="admin-nav-label">{item.label}</span>}
        {!expanded && <Tooltip label={item.label} />}
      </NavLink>
    </li>
  );
}

function TreeBranch({
  item,
  expanded,
  level,
  open,
  active,
  onToggle,
  renderChildren,
}) {
  const Icon = item.icon;
  const depth = expanded ? level : 0;

  return (
    <li className="admin-tree-item">
      <button
        type="button"
        className={`admin-nav-row admin-nav-branch ${
          active ? "admin-nav-branch-active" : ""
        } ${expanded ? "admin-nav-link-expanded" : "admin-nav-link-collapsed"} ${
          level > 0 ? "admin-nav-child-branch" : "admin-nav-parent-branch"
        }`}
        style={{ "--nav-depth": depth }}
        onClick={() => onToggle(item.id)}
        aria-expanded={expanded ? open : undefined}
        title={expanded ? undefined : item.label}
      >
        <span className="admin-nav-icon-wrap">
          <Icon className="admin-nav-icon" />
        </span>
        {expanded && (
          <>
            <span className="admin-nav-label">{item.label}</span>
            <ChevronRight
              className={`admin-nav-chevron ${
                open ? "admin-nav-chevron-open" : ""
              }`}
            />
          </>
        )}
        {!expanded && <Tooltip label={item.label} />}
      </button>

      {expanded && (
        <div
          className={`admin-tree-children ${
            open ? "admin-tree-children-open" : ""
          }`}
        >
          <div className="admin-tree-children-inner">
            {renderChildren(item.children, level + 1)}
          </div>
        </div>
      )}
    </li>
  );
}

function FinanceNavbar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  restaurant,
}) {
  const { t, i18n } = useTranslation();
  const { auth, restaurantDetails } = useContext(AuthContext);
  const location = useLocation();
  const role = auth?.user?.role;
  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  const groups = useMemo(
    () => getFinanceManagerNavigationGroups(t, role),
    [t, role],
  );

  const activeItem = useMemo(
    () => findActiveFinanceManagerNavigationItem(groups, location.pathname),
    [groups, location.pathname],
  );

  const expanded = !collapsed || mobileOpen;
  const [expandedIds, setExpandedIds] = useState(() => {
    const saved = readExpandedIds();
    getExpandedIdsForFinanceManagerPath(groups, location.pathname).forEach(
      (id) => saved.add(id),
    );
    return saved;
  });

  const restaurantName =
    restaurant?.name || restaurantDetails?.name || "Pakhlai Restaurant";
  const logoUrl = getLogoUrl(restaurant?.logo || restaurantDetails?.logo);

  useEffect(() => {
    setExpandedIds((current) => {
      const next = new Set(current);
      let changed = false;
      getExpandedIdsForFinanceManagerPath(groups, location.pathname).forEach(
        (id) => {
          if (!next.has(id)) {
            next.add(id);
            changed = true;
          }
        },
      );
      return changed ? next : current;
    });
  }, [groups, location.pathname]);

  useEffect(() => {
    window.localStorage.setItem(
      EXPANDED_STORAGE_KEY,
      JSON.stringify([...expandedIds]),
    );
  }, [expandedIds]);

  const toggleBranch = (id) => {
    if (!expanded) {
      onToggleCollapse();
      setExpandedIds((current) => new Set(current).add(id));
      return;
    }

    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderTree = (items, level = 0) => (
    <ul className={`admin-tree-list admin-tree-level-${level}`}>
      {items
        .filter((item) => !item.hiddenInSidebar)
        .map((item) => {
          const hasChildren = item.children?.some(
            (child) => !child.hiddenInSidebar,
          );
          const active = item.children?.length
            ? isFinanceManagerNavigationItemActive(location.pathname, item)
            : activeItem?.id === item.id;

          if (hasChildren) {
            const open = expandedIds.has(item.id);
            return (
              <TreeBranch
                key={item.id}
                item={item}
                expanded={expanded}
                level={level}
                open={open}
                active={active}
                onToggle={toggleBranch}
                renderChildren={renderTree}
              />
            );
          }

          return (
            <TreeLink
              key={item.id}
              item={item}
              expanded={expanded}
              level={level}
              active={active}
              onNavigate={onCloseMobile}
            />
          );
        })}
    </ul>
  );

  return (
    <>
      <button
        type="button"
        className={`admin-sidebar-backdrop ${
          mobileOpen ? "admin-sidebar-backdrop-open" : ""
        }`}
        onClick={onCloseMobile}
        aria-label="Close navigation"
      />

      <aside
        dir={isRTL ? "rtl" : "ltr"}
        className={`admin-sidebar ${
          expanded ? "admin-sidebar-expanded" : "admin-sidebar-collapsed"
        } ${mobileOpen ? "admin-sidebar-mobile-open" : ""}`}
        aria-label="Finance navigation"
      >
        <div className="admin-sidebar-brand">
          <div className="admin-brand-content">
            <BrandMark
              logoUrl={logoUrl}
              collapsed={!expanded}
              name={restaurantName}
            />
            {expanded && (
              <div className="admin-brand-copy">
                <span className="admin-brand-title">Pakhlai Finance</span>
                <span className="admin-brand-subtitle">{restaurantName}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="admin-sidebar-collapse"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="admin-sidebar-scroll">{renderTree(groups)}</div>
      </aside>
    </>
  );
}

export default FinanceNavbar;
