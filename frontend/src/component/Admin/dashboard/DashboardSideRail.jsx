import {
  CalendarCheck,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../../ui/card";
import Notifications from "./Notifications";

const formatAmount = (value) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  );

function Sparkline({ data, dataKey, color }) {
  return (
    <ResponsiveContainer width="100%" height={54}>
      <LineChart data={data} margin={{ top: 5, right: 3, left: 3, bottom: 2 }}>
        <Tooltip
          cursor={false}
          formatter={(value) => formatAmount(value)}
          contentStyle={{
            background: "var(--theme-elevated)",
            border: "1px solid var(--theme-border)",
            borderRadius: "7px",
            color: "var(--theme-text-primary)",
            fontSize: "11px",
          }}
          labelStyle={{ display: "none" }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function DashboardSideRail({ summary }) {
  const { t } = useTranslation();
  const sales = (summary?.daily_sales || []).slice(-10);
  const attendance = Math.max(
    0,
    Math.min(100, Number(summary?.attendance_rate || 0)),
  );

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] theme-text-muted">
                {t("dashboard.total_sales", { defaultValue: "Total sales" })}
              </p>
              <p className="mt-1 text-[22px] font-bold leading-none tabular-nums theme-text-primary">
                {formatAmount(summary?.revenue_month)} AFN
              </p>
              <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[var(--theme-success)]">
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
                {t("dashboard.this_month", { defaultValue: "This month" })}
              </p>
            </div>
            <div className="w-[86px] shrink-0">
              <Sparkline data={sales} dataKey="revenue" color="var(--theme-success)" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] theme-text-muted">
                {t("dashboard.total_orders", { defaultValue: "Total orders" })}
              </p>
              <p className="mt-1 text-[22px] font-bold leading-none tabular-nums theme-text-primary">
                {formatAmount(summary?.total_orders_month)}
              </p>
            </div>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--theme-info-soft)] text-[var(--theme-info)]">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-md bg-[var(--theme-muted)] px-2 py-1.5">
              <p className="text-[9px] uppercase tracking-wide theme-text-muted">
                {t("dashboard.today", { defaultValue: "Today" })}
              </p>
              <p className="mt-0.5 text-xs font-semibold theme-text-primary">
                {summary?.total_orders_today || 0}
              </p>
            </div>
            <div className="rounded-md bg-[var(--theme-muted)] px-2 py-1.5">
              <p className="text-[9px] uppercase tracking-wide theme-text-muted">
                {t("dashboard.this_week", { defaultValue: "This week" })}
              </p>
              <p className="mt-0.5 text-xs font-semibold theme-text-primary">
                {summary?.total_orders_week || 0}
              </p>
            </div>
          </div>
          <div className="mt-1.5">
            <Sparkline data={sales} dataKey="orders" color="var(--theme-info)" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] theme-text-muted">
                {t("dashboard.team_health", { defaultValue: "Team overview" })}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full p-[5px]"
                  style={{
                    background: `conic-gradient(var(--theme-primary) ${attendance * 3.6}deg, var(--theme-border) 0deg)`,
                  }}
                >
                  <span className="grid h-full w-full place-items-center rounded-full bg-[var(--theme-card)] text-[11px] font-bold theme-text-primary">
                    {attendance.toFixed(0)}%
                  </span>
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] theme-text-secondary">
                    <CalendarCheck className="h-3.5 w-3.5 text-[var(--theme-primary)]" aria-hidden="true" />
                    {t("dashboard.attendance", { defaultValue: "Attendance today" })}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] theme-text-secondary">
                    <Users className="h-3.5 w-3.5 text-[var(--theme-info)]" aria-hidden="true" />
                    {summary?.total_staff || 0} {t("dashboard.staff", { defaultValue: "staff" })}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] theme-text-secondary">
                    <Star className="h-3.5 w-3.5 text-[var(--theme-warning)]" aria-hidden="true" />
                    {Number(summary?.average_rating || 0).toFixed(1)} {t("dashboard.rating", { defaultValue: "rating" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3.5">
          <Notifications />
        </CardContent>
      </Card>
    </div>
  );
}
