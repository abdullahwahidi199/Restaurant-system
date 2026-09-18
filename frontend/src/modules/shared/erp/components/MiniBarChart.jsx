import React from "react";
import { money } from "../formatters";
import i18n from "../../../../i18n";

const colors = {
  blue: "bg-[var(--theme-info)]",
  green: "bg-[var(--theme-success)]",
  orange: "bg-[var(--theme-warning)]",
  purple: "bg-[var(--theme-primary)]",
  rose: "bg-[var(--theme-danger)]",
  slate: "bg-[var(--theme-secondary)]",
};

export default function MiniBarChart({ rows = [], valueFormatter = money, tone = "slate", empty = i18n.t("legacy.no_chart_data_yet_858ee4c1") }) {
  const max = Math.max(1, ...rows.map((row) => Number(row.value || 0)));
  if (!rows.length) {
    return <p className="rounded-lg bg-[var(--theme-muted)] px-3 py-4 text-[13px] theme-text-muted">{empty}</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate theme-text-secondary">{row.label}</span>
            <span className="font-semibold theme-text-primary">{valueFormatter(row.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--theme-muted)]">
            <div
              className={`h-2 rounded-full transition-all ${colors[row.tone || tone] || colors.slate}`}
              style={{ width: `${Math.max(7, (Number(row.value || 0) / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
