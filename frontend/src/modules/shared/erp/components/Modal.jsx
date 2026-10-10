import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function Modal({ title, children, onClose, wide = false }) {
  const { t: autoT } = useAutoTranslation();
  const titleId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousActiveElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current?.();
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.querySelector("button, [href], input, select, textarea, [tabindex]")?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus?.();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--theme-overlay)] p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        className={`theme-modal-surface max-h-[92vh] w-full overflow-hidden ${wide ? "max-w-5xl" : "max-w-2xl"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex min-h-12 items-center justify-between border-b px-4 py-2 theme-surface">
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
        <div className="max-h-[calc(92vh-48px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
