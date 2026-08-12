import React from "react";
import { Activity } from "lucide-react";
import { formatMethod, money } from "../formatters";
import EmptyState from "./EmptyState";

export default function Timeline({ items, empty = "No activity yet." }) {
  if (!items?.length) {
    return <EmptyState title={empty} description="Recent activity will appear here as records are posted." />;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="relative pl-7">
          <span className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-white ring-4 ring-slate-100">
            <Activity className="h-3 w-3" />
          </span>
          <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-slate-200 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-950">
                {item.title || item.staff_name || item.supplier_name || item.contractor_name}
              </p>
              <p className="text-sm font-bold text-slate-950">{money(item.amount)}</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {item.date || item.created_at || "-"} - {formatMethod(item.payment_method)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
