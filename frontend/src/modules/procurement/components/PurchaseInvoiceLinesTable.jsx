import React from "react";
import { Link } from "react-router-dom";
import DataTable from "../../shared/erp/components/DataTable";
import { money } from "../../shared/erp/formatters";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function PurchaseInvoiceLinesTable({
  basePath = "/admin/dashboard",
  lines = [],
}) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <DataTable
      rows={lines}
      empty={autoT("legacy.no_invoice_lines_found_23a5e225")}
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
          className: "px-4 py-2.5 text-right tabular-nums",
          render: (line) =>
            `${Number(line.quantity || 0).toLocaleString()} ${line.ingredient_unit || ""}`,
        },
        {
          key: "unit_price",
          header: "Unit Price",
          className: "px-4 py-2.5 text-right tabular-nums",
          render: (line) => money(line.unit_price),
        },
        {
          key: "total",
          header: "Total",
          className: "px-4 py-2.5 text-right font-semibold tabular-nums theme-text-primary",
          render: (line) => money(line.total_price),
        },
      ]}
    />
  );
}
