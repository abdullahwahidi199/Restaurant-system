import { useContext, useEffect, useState } from "react";
import {
  Users,
  Utensils,
  CalendarCheck,
  Star,
  DollarSign,
  ShoppingBag,
  Bell,
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";

import TopSectionStats from "./TopSectionStatsCard";
import MonthOverView from "./MonthOverview";
import DailySalesChart from "./DailySalesChart";
import BestSellingItems from "./BestSellingItems";
import Notifications from "./Notifications";
import LowStockItems from "../Inventory/LowStockItems";
import { AuthContext } from "../../../api/authforRBC";
import instance from "../../../api/axiosInstance";
import DeliveryPerformance from "./DeliveryPerformance";
import RistrictionMessage from "../../RistrictionMessage";
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  const [currentDate, setCurrentDate] = useState("authTokens");

  const { auth } = useContext(AuthContext);
  console.log(auth);
  const isDemo = auth?.user?.isDemo;

  useEffect(() => {
    const date = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(date);
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await instance.get("/reports/dashboard-summary/");
        setSummary(res.data);
      } catch {
        setError(t("dashboard.error"));
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [t]);

  if (loading)
    return <p className="text-center mt-10 text-gray-500">{t("dashboard.loading")}</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  const stats = [
    {
      label: t("dashboard.stats.total_staff"),
      value: summary.total_staff,
      icon: <Users className="h-5 w-5 text-[var(--theme-info)]" />,
    },
    {
      label: t("dashboard.stats.menu_items"),
      value: summary.menu_items,
      icon: <Utensils className="h-5 w-5 text-[var(--theme-warning)]" />,
    },
    {
      label: t("dashboard.stats.attendance_rate"),
      value: `${summary.attendance_rate}%`,
      icon: <CalendarCheck className="h-5 w-5 text-[var(--theme-primary)]" />,
    },
    {
      label: t("dashboard.stats.average_rating"),
      value: `${Number(summary.average_rating).toFixed(1)} ⭐`,
      icon: <Star className="h-5 w-5 text-[var(--theme-warning)]" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          {t("dashboard.welcome")}
        </h1>
        <p className="mt-1 text-[13px] theme-text-muted">
          {t("dashboard.overview")} — {currentDate}
        </p>
      </div>

      {isDemo && <RistrictionMessage />}

      <TopSectionStats stats={stats} />

      {/* Charts */}
      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <MonthOverView summary={summary} />
          <DailySalesChart summary={summary} />
        </CardContent>
      </Card>

      {/* Best Selling Items (UNCHANGED) */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <BestSellingItems summary={summary} />
        </CardContent>
      </Card>

      {/* Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <Notifications />
          </CardContent>
        </Card>
        <LowStockItems /> {/* ✅ Added without removing anything */}
      </div>
    </div>
  );
}
