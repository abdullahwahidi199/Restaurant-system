import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock3,
  PauseCircle,
  XCircle,
} from "lucide-react";

const palette = {
  draft: ["theme-muted ring-[var(--theme-border)]", Circle],
  open: ["theme-badge-info ring-sky-200", CircleDot],
  available: ["theme-badge-success ring-emerald-200", CheckCircle2],
  occupied: ["theme-badge-warning ring-orange-200", Clock3],
  unavailable: ["theme-muted ring-[var(--theme-border)]", PauseCircle],
  pending: ["theme-badge-warning ring-orange-200", Clock3],
  unpaid: ["theme-badge-warning ring-orange-200", Clock3],
  low_stock: ["theme-badge-warning ring-orange-200", AlertTriangle],
  late: ["theme-badge-warning ring-amber-200", Clock3],
  partially_paid: ["theme-badge-info ring-sky-200", PauseCircle],
  in_progress: ["theme-badge-info ring-sky-200", Clock3],
  reserved: ["theme-badge-info ring-sky-200", Clock3],
  approved: ["bg-[var(--theme-primary-soft)] text-[var(--theme-primary-hover)] ring-violet-200", CheckCircle2],
  applied: ["bg-[var(--theme-primary-soft)] text-[var(--theme-primary-hover)] ring-violet-200", CheckCircle2],
  paid: ["theme-badge-success ring-emerald-200", CheckCircle2],
  active: ["theme-badge-success ring-emerald-200", CheckCircle2],
  completed: ["theme-badge-success ring-emerald-200", CheckCircle2],
  delivered: ["theme-badge-success ring-emerald-200", CheckCircle2],
  present: ["theme-badge-success ring-emerald-200", CheckCircle2],
  ready: ["bg-[var(--theme-primary-soft)] text-[var(--theme-primary-hover)] ring-violet-200", CheckCircle2],
  cancelled: ["theme-badge-danger ring-rose-200", XCircle],
  expired: ["theme-badge-danger ring-rose-200", AlertTriangle],
  overdue: ["theme-badge-danger ring-rose-200", AlertTriangle],
  rejected: ["theme-badge-danger ring-rose-200", XCircle],
  absent: ["theme-badge-danger ring-rose-200", XCircle],
  out_of_stock: ["theme-badge-danger ring-rose-200", AlertTriangle],
  leave: ["bg-[var(--theme-primary-soft)] text-[var(--theme-primary-hover)] ring-violet-200", PauseCircle],
  inactive: ["theme-muted ring-[var(--theme-border)]", PauseCircle],
};

export default function StatusBadge({ status, label, count, showIcon = false, className = "" }) {
  const value = String(status || "unknown").toLowerCase();
  const [classes, Icon] = palette[value] || ["theme-muted ring-[var(--theme-border)]", CircleDot];
  return (
    <span
      className={`erp-status-badge inline-flex items-center gap-1.5 rounded-full font-semibold capitalize ring-1 ring-inset ${classes} ${className}`}
    >
      {showIcon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {label ?? count ?? String(value).replaceAll("_", " ")}
    </span>
  );
}
