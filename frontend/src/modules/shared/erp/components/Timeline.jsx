import React from "react";
import { Activity } from "lucide-react";
import { formatMethod, money } from "../formatters";
import EmptyState from "./EmptyState";
import { useTranslation as useAutoTranslation } from "react-i18next";
import i18n from "../../../../i18n";

export default function Timeline({ items, empty = i18n.t("legacy.no_activity_yet_8bdea321") }) {
                 const { t: autoT } = useAutoTranslation();
  if (!items?.length) {
    return <EmptyState title={empty} description={autoT("legacy.recent_activity_will_appear_here_as_records_are_posted_163d5990")} />;
  }

  return (
    <div className="divide-y divide-[var(--theme-border)]">
      {items.map((item) => (
        <div key={item.id} className="relative min-h-11 py-2 pl-7">
          <span className="absolute left-0 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--theme-secondary)] text-[var(--theme-text-inverse)]">
            <Activity className="h-3 w-3" />
          </span>
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold theme-text-primary">
                {item.title || item.staff_name || item.supplier_name || item.contractor_name}
              </p>
              <p className="text-[13px] font-semibold tabular-nums theme-text-primary">{money(item.amount)}</p>
            </div>
            <p className="mt-1 text-xs theme-text-muted">
              {item.date || item.created_at || "-"} - {formatMethod(item.payment_method)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
