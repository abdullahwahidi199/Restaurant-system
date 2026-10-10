import React from "react";
import { Inbox } from "lucide-react";
import i18n from "../../../../i18n";

export default function EmptyState({
  title = i18n.t("legacy.nothing_here_yet_e892255d"),
  description = i18n.t("legacy.records_will_appear_here_once_they_are_created_8317663f"),
  action,
}) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--theme-border)] bg-[var(--theme-muted)] px-4 py-5 text-center">
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--theme-surface)] theme-text-muted ring-1 ring-[var(--theme-border)]">
        <Inbox className="h-4 w-4" />
      </div>
      <h3 className="mt-2.5 text-sm font-semibold theme-text-primary">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-[13px] theme-text-muted">{description}</p>
      {action && <div className="mt-2.5">{action}</div>}
    </div>
  );
}
