import React from "react";
import DataTable from "../../shared/erp/components/DataTable";
import { formatMethod, money } from "../../shared/erp/formatters";

export default function PaymentTable({ payments }) {
  return (
    <DataTable
      rows={payments}
      empty="No payroll payments found."
      columns={[
        { key: "date", header: "Date" },
        { key: "employee", header: "Employee", render: (payment) => payment.staff_name },
        { key: "period", header: "Period", render: (payment) => payment.payroll_period || payment.period || "-" },
        { key: "method", header: "Method", render: (payment) => formatMethod(payment.payment_method) },
        { key: "reference", header: "Reference", render: (payment) => payment.reference_number || "-" },
        { key: "amount", header: "Amount", className: "px-4 py-3 text-right font-semibold text-slate-950", render: (payment) => money(payment.amount) },
      ]}
    />
  );
}
