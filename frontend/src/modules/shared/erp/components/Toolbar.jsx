import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";
import i18n from "../../../../i18n";

export default function Toolbar({ children, title = i18n.t("filterss"), compactMobile = false }) {
  const { t: autoT } = useAutoTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="theme-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex min-h-9 w-full items-center justify-between gap-2 px-3 text-start md:hidden ${compactMobile ? "py-1.5" : "py-1"}`}
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide theme-text-muted">
          <SlidersHorizontal className="h-4 w-4" />
          {title}
        </span>
        <span className="text-xs font-medium theme-text-muted">{open ? autoT("legacy.hide_34d8b60f") : autoT("legacy.show_d97d1ee3")}</span>
      </button>
      <div className={`${open ? "grid" : "hidden"} border-t border-[var(--theme-border)] bg-[var(--theme-surface)] md:grid md:grid-cols-[minmax(220px,1fr)_repeat(auto-fit,minmax(140px,180px))] md:border-t-0 ${compactMobile ? "gap-2 p-2.5 sm:gap-2.5" : "gap-2.5 p-3"}`}>
        {children}
      </div>
    </div>
  );
}
