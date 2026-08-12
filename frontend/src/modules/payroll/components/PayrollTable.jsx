import React from "react";
import { Link } from "react-router-dom";
import { Check, Eye, HandCoins } from "lucide-react";
import DataTable from "../../shared/erp/components/DataTable";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";

export default function PayrollTable({
  payrolls,
  onApprove,
  onPayment,
  basePath = "/admin/dashboard",
}) {
  return (
    <DataTable
      rows={payrolls}
      empty="No payroll records found."
      columns={[
        {
          key: "employee",
          header: "Employee",
          render: (payroll) => (
            <div>
              <Link to={`${basePath}/payroll/records/${payroll.id}`} className="font-semibold text-slate-950 hover:underline">
                {payroll.staff_name}
              </Link>
              <p className="text-xs capitalize text-slate-500">{payroll.salary_type || payroll.period_type}</p>
            </div>
          ),
        },
        { key: "period", header: "Period", render: (payroll) => `${payroll.period_start} to ${payroll.period_end}` },
        { key: "gross", header: "Gross", className: "px-4 py-3 text-right", render: (payroll) => money(payroll.gross_salary) },
        { key: "net", header: "Net", className: "px-4 py-3 text-right font-semibold text-slate-950", render: (payroll) => money(payroll.net_salary) },
        { key: "paid", header: "Paid", className: "px-4 py-3 text-right", render: (payroll) => money(payroll.amount_paid) },
        { key: "balance", header: "Balance", className: "px-4 py-3 text-right font-semibold text-rose-700", render: (payroll) => money(payroll.remaining_balance) },
        { key: "status", header: "Status", render: (payroll) => <StatusBadge status={payroll.status} /> },
        {
          key: "actions",
          header: "Actions",
          className: "px-4 py-3",
          render: (payroll) => {
            const payable = payroll.status !== "draft" && Number(payroll.remaining_balance || 0) > 0;
            return (
              <div className="flex justify-end gap-1">
                <Link to={`${basePath}/payroll/records/${payroll.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
                  <Eye className="h-4 w-4" />
                </Link>
                {payroll.status === "draft" && onApprove && (
                  <button type="button" onClick={() => onApprove(payroll)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
                    <Check className="h-4 w-4" />
                  </button>
                )}
                {payable && onPayment && (
                  <button type="button" onClick={() => onPayment(payroll)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
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
