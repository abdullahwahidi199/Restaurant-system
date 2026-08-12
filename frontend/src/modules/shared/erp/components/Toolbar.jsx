import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export default function Toolbar({ children, title = "Filters" }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          <SlidersHorizontal className="h-4 w-4" />
          {title}
        </span>
        <span className="text-xs font-semibold text-slate-400">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="grid gap-3 border-t border-slate-100 bg-slate-50/50 p-3 md:grid-cols-[minmax(220px,1fr)_repeat(auto-fit,minmax(150px,190px))]">
          {children}
        </div>
      )}
    </div>
  );
}
