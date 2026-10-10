import React, { useEffect, useState } from "react";
import ManagerNavbar from "./ManagerNavbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useDiscountSocket from "../../hooks/useDiscoutSocket";
import notification from "../../../src/assets/sounds/notification.mp3";
import BranchSwitcher from "../branch/BranchSwitcher";
import { Menu } from "lucide-react";

export default function ManagerRootLayout() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [discountAlert, setDiscountAlert] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mobileSidebarOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen]);

  const playSound = () => {
    const audio = new Audio(notification);
    audio.play().catch(() => {});
  };

  const handleDiscountMessage = (data) => {
    if (data.type === "NEW_DISCOUNT_REQUEST") {
      setDiscountAlert(data);
      playSound();

      // auto hide after 6s
      setTimeout(() => setDiscountAlert(null), 6000);
    }
  };

  useDiscountSocket(handleDiscountMessage);

  return (
    <div
      className="rms-standalone-workspace flex h-screen overflow-hidden theme-app-shell"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {discountAlert && (
        <button
          type="button"
          onClick={() => navigate("/manager/discount-requests")}
          className="fixed top-4 z-50 w-72 cursor-pointer rounded-lg border border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] px-4 py-3 text-start text-[var(--theme-warning-hover)] shadow-lg ltr:right-4 rtl:left-4"
        >
          <div className="font-semibold">{t("legacy.new_discount_request_cfe57c13")}</div>

          <div className="text-sm mt-1">
            {t("table.order_number")}{discountAlert.order_number}
          </div>

          <div className="text-xs mt-2 opacity-90">
            {t("legacy.click_to_review_pending_requests_9503e7a8")}
          </div>
        </button>
      )}
      <ManagerNavbar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="admin-content-frame">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-menu-button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label={t("inventory_manager.a11y.open_sidebar", { defaultValue: "Open navigation" })}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="admin-page-heading">
              <h1>{t("staff.roles.manager")}</h1>
            </div>
          </div>
          <div className="admin-topbar-actions"><BranchSwitcher /></div>
        </header>
        <main className="admin-main operational-main">
          <div className="admin-main-inner"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
