import React from "react";
import { Link } from "react-router-dom";
import { Check, Eye, HandCoins } from "lucide-react";
import DataTable from "../../shared/erp/components/DataTable";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function PayrollTable({
  payrolls,
  onApprove,
  onPayment,
  basePath = "/admin/dashboard",
}) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <DataTable
      rows={payrolls}
      empty={autoT("legacy.no_payroll_records_found_c829c9b0")}
      columns={[
        {
          key: "employee",
          header: "Employee",
          render: (payroll) => (
            <div>
              <Link to={`${basePath}/payroll/records/${payroll.id}`} className="font-semibold theme-text-primary hover:underline">
                {payroll.staff_name}
              </Link>
              <p className="text-xs capitalize theme-text-muted">{payroll.salary_type || payroll.period_type}</p>
            </div>
          ),
        },
        { key: "period", header: "Period", render: (payroll) => `${payroll.period_start} to ${payroll.period_end}` },
        { key: "gross", header: "Gross", className: "text-right tabular-nums", render: (payroll) => money(payroll.gross_salary) },
        { key: "net", header: "Net", className: "text-right font-semibold tabular-nums theme-text-primary", render: (payroll) => money(payroll.net_salary) },
        { key: "paid", header: "Paid", className: "text-right tabular-nums", render: (payroll) => money(payroll.amount_paid) },
        { key: "balance", header: "Balance", className: "text-right font-semibold tabular-nums text-[var(--theme-danger)]", render: (payroll) => money(payroll.remaining_balance) },
        { key: "status", header: "Status", render: (payroll) => <StatusBadge status={payroll.status} /> },
        {
          key: "actions",
          header: "Actions",
          render: (payroll) => {
            const payable = payroll.status !== "draft" && Number(payroll.remaining_balance || 0) > 0;
            return (
              <div className="flex justify-end gap-1">
                <Link to={`${basePath}/payroll/records/${payroll.id}`} className="theme-btn theme-btn-ghost theme-btn-icon theme-text-muted" aria-label="Open payroll record">
                  <Eye className="h-4 w-4" />
                </Link>
                {payroll.status === "draft" && onApprove && (
                  <button type="button" onClick={() => onApprove(payroll)} className="theme-btn theme-btn-ghost theme-btn-icon theme-text-muted" aria-label="Approve payroll">
                    <Check className="h-4 w-4" />
                  </button>
                )}
                {payable && onPayment && (
                  <button type="button" onClick={() => onPayment(payroll)} className="theme-btn theme-btn-ghost theme-btn-icon theme-text-muted" aria-label="Record payroll payment">
                    <HandCoins className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          },
        },
      ]}
    />
  );
}
