import React from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";

const tones = {
  success: "border-[var(--theme-success)]/20 theme-badge-success",
  error: "border-[var(--theme-danger)]/20 theme-badge-danger",
  danger: "border-[var(--theme-danger)]/20 theme-badge-danger",
  info: "border-[var(--theme-info)]/20 theme-badge-info",
};

export default function Alert({ tone = "info", message, onClose }) {
                 const { t: autoT } = useAutoTranslation();
  if (!message) return null;
  const Icon = tone === "success" ? CheckCircle2 : XCircle;
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-[13px] font-medium ${tones[tone] || tones.info}`}
      role="status"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 opacity-70 transition hover:bg-[var(--theme-surface)]/70 hover:opacity-100"
          aria-label={autoT("legacy.dismiss_70afe9ef")}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
