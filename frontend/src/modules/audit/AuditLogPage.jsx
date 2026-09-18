import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { getAuditLogs } from "../../api/auditApi";
import PageHeader from "../shared/erp/components/PageHeader";
import AuditLogDetailsModal from "./components/AuditLogDetailsModal";
import AuditLogFilters from "./components/AuditLogFilters";
import AuditLogTable from "./components/AuditLogTable";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function AuditLogPage() {
                 const { t: autoT } = useAutoTranslation();
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
        if (!cancelled) setError(autoT("legacy.failed_to_load_audit_logs_7fad24a5"));
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
        eyebrow={autoT("legacy.security_f25ce1b8")}
        breadcrumb={autoT("legacy.admin_audit_logs_bbc88d74")}
        icon={ShieldCheck}
        title={autoT("legacy.audit_logs_344c7ffc")}
        description={autoT("legacy.review_who_changed_financial_and_operational_records_w_0a630a40")}
        quickStats={[{ label: autoT("legacy.records_e51c5525"), value: count }]}
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
          {autoT("menu_item_sales.previous")}
        </button>
        <span className="text-sm text-slate-500">{autoT("legacy.page_fb06270f")} {filters.page || 1}</span>
        <button
          type="button"
          disabled={(filters.page || 1) * 20 >= count}
          onClick={() => setFilters((current) => ({ ...current, page: (current.page || 1) + 1 }))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {autoT("inventory_manager.common.next")}
        </button>
      </div>
      <AuditLogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </section>
  );
}

