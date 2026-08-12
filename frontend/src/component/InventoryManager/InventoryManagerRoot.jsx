import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import InventoryManagerNavbar from "./InventoryManagerNavbar";
import BranchSwitcher from "../branch/BranchSwitcher";

export default function InventoryManagerRoot() {
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden theme-app-shell">
      <InventoryManagerNavbar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="admin-content-frame">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-menu-button"
              onClick={() => setMobileOpen(true)}
              aria-label={t("inventory_manager.a11y.open_navigation", { defaultValue: "Open navigation" })}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="admin-page-heading">
              <div className="admin-breadcrumb">
                {t("inventory_manager.topbar.workspace", { defaultValue: "Workspace" })}
              </div>
              <h1>
                {t("inventory_manager.topbar.title", { defaultValue: "Inventory Manager" })}
              </h1>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <BranchSwitcher />
          </div>
        </header>

        <main className="admin-main">
          <div className="admin-main-inner">
          <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
