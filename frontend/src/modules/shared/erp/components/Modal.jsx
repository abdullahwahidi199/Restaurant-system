import React, { useEffect, useId } from "react";
import { X } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function Modal({ title, children, onClose, wide = false }) {
  const { t: autoT } = useAutoTranslation();
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--theme-overlay)] p-4 backdrop-blur-sm">
      <div
        className={`theme-modal-surface max-h-[92vh] w-full overflow-hidden ${wide ? "max-w-5xl" : "max-w-2xl"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex min-h-14 items-center justify-between border-b px-5 py-3 theme-muted">
          <h3 id={titleId} className="text-base font-semibold theme-text-primary">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="theme-btn theme-btn-ghost theme-btn-icon"
            aria-label={autoT("menuDetails.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[calc(92vh-56px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
