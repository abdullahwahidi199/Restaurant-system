import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, HandCoins } from "lucide-react";
import AdvanceTable from "../components/AdvanceTable";
import PaymentTable from "../components/PaymentTable";
import Panel from "../../shared/erp/components/Panel";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";
import AuditTimeline from "../../audit/components/AuditTimeline";

export default function PayrollRecordDetail({
  payroll,
  saving,
  onApprove,
  onPayment,
  basePath = "/admin/dashboard",
}) {
  if (!payroll) {
    return <p className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">Payroll record not found.</p>;
  }
  const payable = payroll.status !== "draft" && Number(payroll.remaining_balance || 0) > 0;
  const rows = [
    ["Base Salary", payroll.base_salary, "plus"],
    ["Allowances", payroll.allowances, "plus"],
    ["Bonuses", payroll.bonuses, "plus"],
    ["Overtime", payroll.overtime_amount, "plus"],
    ["Deductions", payroll.deductions, "minus"],
    ["Salary Advances", payroll.advance_deductions, "minus"],
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Link to={`${basePath}/payroll/records`} className="text-sm font-semibold text-slate-500 hover:text-slate-950">
          Back to payroll records
        </Link>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Payroll #{payroll.id}</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">{payroll.staff_name}</h2>
            <p className="mt-2 text-sm text-slate-500">{payroll.period_start} to {payroll.period_end} - {payroll.period_type}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={payroll.status} />
            {payroll.status === "draft" && (
              <button disabled={saving} onClick={() => onApprove(payroll)} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                <BadgeCheck className="h-4 w-4" />
                Approve
              </button>
            )}
            {payable && (
              <button onClick={() => onPayment(payroll)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <HandCoins className="h-4 w-4" />
                Record Payment
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Salary Calculation">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs font-semibold uppercase text-slate-500">
                <tr><th className="pb-3">Line</th><th className="pb-3">Type</th><th className="pb-3 text-right">Amount</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(([label, amount, type]) => (
                  <tr key={label}>
                    <td className="py-3 font-semibold text-slate-950">{label}</td>
                    <td className="py-3 capitalize text-slate-500">{type}</td>
                    <td className={`py-3 text-right font-semibold ${type === "minus" ? "text-rose-700" : "text-slate-950"}`}>{type === "minus" ? "- " : ""}{money(amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Payable Summary">
          <div className="space-y-3 text-sm">
            <SummaryRow label="Gross Salary" value={money(payroll.gross_salary)} />
            <SummaryRow label="Net Salary" value={money(payroll.net_salary)} />
            <SummaryRow label="Paid" value={money(payroll.amount_paid)} />
            <SummaryRow label="Outstanding" value={money(payroll.remaining_balance)} danger />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PaymentTable payments={payroll.payments || []} />
        <AdvanceTable advances={payroll.applied_advances || []} />
      </div>

      <Panel title="Audit History" description="Recorded changes for this payroll record.">
        <AuditTimeline module="PAYROLL" objectType="Payroll" objectId={payroll.id} />
      </Panel>
    </div>
  );
}

function SummaryRow({ label, value, danger }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${danger ? "text-rose-700" : "text-slate-950"}`}>{value}</span>
    </div>
  );
}
