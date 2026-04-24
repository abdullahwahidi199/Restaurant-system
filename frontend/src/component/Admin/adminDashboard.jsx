import { Outlet } from "react-router-dom";
import Navbar from "./navbar";
import { useTranslation } from "react-i18next";
import instance from "../../api/axiosInstance";
import { useEffect, useState } from "react";
import { X, AlertTriangle, CheckCircle, CreditCard } from "lucide-react";

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);

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

  const getSubscriptionAlert = (days_left) => {
    if (days_left <= 3) {
      return {
        severity: "critical",
        color: "bg-red-500",
        icon: <AlertTriangle className="h-5 w-5 text-white" />,
        text: "Subscription expires in 3 days!",
        buttonText: "Renew Now",
      };
    } else if (days_left <= 7) {
      return {
        severity: "warning",
        color: "bg-amber-500",
        icon: <AlertTriangle className="h-5 w-5 text-white" />,
        text: "Subscription expires soon.",
        buttonText: "View Plans",
      };
    } else if (days_left <= 10) {
      return {
        severity: "info",
        color: "bg-blue-500",
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
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* 🔥 FLOATING SUBSCRIPTION WARNING (Better UI) */}
      {alert && !isWarningDismissed && (
        <div
          className={`fixed top-5 ${isRTL ? "left-5" : "right-5"} z-50 flex items-center gap-3 rounded-lg shadow-2xl transition-all duration-300 animate-in slide-in-from-top-5`}
        >
          <div className={`${alert.color} p-4 rounded-l-lg`}>{alert.icon}</div>
          <div className="bg-white px-6 py-3 rounded-r-lg flex items-center gap-4">
            <div>
              <p className="font-semibold text-gray-900">{alert.text}</p>
              <p className="text-xs text-gray-500">
                {subscription.days_left} days remaining
              </p>
            </div>

            <button
              onClick={() => setIsWarningDismissed(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Navbar />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
