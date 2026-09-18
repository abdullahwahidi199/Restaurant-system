import React from "react";
import { Edit3, Eye, Trash2, UserPlus } from "lucide-react";
import EmptyState from "../../shared/erp/components/EmptyState";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function Suppliers({ suppliers, onAdd, onEdit, onDelete, onOpen, onToggle }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="space-y-4">
      <button type="button" onClick={onAdd} className="theme-btn theme-btn-primary h-[38px] px-4">
        <UserPlus className="h-4 w-4" />
        {autoT("legacy.new_supplier_4e3feaa6")}
      </button>
      {suppliers.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((supplier) => (
            <article key={supplier.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{supplier.name}</h3>
                  <p className="text-sm text-slate-500">
                    {supplier.contact_person || autoT("legacy.no_contact_b3046fcc")} - {supplier.phone || autoT("legacy.no_phone_4808dd2c")}
                  </p>
                </div>
                <StatusBadge status={supplier.is_active ? "active" : "inactive"} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <Metric label={autoT("legacy.purchases_6c4e94f1")} value={money(supplier.total_purchases)} />
                <Metric label={autoT("legacy.paid_dc9d4584")} value={money(supplier.total_paid)} />
                <Metric label={autoT("legacy.balance_90eef613")} value={money(supplier.outstanding_balance)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => onOpen(supplier)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Eye className="h-4 w-4" />
                  {autoT("landing.actions.profile")}
                </button>
                <button type="button" onClick={() => onToggle(supplier)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {supplier.is_active ? autoT("legacy.deactivate_d65ded94") : autoT("legacy.activate_92ef0832")}
                </button>
                <button type="button" onClick={() => onEdit(supplier)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Edit3 className="h-4 w-4" />
                  {autoT("staff.table.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(
                      `${autoT("legacy.are_you_sure_you_want_to_delete_de36321b")}${supplier.name}${autoT("legacy.this_action_cannot_be_undone_66ac3236")}`,
                    )) {
                      onDelete(supplier);
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
        <EmptyState title={autoT("legacy.no_suppliers_yet_f967a88e")} description={autoT("legacy.create_supplier_profiles_to_track_balances_invoices_an_2bedd8c3")} />
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
