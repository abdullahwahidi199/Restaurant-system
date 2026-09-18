import React from "react";
import Modal from "../../shared/erp/components/Modal";
import AuditActionBadge from "./AuditActionBadge";
import AuditChangeDiff from "./AuditChangeDiff";
import { useTranslation as useAutoTranslation } from "react-i18next";

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
                 const { t: autoT } = useAutoTranslation();
  if (!log) return null;

  return (
    <Modal title={autoT("legacy.audit_details_0b5613a7")} onClose={onClose} wide>
      <div className="space-y-5 p-5">
        <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
          <MetaRow label={autoT("legacy.user_9f8a2389")} value={log.user_name} />
          <MetaRow label={autoT("legacy.time_6c82e6dd")} value={formatDateTime(log.created_at)} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {autoT("inventory_manager.common.action")}
            </p>
            <div className="mt-1">
              <AuditActionBadge action={log.action} />
            </div>
          </div>
          <MetaRow label={autoT("legacy.module_b8ff0289")} value={log.module_display || log.module} />
          <MetaRow label={autoT("legacy.object_2883f191")} value={log.object_repr || log.object_id} />
          <MetaRow label={autoT("settings_center.nav.branch")} value={log.branch_name || "All branches"} />
          <MetaRow label={autoT("legacy.ip_address_11f51070")} value={log.ip_address} />
          <MetaRow label={autoT("attendance.table.role")} value={log.user_role} />
          <MetaRow label={autoT("legacy.object_type_cadc9423")} value={log.object_type} />
        </div>

        {log.description && (
          <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700">
            {log.description}
          </div>
        )}

        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-950">{autoT("legacy.changed_fields_3d9a97d5")}</h3>
          <AuditChangeDiff changes={log.changes} />
        </section>
      </div>
    </Modal>
  );
}

