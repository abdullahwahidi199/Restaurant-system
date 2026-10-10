import { useContext, useEffect, useState } from "react";
import {
  Banknote,
  MapPin,
  PackageCheck,
  ShoppingBag,
  Utensils,
  LayoutDashboard,
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";

import TopSectionStats from "./TopSectionStatsCard";
import DailySalesChart from "./DailySalesChart";
import BestSellingItems from "./BestSellingItems";
import DashboardAnalytics from "./DashboardAnalytics";
import DashboardSideRail from "./DashboardSideRail";
import { AuthContext } from "../../../api/authforRBC";
import instance from "../../../api/axiosInstance";
import RistrictionMessage from "../../RistrictionMessage";
import { useTranslation } from "react-i18next";
import PageHeader from "../../../modules/shared/erp/components/PageHeader";
import LoadingState from "../../../modules/shared/erp/components/LoadingState";
import Alert from "../../../modules/shared/erp/components/Alert";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const { auth } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;

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

  if (loading) return <LoadingState label={t("dashboard.loading")} />;
  if (error) return <Alert tone="error" message={error} />;

  const formatAmount = (value) =>
    new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 }).format(
      Number(value) || 0,
    );
  const currentDate = new Intl.DateTimeFormat(i18n.language, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const stats = [
    {
      label: t("dashboard.stats.menu_items"),
      value: formatAmount(summary.menu_items),
      meta: t("dashboard.available_on_menu", { defaultValue: "Available on the menu" }),
      color: "var(--theme-warning)",
      icon: <Utensils className="h-5 w-5 text-[var(--theme-warning)]" aria-hidden="true" />,
    },
    {
      label: t("overview.totalRevenue"),
      value: `${formatAmount(summary.revenue_month)} AFN`,
      meta: t("dashboard.this_month", { defaultValue: "This month" }),
      color: "var(--theme-danger)",
      icon: <Banknote className="h-5 w-5 text-[var(--theme-danger)]" aria-hidden="true" />,
    },
    {
      label: t("overview.totalOrders"),
      value: formatAmount(summary.total_orders_month),
      meta: t("dashboard.orders_today", {
        defaultValue: "{{count}} today",
        count: summary.total_orders_today || 0,
      }),
      color: "var(--theme-info)",
      icon: <ShoppingBag className="h-5 w-5 text-[var(--theme-info)]" aria-hidden="true" />,
    },
    {
      label: t("overview.totalSold"),
      value: formatAmount(summary.total_sold_products_month),
      meta: t("dashboard.items_sold_this_month", { defaultValue: "Items sold this month" }),
      color: "var(--theme-primary)",
      icon: <PackageCheck className="h-5 w-5 text-[var(--theme-primary)]" aria-hidden="true" />,
    },
  ];

  return (
    <div className="space-y-3" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        icon={LayoutDashboard}
        title={t("dashboard.welcome")}
        actions={
          <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] px-2.5 text-[11px] font-medium theme-text-secondary">
            <MapPin className="h-3.5 w-3.5 text-[var(--theme-primary)]" aria-hidden="true" />
            {summary?.branch?.name || t("dashboard.all_branches", { defaultValue: "All branches" })}
          </span>
        }
        description={`${t("dashboard.overview")} — ${currentDate}`}
      />

      {isDemo && <RistrictionMessage />}

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0 space-y-3">
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.18fr)]">
            <TopSectionStats stats={stats} />
            <Card className="min-w-0">
              <CardContent className="h-full p-3.5">
                <DailySalesChart />
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardContent className="p-3.5">
              <BestSellingItems summary={summary} />
            </CardContent>
          </Card>

          <DashboardAnalytics summary={summary} />
        </div>

        <aside className="min-w-0">
          <DashboardSideRail summary={summary} />
        </aside>
      </div>
    </div>
  );
}
