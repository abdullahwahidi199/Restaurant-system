import React from "react";
import i18n from "../../../../i18n";

export default function LoadingState({ label = i18n.t("legacy.loading_workspace_7f29a9d9") }) {
  return (
    <div className="theme-card space-y-3 p-3">
      <div className="h-4 w-48 animate-pulse rounded-full bg-[var(--theme-muted)]" />
      <div className="grid gap-3 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-20 animate-pulse rounded-lg bg-[var(--theme-muted)]" />
        ))}
      </div>
      <div className="h-32 animate-pulse rounded-lg bg-[var(--theme-muted)]" />
      <p className="text-[13px] theme-text-muted">{label}</p>
    </div>
  );
}
