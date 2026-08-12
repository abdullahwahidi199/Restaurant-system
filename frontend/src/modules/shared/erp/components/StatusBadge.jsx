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
  open: ["bg-sky-50 text-sky-700 ring-sky-200", CircleDot],
  pending: ["bg-orange-50 text-orange-700 ring-orange-200", Clock3],
  unpaid: ["bg-orange-50 text-orange-700 ring-orange-200", Clock3],
  partially_paid: ["bg-sky-50 text-sky-700 ring-sky-200", PauseCircle],
  approved: ["bg-violet-50 text-violet-700 ring-violet-200", CheckCircle2],
  applied: ["bg-violet-50 text-violet-700 ring-violet-200", CheckCircle2],
  paid: ["bg-emerald-50 text-emerald-700 ring-emerald-200", CheckCircle2],
  active: ["bg-emerald-50 text-emerald-700 ring-emerald-200", CheckCircle2],
  completed: ["bg-emerald-50 text-emerald-700 ring-emerald-200", CheckCircle2],
  cancelled: ["bg-rose-50 text-rose-700 ring-rose-200", XCircle],
  expired: ["bg-rose-50 text-rose-700 ring-rose-200", AlertTriangle],
  overdue: ["bg-rose-50 text-rose-700 ring-rose-200", AlertTriangle],
  rejected: ["bg-rose-50 text-rose-700 ring-rose-200", XCircle],
  inactive: ["theme-muted ring-[var(--theme-border)]", PauseCircle],
};

export default function StatusBadge({ status }) {
  const value = status || "unknown";
  const [classes, Icon] = palette[value] || ["bg-slate-100 text-slate-700 ring-slate-200", CircleDot];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${classes}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {String(value).replaceAll("_", " ")}
    </span>
  );
}
