import React from "react";
import DataTable from "../../shared/erp/components/DataTable";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { money } from "../../shared/erp/formatters";

export default function AdvanceTable({ advances }) {
  return (
    <DataTable
      rows={advances}
      empty="No salary advances found."
      columns={[
        { key: "date", header: "Date" },
        { key: "employee", header: "Employee", render: (advance) => advance.staff_name },
        { key: "reason", header: "Reason", render: (advance) => advance.reason || advance.notes || "-" },
        { key: "applied", header: "Applied", render: (advance) => <StatusBadge status={advance.is_applied ? "applied" : "open"} /> },
        { key: "amount", header: "Amount", className: "px-4 py-3 text-right font-semibold text-slate-950", render: (advance) => money(advance.amount) },
      ]}
    />
  );
}
