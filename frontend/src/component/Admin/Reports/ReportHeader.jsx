import React from "react";
import { createPortal } from "react-dom";
import { Download } from "lucide-react";

export default function ReportHeader({
  onExport,
  exportLabel = "Export PDF",
  disabled = false,
}) {
  const actionSlot =
    typeof document === "undefined"
      ? null
      : document.getElementById("report-export-action");

  if (!onExport || !actionSlot) return null;

  return createPortal(
    <button
      type="button"
      onClick={onExport}
      disabled={disabled}
      className="theme-btn theme-btn-outline h-9 w-full gap-2 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      {exportLabel}
    </button>,
    actionSlot,
  );
}
