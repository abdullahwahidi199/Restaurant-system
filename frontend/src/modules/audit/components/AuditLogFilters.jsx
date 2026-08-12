import React from "react";
import { Search } from "lucide-react";
import { AUDIT_ACTION_OPTIONS, AUDIT_MODULE_OPTIONS } from "../auditConfig";

export default function AuditLogFilters({ filters, onChange }) {
  const update = (field, value) => onChange({ ...filters, [field]: value, page: 1 });

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-6">
      <div className="relative md:col-span-2">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={filters.search || ""}
          onChange={(event) => update("search", event.target.value)}
          placeholder="Search audit logs..."
          className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <select value={filters.module || ""} onChange={(event) => update("module", event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm">
        <option value="">All modules</option>
        {AUDIT_MODULE_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select value={filters.action || ""} onChange={(event) => update("action", event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm">
        <option value="">All actions</option>
        {AUDIT_ACTION_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input type="date" value={filters.start_date || ""} onChange={(event) => update("start_date", event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
      <input type="date" value={filters.end_date || ""} onChange={(event) => update("end_date", event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
    </div>
  );
}
