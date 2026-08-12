import React from "react";
import Modal from "../../shared/erp/components/Modal";
import AuditActionBadge from "./AuditActionBadge";
import AuditChangeDiff from "./AuditChangeDiff";

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "-";

function MetaRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-950">
        {value || "-"}
      </p>
    </div>
  );
}

export default function AuditLogDetailsModal({ log, onClose }) {
  if (!log) return null;

  return (
    <Modal title="Audit Details" onClose={onClose} wide>
      <div className="space-y-5 p-5">
        <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
          <MetaRow label="User" value={log.user_name} />
          <MetaRow label="Time" value={formatDateTime(log.created_at)} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Action
            </p>
            <div className="mt-1">
              <AuditActionBadge action={log.action} />
            </div>
          </div>
          <MetaRow label="Module" value={log.module_display || log.module} />
          <MetaRow label="Object" value={log.object_repr || log.object_id} />
          <MetaRow label="Branch" value={log.branch_name || "All branches"} />
          <MetaRow label="IP Address" value={log.ip_address} />
          <MetaRow label="Role" value={log.user_role} />
          <MetaRow label="Object Type" value={log.object_type} />
        </div>

        {log.description && (
          <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700">
            {log.description}
          </div>
        )}

        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-950">Changed Fields</h3>
          <AuditChangeDiff changes={log.changes} />
        </section>
      </div>
    </Modal>
  );
}

