import React from "react";

export default function Field({ label, required = false, hint, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 flex items-center gap-1 font-semibold text-slate-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
