import React from "react";
import { CreditCard, HandCoins, ReceiptText, Users, Wrench } from "lucide-react";
import MiniBarChart from "../../shared/erp/components/MiniBarChart";
import Panel from "../../shared/erp/components/Panel";
import StatCard from "../../shared/erp/components/StatCard";
import Timeline from "../../shared/erp/components/Timeline";
import { money } from "../../shared/erp/formatters";
import ContractorInvoiceTable from "../components/ContractorInvoiceTable";

export default function ContractorsDashboard({
  summary,
  recentInvoices,
  payableInvoices,
  topContractors,
  payments,
  onOpenInvoice,
  onPayment,
  basePath = "/admin/dashboard",
}) {
  const maxProgress = Math.max(1, Number(summary?.total_invoiced || 0));
  const progressRows = [
    { label: "Paid", value: summary?.total_paid || 0, tone: "green" },
    { label: "Outstanding", value: summary?.outstanding_balance || 0, tone: "rose" },
  ];
  const contractorRows = topContractors.map((contractor) => ({
    label: contractor.name,
    value: contractor.total_invoiced,
    tone: "purple",
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Active Contractors" value={summary?.active_contractors || 0} icon={Users} tone="purple" trend="up" trendLabel="Active" />
        <StatCard label="Open Invoices" value={summary?.open_invoices || 0} icon={ReceiptText} tone="orange" trend="flat" trendLabel="Pending" />
        <StatCard label="Total Contract Value" value={money(summary?.total_invoiced)} icon={Wrench} tone="blue" trend="up" trendLabel="Booked" />
        <StatCard label="Remaining Payments" value={money(summary?.outstanding_balance)} icon={CreditCard} tone="rose" trend="down" trendLabel="Due" />
        <StatCard label="Total Paid" value={money(summary?.total_paid)} icon={HandCoins} tone="green" trend="up" trendLabel="Posted" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel title="Recent Service Invoices" to={`${basePath}/contractors/invoices`}>
            <ContractorInvoiceTable invoices={recentInvoices} onOpen={onOpenInvoice} onPayment={onPayment} compact />
          </Panel>
        </div>
        <Panel title="Top Contractors" to={`${basePath}/contractors/contractors`}>
          <div className="space-y-2">
            {topContractors.length ? topContractors.map((contractor) => (
              <div key={contractor.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-950">{contractor.name}</p>
                  <p className="text-sm font-semibold text-slate-950">{money(contractor.total_invoiced)}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">Balance {money(contractor.outstanding_balance)}</p>
              </div>
            )) : <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">No contractors yet.</p>}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Payment Progress" description={`Against ${money(maxProgress)} invoiced.`}>
          <MiniBarChart rows={progressRows} tone="green" />
        </Panel>
        <Panel title="Contractor Expenses" description="Highest contractor invoice totals.">
          <MiniBarChart rows={contractorRows} tone="purple" empty="No contractor expense data yet." />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Contractor Payables" to={`${basePath}/contractors/payables`}>
          <div className="space-y-2">
            {payableInvoices.map((invoice) => (
              <button key={invoice.id} type="button" onClick={() => onOpenInvoice(invoice.id)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 text-left hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-950">{invoice.invoice_number || `CINV-${invoice.id}`}</p>
                  <p className="text-xs text-slate-500">{invoice.contractor_name}</p>
                </div>
                <p className="font-semibold text-rose-700">{money(invoice.remaining_balance)}</p>
              </button>
            ))}
            {!payableInvoices.length && <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">No open contractor payables.</p>}
          </div>
        </Panel>
        <Panel title="Recent Payments" to={`${basePath}/contractors/payments`}>
          <Timeline items={payments} empty="No contractor payments recorded yet." />
        </Panel>
      </div>
    </div>
  );
}
