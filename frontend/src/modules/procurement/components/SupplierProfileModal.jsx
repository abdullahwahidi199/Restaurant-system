import React from "react";
import { Clock, FileText } from "lucide-react";
import Modal from "../../shared/erp/components/Modal";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function SupplierProfileModal({ ledger, onClose }) {
                 const { t: autoT } = useAutoTranslation();
  const supplier = ledger?.supplier || {};
  const entries = ledger?.entries || [];

  return (
    <Modal title={supplier.name || autoT("legacy.supplier_profile_f31a8fab")} onClose={onClose} wide>
      <div className="space-y-5 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["Total Purchases", ledger?.total_purchases],
            ["Total Paid", ledger?.total_paid],
            ["Outstanding", ledger?.outstanding_balance],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">{money(value)}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-950">{supplier.contact_person || autoT("legacy.no_contact_person_0fd0b6b0")}</p>
              <p>{supplier.phone || autoT("legacy.no_phone_4808dd2c")}</p>
              {supplier.email && <p>{supplier.email}</p>}
            </div>
            <StatusBadge status={supplier.is_active ? "active" : "inactive"} />
          </div>
          {supplier.address && <p className="mt-3">{supplier.address}</p>}
          {supplier.notes && <p className="mt-3 text-slate-500">{supplier.notes}</p>}
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-950">{autoT("legacy.ledger_timeline_63e773cf")}</h4>
          {entries.length ? (
            entries.map((entry, index) => (
              <div key={`${entry.type}-${entry.id}-${index}`} className="flex gap-3">
                <span className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${entry.type === "invoice" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {entry.type === "invoice" ? <FileText className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </span>
                <div className="flex-1 rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold capitalize text-slate-950">
                      {entry.type} - {entry.label}
                    </p>
                    <p className="text-sm text-slate-500">{entry.date}</p>
                  </div>
                  <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                    <span>{autoT("legacy.debit_b11fa30b")} {money(entry.debit)}</span>
                    <span>{autoT("legacy.credit_7b57fda6")} {money(entry.credit)}</span>
                    <span className="font-semibold text-slate-950">{autoT("legacy.balance_802dc024")} {money(entry.running_balance)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
              {autoT("legacy.no_ledger_entries_found_40f00c77")}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
