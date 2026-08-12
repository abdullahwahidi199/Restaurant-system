import React from "react";
import { money } from "../formatters";

const colors = {
  blue: "bg-sky-500",
  green: "bg-emerald-500",
  orange: "bg-orange-500",
  purple: "bg-violet-500",
  rose: "bg-rose-500",
  slate: "bg-slate-900",
};

export default function MiniBarChart({ rows = [], valueFormatter = money, tone = "slate", empty = "No chart data yet." }) {
  const max = Math.max(1, ...rows.map((row) => Number(row.value || 0)));
  if (!rows.length) {
    return <p className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">{empty}</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-slate-600">{row.label}</span>
            <span className="font-bold text-slate-950">{valueFormatter(row.value)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div
              className={`h-2.5 rounded-full transition-all ${colors[row.tone || tone] || colors.slate}`}
              style={{ width: `${Math.max(7, (Number(row.value || 0) / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
