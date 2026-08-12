import React from "react";
import { X } from "lucide-react";

export default function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--theme-overlay)] p-4 backdrop-blur-md">
      <div
        className={`max-h-[92vh] w-full overflow-hidden rounded-2xl border theme-surface ${wide ? "max-w-5xl" : "max-w-2xl"}`}
      >
        <div className="flex items-center justify-between border-b px-5 py-4 theme-muted">
          <h3 className="text-lg font-bold theme-text-primary">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="theme-btn theme-btn-ghost rounded-xl p-2"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[calc(92vh-65px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
