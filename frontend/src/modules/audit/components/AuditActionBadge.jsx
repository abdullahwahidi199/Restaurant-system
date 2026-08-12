import React from "react";

const tones = {
  CREATE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  UPDATE: "bg-blue-50 text-blue-700 ring-blue-200",
  DELETE: "bg-rose-50 text-rose-700 ring-rose-200",
  APPROVE: "bg-violet-50 text-violet-700 ring-violet-200",
  REJECT: "bg-rose-50 text-rose-700 ring-rose-200",
  CANCEL: "bg-amber-50 text-amber-700 ring-amber-200",
  RESTORE: "bg-teal-50 text-teal-700 ring-teal-200",
  PAYMENT: "bg-green-50 text-green-700 ring-green-200",
  STATUS_CHANGE: "bg-slate-100 text-slate-700 ring-slate-200",
  ASSIGNMENT_CHANGE: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  CONFIG_CHANGE: "bg-orange-50 text-orange-700 ring-orange-200",
  EXPORT: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  LOGIN_SUCCESS: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  LOGIN_FAILED: "bg-rose-50 text-rose-700 ring-rose-200",
  MIGRATION: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function AuditActionBadge({ action }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ${
        tones[action] || "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {String(action || "").replaceAll("_", " ")}
    </span>
  );
}
