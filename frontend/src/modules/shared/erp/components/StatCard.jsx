import React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

const tones = {
  neutral: {
    icon: "theme-muted",
    trend: "theme-text-secondary",
  },
  blue: {
    icon: "theme-badge-info",
    trend: "text-[var(--theme-info-hover)]",
  },
  green: {
    icon: "theme-badge-success",
    trend: "text-[var(--theme-success-hover)]",
  },
  orange: {
    icon: "theme-badge-warning",
    trend: "text-[var(--theme-warning-hover)]",
  },
  amber: {
    icon: "theme-badge-warning",
    trend: "text-[var(--theme-warning-hover)]",
  },
  purple: {
    icon: "bg-[var(--theme-primary-soft)] text-[var(--theme-primary-hover)]",
    trend: "text-[var(--theme-primary-hover)]",
  },
  rose: {
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
  const style = tones[tone] ?? tones.neutral;
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <div
      className="theme-kpi-card flex min-w-0 flex-col justify-between gap-3 p-4"
      style={{ borderTopWidth: 1, borderTopColor: "var(--theme-border)" }}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold leading-snug theme-text-secondary">
            {label}
          </p>
          <p className="mt-2 break-words text-2xl font-bold leading-none tracking-tight theme-text-primary">
            {value ?? "—"}
          </p>
        </div>
        {Icon && (
          <span
            className={`erp-kpi-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.icon}`}
            aria-hidden="true"
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>

      {(hint || trendLabel) && (
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--theme-border)] pt-2.5">
          {hint && (
            <p className="min-w-0 flex-1 text-xs leading-snug theme-text-muted">
              {hint}
            </p>
          )}
          {trendLabel && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold ${style.trend}`}
            >
              <TrendIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
