import React from "react";
import { Edit3, Eye, UserPlus } from "lucide-react";
import EmptyState from "../../shared/erp/components/EmptyState";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";

export default function ContractorsList({ contractors, onAdd, onEdit, onOpen }) {
  return (
    <div className="space-y-4">
      <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
        <UserPlus className="h-4 w-4" />
        New Contractor
      </button>
      {contractors.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {contractors.map((contractor) => (
            <article key={contractor.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{contractor.name}</h3>
                  <p className="text-sm text-slate-500">
                    {contractor.contact_person || "No contact"} - {contractor.phone || "No phone"}
                  </p>
                </div>
                <StatusBadge status={contractor.is_active ? "active" : "inactive"} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <Metric label="Invoiced" value={money(contractor.total_invoiced)} />
                <Metric label="Paid" value={money(contractor.total_paid)} />
                <Metric label="Balance" value={money(contractor.outstanding_balance)} />
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => onOpen(contractor.id)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Eye className="h-4 w-4" />
                  Profile
                </button>
                <button type="button" onClick={() => onEdit(contractor)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No contractors yet" description="Create contractor profiles before recording service contracts and invoices." />
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
