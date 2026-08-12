import React from "react";

export default function LoadingState({ label = "Loading workspace..." }) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-5 w-56 animate-pulse rounded-full bg-slate-100" />
      <div className="grid gap-3 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
