import React from "react";
import { Eye } from "lucide-react";
import DataTable from "../../shared/erp/components/DataTable";
import AuditActionBadge from "./AuditActionBadge";

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "-";

export default function AuditLogTable({ logs, loading, onOpen }) {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading audit logs...
      </div>
    );
  }

  return (
    <DataTable
      rows={logs}
      empty="No audit logs found."
      columns={[
        { key: "time", header: "Time", render: (log) => formatDateTime(log.created_at) },
        { key: "user", header: "User", render: (log) => log.user_name || "System" },
        { key: "module", header: "Module", render: (log) => log.module_display || log.module },
        { key: "action", header: "Action", render: (log) => <AuditActionBadge action={log.action} /> },
        { key: "object", header: "Object", render: (log) => log.object_repr || `${log.object_type} #${log.object_id}` },
        { key: "description", header: "Description", render: (log) => log.description || "-" },
        { key: "branch", header: "Branch", render: (log) => log.branch_name || "-" },
        {
          key: "open",
          header: "",
          className: "px-4 py-3 text-right",
          render: (log) => (
            <button
              type="button"
              onClick={() => onOpen(log)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              title="View audit details"
            >
              <Eye className="h-4 w-4" />
            </button>
          ),
        },
      ]}
    />
  );
}

