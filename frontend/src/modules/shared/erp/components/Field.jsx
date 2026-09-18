import React from "react";

export default function Field({ label, required = false, hint, children }) {
  return (
    <label className="block text-xs">
      <span className="mb-1 flex items-center gap-1 font-semibold theme-text-secondary">
        {label}
        {required && <span className="text-[var(--theme-danger)]" aria-hidden="true">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs theme-text-muted">{hint}</span>}
    </label>
  );
}
