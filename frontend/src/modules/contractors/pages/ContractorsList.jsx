import React from "react";
import { Edit3, Eye, Trash2, UserPlus } from "lucide-react";
import EmptyState from "../../shared/erp/components/EmptyState";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ContractorsList({ contractors, onAdd, onEdit, onDelete, onOpen }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="space-y-4">
      <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
        <UserPlus className="h-4 w-4" />
        {autoT("legacy.new_contractor_ad166ddc")}
      </button>
      {contractors.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {contractors.map((contractor) => (
            <article key={contractor.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{contractor.name}</h3>
                  <p className="text-sm text-slate-500">
                    {contractor.contact_person || autoT("legacy.no_contact_b3046fcc")} - {contractor.phone || autoT("legacy.no_phone_4808dd2c")}
                  </p>
                </div>
                <StatusBadge status={contractor.is_active ? "active" : "inactive"} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <Metric label={autoT("legacy.invoiced_4da40d1d")} value={money(contractor.total_invoiced)} />
                <Metric label={autoT("legacy.paid_dc9d4584")} value={money(contractor.total_paid)} />
                <Metric label={autoT("legacy.balance_90eef613")} value={money(contractor.outstanding_balance)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => onOpen(contractor.id)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Eye className="h-4 w-4" />
                  {autoT("landing.actions.profile")}
                </button>
                <button type="button" onClick={() => onEdit(contractor)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Edit3 className="h-4 w-4" />
                  {autoT("staff.table.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(
                      `${autoT("legacy.are_you_sure_you_want_to_delete_de36321b")}${contractor.name}${autoT("legacy.this_action_cannot_be_undone_66ac3236")}`,
                    )) {
                      onDelete(contractor);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {autoT("staff.table.delete")}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title={autoT("legacy.no_contractors_yet_5ef04394")} description={autoT("legacy.create_contractor_profiles_before_recording_service_co_82bcfc2e")} />
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="break-words text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}
