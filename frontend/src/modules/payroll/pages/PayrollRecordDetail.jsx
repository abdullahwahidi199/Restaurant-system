import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, HandCoins, Minus, Plus } from "lucide-react";
import AdvanceTable from "../components/AdvanceTable";
import PaymentTable from "../components/PaymentTable";
import Panel from "../../shared/erp/components/Panel";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";
import AuditTimeline from "../../audit/components/AuditTimeline";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function PayrollRecordDetail({
  payroll,
  saving,
  onApprove,
  onPayment,
  basePath = "/admin/dashboard",
}) {
  const { t: autoT } = useAutoTranslation();

  if (!payroll) {
    return (
      <div className="theme-card p-8 text-center text-sm theme-text-secondary">
        {autoT("legacy.payroll_record_not_found_e5f16be7")}
      </div>
    );
  }

  const outstanding = Number(payroll.remaining_balance || 0);
  const payable = payroll.status !== "draft" && outstanding > 0;
  const earnings = [
    [
      autoT("payroll_record_detail.base_salary", {
        defaultValue: "Base Salary",
      }),
      payroll.base_salary,
    ],
    [
      autoT("payroll_record_detail.allowances", { defaultValue: "Allowances" }),
      payroll.allowances,
    ],
    [
      autoT("payroll_record_detail.bonuses", { defaultValue: "Bonuses" }),
      payroll.bonuses,
    ],
    [
      autoT("payroll_record_detail.overtime", { defaultValue: "Overtime" }),
      payroll.overtime_amount,
    ],
  ];
  const deductions = [
    [
      autoT("payroll_record_detail.deductions", { defaultValue: "Deductions" }),
      payroll.deductions,
    ],
    [
      autoT("payroll_record_detail.salary_advances", {
        defaultValue: "Salary Advances",
      }),
      payroll.advance_deductions,
    ],
  ];

  return (
    <div className="min-w-0 space-y-4">
      <header className="theme-card min-w-0 p-4 sm:p-5">
        <Link
          to={`${basePath}/payroll/records`}
          className="inline-flex items-center text-xs font-semibold text-[var(--theme-primary-hover)] hover:underline"
        >
          {autoT("legacy.back_to_payroll_records_e658aa61")}
        </Link>

        <div className="mt-3 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold theme-text-muted">
              {autoT("legacy.payroll_63835fb9")} {payroll.id}
            </p>
            <h1 className="mt-1 break-words text-2xl font-bold leading-tight theme-text-primary">
              {payroll.staff_name}
            </h1>
            <p className="mt-1 text-xs leading-relaxed theme-text-secondary">
              {payroll.period_start} {autoT("to")} {payroll.period_end}
              {payroll.period_type && (
                <span className="ms-2">· {payroll.period_type}</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={payroll.status} />
            {payroll.status === "draft" && (
              <button
                type="button"
                disabled={saving}
                onClick={() => onApprove(payroll)}
                className="theme-btn theme-btn-primary inline-flex h-9 items-center gap-2 px-3"
              >
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                {autoT("inventory_manager.common.approve")}
              </button>
            )}
            {payable && (
              <button
                type="button"
                onClick={() => onPayment(payroll)}
                className="theme-btn theme-btn-outline inline-flex h-9 items-center gap-2 px-3"
              >
                <HandCoins className="h-4 w-4" aria-hidden="true" />
                {autoT("legacy.record_payment_6577ced3")}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <div className="min-w-0 xl:col-start-2 xl:row-start-1">
          <Panel title={autoT("legacy.payable_summary_f8170ee2")}>
            <div className="space-y-0 text-sm">
              <SummaryRow
                label={autoT("legacy.gross_salary_b90af6eb")}
                value={money(payroll.gross_salary)}
              />
              <SummaryRow
                label={autoT("legacy.net_salary_cafacb25")}
                value={money(payroll.net_salary)}
                emphasized
              />
              <SummaryRow
                label={autoT("legacy.paid_dc9d4584")}
                value={money(payroll.amount_paid)}
              />
              <SummaryRow
                label={autoT("legacy.outstanding_f8ee57ec")}
                value={money(payroll.remaining_balance)}
                danger={outstanding > 0}
                emphasized
              />
            </div>
          </Panel>
        </div>

        <div className="min-w-0 xl:col-start-1 xl:row-start-1">
          <Panel title={autoT("legacy.salary_calculation_34b5e8f8")}>
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <CalculationGroup
                title={autoT("payroll_record_detail.earnings", {
                  defaultValue: "Earnings",
                })}
                rows={earnings}
                type="plus"
              />
              <CalculationGroup
                title={autoT("payroll_record_detail.deductions_group", {
                  defaultValue: "Deductions",
                })}
                rows={deductions}
                type="minus"
              />
            </div>
          </Panel>
        </div>
      </div>

      {/* Give each transaction table the page width instead of two narrow columns. */}
      <div className="min-w-0 space-y-4">
        <div className="min-w-0">
          <PaymentTable payments={payroll.payments || []} />
        </div>
        <div className="min-w-0">
          <AdvanceTable advances={payroll.applied_advances || []} />
        </div>
      </div>

      <div className="min-w-0">
        <Panel
          title={autoT("inventory_manager.ingredients.audit_history")}
          description={autoT(
            "legacy.recorded_changes_for_this_payroll_record_9fb86642",
          )}
        >
          <AuditTimeline
            module="PAYROLL"
            objectType="Payroll"
            objectId={payroll.id}
          />
        </Panel>
      </div>
    </div>
  );
}

function CalculationGroup({ title, rows, type }) {
  const Icon = type === "minus" ? Minus : Plus;
  const color =
    type === "minus"
      ? "text-[var(--theme-danger-hover)]"
      : "text-[var(--theme-success-hover)]";
  const surface =
    type === "minus"
      ? "bg-[var(--theme-danger-soft)]"
      : "bg-[var(--theme-success-soft)]";

  return (
    <section className="min-w-0">
      <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold theme-text-secondary">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-md ${surface} ${color}`}
          aria-hidden="true"
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        {title}
      </h2>
      <dl className="divide-y divide-[var(--theme-border)]">
        {rows.map(([label, amount]) => (
          <div
            key={label}
            className="flex min-w-0 items-baseline justify-between gap-3 py-2.5 text-xs sm:text-sm"
          >
            <dt className="min-w-0 theme-text-secondary">{label}</dt>
            <dd
              className={`shrink-0 text-end font-semibold tabular-nums ${type === "minus" ? color : "theme-text-primary"}`}
            >
              {type === "minus" ? "− " : "+ "}
              {money(amount)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SummaryRow({ label, value, danger = false, emphasized = false }) {
  return (
    <div
      className={`flex min-w-0 items-baseline justify-between gap-3 py-3 ${emphasized ? "border-t border-[var(--theme-border)]" : ""}`}
    >
      <span
        className={
          emphasized
            ? "font-semibold theme-text-primary"
            : "theme-text-secondary"
        }
      >
        {label}
      </span>
      <span
        className={`shrink-0 text-end font-semibold tabular-nums ${danger ? "text-[var(--theme-danger-hover)]" : "theme-text-primary"}`}
      >
        {value}
      </span>
    </div>
  );
}
