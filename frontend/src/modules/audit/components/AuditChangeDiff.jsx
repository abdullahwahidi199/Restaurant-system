import React from "react";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") {
    if ("repr" in value) return value.repr || value.id || "-";
    return JSON.stringify(value);
  }
  return String(value);
};

export default function AuditChangeDiff({ changes = {} }) {
  const entries = Object.entries(changes || {});

  if (!entries.length) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
        No field-level changes were recorded.
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
                Before
              </span>
              <span className="break-words">{formatValue(values?.old)}</span>
            </div>
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-900">
              <span className="block text-[11px] font-bold uppercase text-emerald-600">
                After
              </span>
              <span className="break-words">{formatValue(values?.new)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

