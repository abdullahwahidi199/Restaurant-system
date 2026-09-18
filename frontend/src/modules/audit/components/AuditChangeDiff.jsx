import React from "react";
import { useTranslation as useAutoTranslation } from "react-i18next";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") {
    if ("repr" in value) return value.repr || value.id || "-";
    return JSON.stringify(value);
  }
  return String(value);
};

export default function AuditChangeDiff({ changes = {} }) {
                 const { t: autoT } = useAutoTranslation();
  const entries = Object.entries(changes || {});

  if (!entries.length) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
        {autoT("legacy.no_field_level_changes_were_recorded_a78af4c6")}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map(([field, values]) => (
        <div key={field} className="rounded-lg border border-slate-200 p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            {field.replaceAll("_", " ")}
          </p>
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <div className="rounded-md bg-rose-50 p-2 text-rose-900">
              <span className="block text-[11px] font-bold uppercase text-rose-500">
                {autoT("legacy.before_74f39697")}
              </span>
              <span className="break-words">{formatValue(values?.old)}</span>
            </div>
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-900">
              <span className="block text-[11px] font-bold uppercase text-emerald-600">
                {autoT("legacy.after_79ba5e1b")}
              </span>
              <span className="break-words">{formatValue(values?.new)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

