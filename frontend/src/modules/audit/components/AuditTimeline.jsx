import React, { useEffect, useState } from "react";
import { History } from "lucide-react";
import { getAuditLogs } from "../../../api/auditApi";
import AuditActionBadge from "./AuditActionBadge";
import AuditChangeDiff from "./AuditChangeDiff";

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "-";

export default function AuditTimeline({ objectType, objectId, module }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!objectType || !objectId) return undefined;
    let cancelled = false;
    setLoading(true);
    setError("");
    getAuditLogs({
      object_type: objectType,
      object_id: objectId,
      module,
      page_size: 50,
    })
      .then((res) => {
        if (!cancelled) setLogs(res.data?.results || []);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load audit history.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [module, objectId, objectType]);

  if (loading) {
    return <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Loading audit history...</p>;
  }

  if (error) {
    return <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</p>;
  }

  if (!logs.length) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
        No audit history recorded for this item yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-3">
          <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <History className="h-4 w-4" />
          </span>
          <div className="flex-1 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">
                  {log.user_name || "System"} {String(log.action || "").toLowerCase().replace("_", " ")}
                </p>
                <p className="text-sm text-slate-500">{formatDateTime(log.created_at)}</p>
              </div>
              <AuditActionBadge action={log.action} />
            </div>
            {log.description && <p className="mt-3 text-sm text-slate-600">{log.description}</p>}
            <div className="mt-3">
              <AuditChangeDiff changes={log.changes} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

