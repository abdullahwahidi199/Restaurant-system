import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import { useTranslation } from "react-i18next";
import instance from "../../api/axiosInstance";
import { useContext, useEffect, useMemo, useState } from "react";
import { X, AlertTriangle, CheckCircle } from "lucide-react";
import useDiscountSocket from "../../hooks/useDiscoutSocket";
import notification from "../../../src/assets/sounds/notification.mp3";
import { AuthContext } from "../../api/authforRBC";
import AdminTopHeader from "./AdminTopHeader";
import { getAdminNavigationGroups } from "./adminNavigation";

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [discountAlert, setDiscountAlert] = useState(null);
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { auth } = useContext(AuthContext);
  const navigationGroups = useMemo(
    () => getAdminNavigationGroups(t, auth?.user?.role),
    [t, auth?.user?.role],
  );

  useEffect(() => {
    const checkRestaurant = async () => {
      try {
        const res = await instance.get("/restaurant/me/");
        setRestaurant(res.data);
      } catch (err) {
        console.error("Failed to fetch restaurant", err);
      } finally {
        setLoading(false);
      }
    };

    checkRestaurant();
  }, []);

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
  const getSubscriptionAlert = (days_left) => {
    if (days_left <= 3) {
      return {
        severity: "critical",
        color: "bg-[var(--theme-danger)]",
        icon: <AlertTriangle className="h-5 w-5 text-white" />,
        text: "Subscription expires in 3 days!",
        buttonText: "Renew Now",
      };
    } else if (days_left <= 7) {
      return {
        severity: "warning",
        color: "bg-[var(--theme-warning)]",
        icon: <AlertTriangle className="h-5 w-5 text-white" />,
        text: "Subscription expires soon.",
        buttonText: "View Plans",
      };
    } else if (days_left <= 10) {
      return {
        severity: "info",
        color: "bg-[var(--theme-info)]",
        icon: <CheckCircle className="h-5 w-5 text-white" />,
        text: "Don't forget to renew your plan.",
        buttonText: "Manage",
      };
    }
    return null;
  };

  const subscription = restaurant?.subscription;
  const alert =
    subscription?.is_expiring_soon &&
    getSubscriptionAlert(subscription.days_left);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center theme-app-shell">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--theme-primary)]"></div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden theme-app-shell"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {alert && !isWarningDismissed && (
        <div
          className={`fixed top-4 ${isRTL ? "left-4" : "right-4"} z-50 flex items-stretch overflow-hidden rounded-lg border border-[var(--theme-border-strong)] bg-[var(--theme-surface)] shadow-lg`}
        >
          <div className={`${alert.color} p-4 rounded-l-lg`}>{alert.icon}</div>
          <div className="theme-surface px-6 py-3 rounded-r-lg flex items-center gap-4">
            <div>
              <p className="font-semibold theme-text-primary">{alert.text}</p>
              <p className="text-xs theme-text-muted">
                {subscription.days_left} {t("legacy.days_remaining_9182f5ff")}
              </p>
            </div>

            <button
              onClick={() => setIsWarningDismissed(true)}
              className="theme-btn theme-btn-ghost p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {discountAlert && (
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard/pending-discount-requests")}
          className="
      fixed top-4 right-4 z-50
      bg-[var(--theme-primary)] text-[var(--theme-text-inverse)]
      px-4 py-3 rounded-lg shadow-lg
      cursor-pointer text-start
      w-72
    "
        >
          <div className="font-bold text-lg">{t("legacy.new_discount_request_cfe57c13")}</div>

          <div className="text-sm mt-1">
            {t("table.order_number")}{discountAlert.order_number}
          </div>

          <div className="text-xs mt-2 opacity-90">
            {t("legacy.click_to_review_pending_requests_9503e7a8")}
          </div>
        </button>
      )}

      <Navbar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        restaurant={restaurant}
      />

      <div className="admin-content-frame">
        <AdminTopHeader
          navigationGroups={navigationGroups}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="admin-main">
          <div className="admin-main-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
