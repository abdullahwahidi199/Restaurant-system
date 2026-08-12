import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { getAuditLogs } from "../../api/auditApi";
import PageHeader from "../shared/erp/components/PageHeader";
import AuditLogDetailsModal from "./components/AuditLogDetailsModal";
import AuditLogFilters from "./components/AuditLogFilters";
import AuditLogTable from "./components/AuditLogTable";

export default function AuditLogPage() {
  const [filters, setFilters] = useState({ ordering: "newest", page: 1 });
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getAuditLogs(filters)
      .then((res) => {
        if (cancelled) return;
        setLogs(res.data?.results || []);
        setCount(res.data?.count || 0);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load audit logs.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <section className="space-y-5 px-4 pb-6 lg:px-5">
      <PageHeader
        eyebrow="Security"
        breadcrumb="Admin / Audit Logs"
        icon={ShieldCheck}
        title="Audit Logs"
        description="Review who changed financial and operational records, when it happened, and what changed."
        quickStats={[{ label: "Records", value: count }]}
      />
      <AuditLogFilters filters={filters} onChange={setFilters} />
      {error && <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      <AuditLogTable logs={logs} loading={loading} onOpen={setSelectedLog} />
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={!filters.page || filters.page <= 1}
          onClick={() => setFilters((current) => ({ ...current, page: Math.max((current.page || 1) - 1, 1) }))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-slate-500">Page {filters.page || 1}</span>
        <button
          type="button"
          disabled={(filters.page || 1) * 20 >= count}
          onClick={() => setFilters((current) => ({ ...current, page: (current.page || 1) + 1 }))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <AuditLogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </section>
  );
}

