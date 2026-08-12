import React from "react";
import { CreditCard, FileText } from "lucide-react";
import Modal from "../../shared/erp/components/Modal";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";
import AuditTimeline from "../../audit/components/AuditTimeline";

export default function ContractorProfileModal({ ledger, invoices, contracts, onPayment, onClose }) {
  const contractor = ledger?.contractor || {};
  const entries = ledger?.entries || [];
  const contractorInvoices = invoices.filter((invoice) => String(invoice.contractor) === String(contractor.id));
  const contractorContracts = contracts.filter((contract) => String(contract.contractor) === String(contractor.id));

  return (
    <Modal title={contractor.name || "Contractor Profile"} onClose={onClose} wide>
      <div className="space-y-5 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Total Invoiced" value={money(ledger?.total_invoiced)} />
          <Metric label="Total Paid" value={money(ledger?.total_paid)} />
          <Metric label="Outstanding" value={money(ledger?.outstanding_balance)} danger />
        </div>
        <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-950">{contractor.contact_person || "No contact person"}</p>
              <p>{contractor.phone || "No phone"}</p>
              {contractor.email && <p>{contractor.email}</p>}
            </div>
            <StatusBadge status={contractor.is_active ? "active" : "inactive"} />
          </div>
          {contractor.address && <p className="mt-3">{contractor.address}</p>}
          {contractor.notes && <p className="mt-3 text-slate-500">{contractor.notes}</p>}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-950">Contracts</h4>
            {contractorContracts.length ? contractorContracts.map((contract) => (
              <div key={contract.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{contract.title}</p>
                  <StatusBadge status={contract.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{contract.start_date} to {contract.end_date || "Open"}</p>
              </div>
            )) : <EmptyLine label="No contracts linked." />}
          </section>
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-950">Open Invoices</h4>
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
            {!contractorInvoices.filter((invoice) => Number(invoice.remaining_balance || 0) > 0).length && <EmptyLine label="No open invoices." />}
          </section>
        </div>
        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-950">Ledger Timeline</h4>
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
                  <span>Debit: {money(entry.debit)}</span>
                  <span>Credit: {money(entry.credit)}</span>
                  <span className="font-semibold text-slate-950">Balance: {money(entry.running_balance)}</span>
                </div>
              </div>
            </div>
          )) : <EmptyLine label="No ledger entries found." />}
        </section>
        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-950">Audit History</h4>
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
