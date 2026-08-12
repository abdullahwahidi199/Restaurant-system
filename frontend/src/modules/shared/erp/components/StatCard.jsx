import React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

const tones = {
  neutral: {
    border: "border-t-[var(--theme-border-strong)]",
    icon: "theme-muted",
    trend: "theme-text-muted",
  },
  blue: {
    border: "border-t-[var(--theme-info)]",
    icon: "theme-badge-info",
    trend: "text-[var(--theme-info-hover)]",
  },
  green: {
    border: "border-t-[var(--theme-success)]",
    icon: "theme-badge-success",
    trend: "text-[var(--theme-success-hover)]",
  },
  orange: {
    border: "border-t-[var(--theme-warning)]",
    icon: "theme-badge-warning",
    trend: "text-[var(--theme-warning-hover)]",
  },
  amber: {
    border: "border-t-[var(--theme-warning)]",
    icon: "theme-badge-warning",
    trend: "text-[var(--theme-warning-hover)]",
  },
  purple: {
    border: "border-t-[var(--theme-primary)]",
    icon: "bg-[var(--theme-primary-soft)] text-[var(--theme-primary-hover)]",
    trend: "text-[var(--theme-primary-hover)]",
  },
  rose: {
    border: "border-t-[var(--theme-danger)]",
    icon: "theme-badge-danger",
    trend: "text-[var(--theme-danger-hover)]",
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  hint,
  trend = "flat",
  trendLabel,
}) {
  const style = tones[tone] || tones.neutral;
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <div
      className={`theme-kpi-card group flex min-h-[132px] flex-col justify-between p-4 transition duration-200 hover:-translate-y-0.5 ${style.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide theme-text-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-normal theme-text-primary">
            {value}
          </p>
        </div>
        {Icon && (
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition group-hover:scale-105 ${style.icon}`}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        {hint && <p className="text-xs theme-text-muted">{hint}</p>}
        {trendLabel && (
          <span className={`ml-auto inline-flex items-center gap-1 text-xs font-semibold ${style.trend}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trendLabel}
          </span>
        )}
      </div>
    </div>
  );
}
