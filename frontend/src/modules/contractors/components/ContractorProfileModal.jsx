import React from "react";
import { CreditCard, FileText } from "lucide-react";
import Modal from "../../shared/erp/components/Modal";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";
import AuditTimeline from "../../audit/components/AuditTimeline";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ContractorProfileModal({ ledger, invoices, contracts, onPayment, onClose }) {
                 const { t: autoT } = useAutoTranslation();
  const contractor = ledger?.contractor || {};
  const entries = ledger?.entries || [];
  const contractorInvoices = invoices.filter((invoice) => String(invoice.contractor) === String(contractor.id));
  const contractorContracts = contracts.filter((contract) => String(contract.contractor) === String(contractor.id));

  return (
    <Modal title={contractor.name || autoT("legacy.contractor_profile_7e8e7edf")} onClose={onClose} wide>
      <div className="space-y-5 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label={autoT("legacy.total_invoiced_7ee292a6")} value={money(ledger?.total_invoiced)} />
          <Metric label={autoT("legacy.total_paid_6a151d73")} value={money(ledger?.total_paid)} />
          <Metric label={autoT("legacy.outstanding_f8ee57ec")} value={money(ledger?.outstanding_balance)} danger />
        </div>
        <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-950">{contractor.contact_person || autoT("legacy.no_contact_person_0fd0b6b0")}</p>
              <p>{contractor.phone || autoT("legacy.no_phone_4808dd2c")}</p>
              {contractor.email && <p>{contractor.email}</p>}
            </div>
            <StatusBadge status={contractor.is_active ? "active" : "inactive"} />
          </div>
          {contractor.address && <p className="mt-3">{contractor.address}</p>}
          {contractor.notes && <p className="mt-3 text-slate-500">{contractor.notes}</p>}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-950">{autoT("legacy.contracts_32767bc8")}</h4>
            {contractorContracts.length ? contractorContracts.map((contract) => (
              <div key={contract.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{contract.title}</p>
                  <StatusBadge status={contract.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{contract.start_date} {autoT("to")} {contract.end_date || autoT("landing.marketplace.card.open")}</p>
              </div>
            )) : <EmptyLine label={autoT("legacy.no_contracts_linked_f61160c6")} />}
          </section>
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-950">{autoT("legacy.open_invoices_15b94544")}</h4>
            {contractorInvoices.filter((invoice) => Number(invoice.remaining_balance || 0) > 0).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="font-semibold text-slate-950">{invoice.invoice_number || `CINV-${invoice.id}`}</p>
                  <p className="text-sm text-slate-500">{money(invoice.remaining_balance)}</p>
                </div>
                <button type="button" onClick={() => onPayment(invoice)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                  <CreditCard className="h-4 w-4" />
                </button>
              </div>
            ))}
            {!contractorInvoices.filter((invoice) => Number(invoice.remaining_balance || 0) > 0).length && <EmptyLine label={autoT("legacy.no_open_invoices_21ff5b5d")} />}
          </section>
        </div>
        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-950">{autoT("legacy.ledger_timeline_63e773cf")}</h4>
          {entries.length ? entries.map((entry, index) => (
            <div key={`${entry.type}-${entry.id}-${index}`} className="flex gap-3">
              <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <FileText className="h-4 w-4" />
              </span>
              <div className="flex-1 rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold capitalize text-slate-950">{entry.type} - {entry.label}</p>
                  <p className="text-sm text-slate-500">{entry.date}</p>
                </div>
                <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                  <span>{autoT("legacy.debit_b11fa30b")} {money(entry.debit)}</span>
                  <span>{autoT("legacy.credit_7b57fda6")} {money(entry.credit)}</span>
                  <span className="font-semibold text-slate-950">{autoT("legacy.balance_802dc024")} {money(entry.running_balance)}</span>
                </div>
              </div>
            </div>
          )) : <EmptyLine label={autoT("legacy.no_ledger_entries_found_40f00c77")} />}
        </section>
        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-950">{autoT("inventory_manager.ingredients.audit_history")}</h4>
          <AuditTimeline
            module="CONTRACTORS"
            objectType="Contractor"
            objectId={contractor.id}
          />
        </section>
      </div>
    </Modal>
  );
}

function Metric({ label, value, danger }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${danger ? "text-rose-700" : "text-slate-950"}`}>{value}</p>
    </div>
  );
}

function EmptyLine({ label }) {
  return <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">{label}</p>;
}
