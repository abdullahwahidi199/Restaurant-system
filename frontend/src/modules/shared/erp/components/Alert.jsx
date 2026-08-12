import React from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

const tones = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  danger: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
};

export default function Alert({ tone = "info", message, onClose }) {
  if (!message) return null;
  const Icon = tone === "success" ? CheckCircle2 : XCircle;
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm ${tones[tone] || tones.info}`}
      role="status"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-1 opacity-70 transition hover:bg-white/70 hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
