import React from "react";
import { Link } from "react-router-dom";
import DataTable from "../../shared/erp/components/DataTable";
import { money } from "../../shared/erp/formatters";

export default function PurchaseInvoiceLinesTable({
  basePath = "/admin/dashboard",
  lines = [],
}) {
  return (
    <DataTable
      rows={lines}
      empty="No invoice lines found."
      columns={[
        {
          key: "ingredient",
          header: "Ingredient",
          render: (line) => (
            <Link
              to={`${basePath}/inventory/ingredients?ingredient=${line.ingredient}`}
              className="font-semibold text-slate-950 hover:underline"
            >
              {line.ingredient_name}
            </Link>
          ),
        },
        {
          key: "quantity",
          header: "Quantity",
          className: "px-4 py-3 text-right",
          render: (line) =>
            `${Number(line.quantity || 0).toLocaleString()} ${line.ingredient_unit || ""}`,
        },
        {
          key: "unit_price",
          header: "Unit Price",
          className: "px-4 py-3 text-right",
          render: (line) => money(line.unit_price),
        },
        {
          key: "total",
          header: "Total",
          className: "px-4 py-3 text-right font-semibold text-slate-950",
          render: (line) => money(line.total_price),
        },
      ]}
    />
  );
}
