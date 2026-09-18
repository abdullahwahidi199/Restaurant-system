import React from "react";
import { CreditCard, HandCoins, ReceiptText, Users, Wrench } from "lucide-react";
import MiniBarChart from "../../shared/erp/components/MiniBarChart";
import Panel from "../../shared/erp/components/Panel";
import StatCard from "../../shared/erp/components/StatCard";
import Timeline from "../../shared/erp/components/Timeline";
import { money } from "../../shared/erp/formatters";
import ContractorInvoiceTable from "../components/ContractorInvoiceTable";
import { useTranslation as useAutoTranslation } from "react-i18next";

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
                 const { t: autoT } = useAutoTranslation();
  const maxProgress = Math.max(1, Number(summary?.total_invoiced || 0));
  const progressRows = [
    { label: autoT("legacy.paid_dc9d4584"), value: summary?.total_paid || 0, tone: "green" },
    { label: autoT("legacy.outstanding_f8ee57ec"), value: summary?.outstanding_balance || 0, tone: "rose" },
  ];
  const contractorRows = topContractors.map((contractor) => ({
    label: contractor.name,
    value: contractor.total_invoiced,
    tone: "purple",
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label={autoT("legacy.active_contractors_c625b354")} value={summary?.active_contractors || 0} icon={Users} tone="purple" trend="up" trendLabel={autoT("staff.status.active")} />
        <StatCard label={autoT("legacy.open_invoices_15b94544")} value={summary?.open_invoices || 0} icon={ReceiptText} tone="orange" trend="flat" trendLabel={autoT("stats.pending")} />
        <StatCard label={autoT("legacy.total_contract_value_8b45503b")} value={money(summary?.total_invoiced)} icon={Wrench} tone="blue" trend="up" trendLabel={autoT("legacy.booked_13e7a657")} />
        <StatCard label={autoT("legacy.remaining_payments_4ba53270")} value={money(summary?.outstanding_balance)} icon={CreditCard} tone="rose" trend="down" trendLabel={autoT("legacy.due_145caf29")} />
        <StatCard label={autoT("legacy.total_paid_6a151d73")} value={money(summary?.total_paid)} icon={HandCoins} tone="green" trend="up" trendLabel={autoT("legacy.posted_301777ff")} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel title={autoT("legacy.recent_service_invoices_f178f7a2")} to={`${basePath}/contractors/invoices`}>
            <ContractorInvoiceTable invoices={recentInvoices} onOpen={onOpenInvoice} onPayment={onPayment} compact />
          </Panel>
        </div>
        <Panel title={autoT("legacy.top_contractors_b6643117")} to={`${basePath}/contractors/contractors`}>
          <div className="space-y-2">
            {topContractors.length ? topContractors.map((contractor) => (
              <div key={contractor.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-950">{contractor.name}</p>
                  <p className="text-sm font-semibold text-slate-950">{money(contractor.total_invoiced)}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">{autoT("legacy.balance_90eef613")} {money(contractor.outstanding_balance)}</p>
              </div>
            )) : <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">{autoT("legacy.no_contractors_yet_1d661af9")}</p>}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title={autoT("legacy.payment_progress_1ebe4944")} description={`Against ${money(maxProgress)} invoiced.`}>
          <MiniBarChart rows={progressRows} tone="green" />
        </Panel>
        <Panel title={autoT("legacy.contractor_expenses_b22d5462")} description={autoT("legacy.highest_contractor_invoice_totals_7230bdb1")}>
          <MiniBarChart rows={contractorRows} tone="purple" empty={autoT("legacy.no_contractor_expense_data_yet_abc33d36")} />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title={autoT("legacy.contractor_payables_b19d6dfa")} to={`${basePath}/contractors/payables`}>
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
            {!payableInvoices.length && <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">{autoT("legacy.no_open_contractor_payables_eec80193")}</p>}
          </div>
        </Panel>
        <Panel title={autoT("legacy.recent_payments_3abf211c")} to={`${basePath}/contractors/payments`}>
          <Timeline items={payments} empty={autoT("legacy.no_contractor_payments_recorded_yet_62c180cb")} />
        </Panel>
      </div>
    </div>
  );
}
