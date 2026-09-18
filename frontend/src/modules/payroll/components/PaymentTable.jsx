import React from "react";
import DataTable from "../../shared/erp/components/DataTable";
import { formatMethod, money } from "../../shared/erp/formatters";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function PaymentTable({ payments }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <DataTable
      rows={payments}
      empty={autoT("legacy.no_payroll_payments_found_7102ebdc")}
      columns={[
        { key: "date", header: "Date" },
        { key: "employee", header: "Employee", render: (payment) => payment.staff_name },
        { key: "period", header: "Period", render: (payment) => payment.payroll_period || payment.period || "-" },
        { key: "method", header: "Method", render: (payment) => formatMethod(payment.payment_method) },
        { key: "reference", header: "Reference", render: (payment) => payment.reference_number || "-" },
        { key: "amount", header: "Amount", className: "px-4 py-2.5 text-right font-semibold tabular-nums theme-text-primary", render: (payment) => money(payment.amount) },
      ]}
    />
  );
}
