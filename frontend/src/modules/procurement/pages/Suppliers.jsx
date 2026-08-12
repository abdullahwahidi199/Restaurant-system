import React from "react";
import { Eye, UserPlus } from "lucide-react";
import EmptyState from "../../shared/erp/components/EmptyState";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";

export default function Suppliers({ suppliers, onAdd, onOpen, onToggle }) {
  return (
    <div className="space-y-4">
      <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
        <UserPlus className="h-4 w-4" />
        New Supplier
      </button>
      {suppliers.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((supplier) => (
            <article key={supplier.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{supplier.name}</h3>
                  <p className="text-sm text-slate-500">
                    {supplier.contact_person || "No contact"} - {supplier.phone || "No phone"}
                  </p>
                </div>
                <StatusBadge status={supplier.is_active ? "active" : "inactive"} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <Metric label="Purchases" value={money(supplier.total_purchases)} />
                <Metric label="Paid" value={money(supplier.total_paid)} />
                <Metric label="Balance" value={money(supplier.outstanding_balance)} />
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => onOpen(supplier)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Eye className="h-4 w-4" />
                  Profile
                </button>
                <button type="button" onClick={() => onToggle(supplier)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {supplier.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No suppliers yet" description="Create supplier profiles to track balances, invoices, and payment history." />
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
