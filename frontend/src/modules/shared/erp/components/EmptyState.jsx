import React from "react";
import { Inbox } from "lucide-react";
import i18n from "../../../../i18n";

export default function EmptyState({
  title = i18n.t("legacy.nothing_here_yet_e892255d"),
  description = i18n.t("legacy.records_will_appear_here_once_they_are_created_8317663f"),
  action,
}) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--theme-border)] bg-[var(--theme-muted)] px-5 py-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--theme-surface)] theme-text-muted shadow-sm ring-1 ring-[var(--theme-border)]">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-sm font-semibold theme-text-primary">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-[13px] theme-text-muted">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
