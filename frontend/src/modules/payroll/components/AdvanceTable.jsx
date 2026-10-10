import React from "react";
import DataTable from "../../shared/erp/components/DataTable";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function AdvanceTable({ advances }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <DataTable
      rows={advances}
      empty={autoT("legacy.no_salary_advances_found_f5d5d0eb")}
      columns={[
        { key: "date", header: "Date" },
        { key: "employee", header: "Employee", render: (advance) => advance.staff_name },
        { key: "reason", header: "Reason", render: (advance) => advance.reason || advance.notes || "-" },
        { key: "applied", header: "Applied", render: (advance) => <StatusBadge status={advance.is_applied ? "applied" : "open"} /> },
        { key: "amount", header: "Amount", className: "text-right font-semibold tabular-nums theme-text-primary", render: (advance) => money(advance.amount) },
      ]}
    />
  );
}
