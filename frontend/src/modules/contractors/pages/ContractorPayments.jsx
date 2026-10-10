import React from "react";
import DataTable from "../../shared/erp/components/DataTable";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import { formatMethod, money } from "../../shared/erp/formatters";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ContractorPayments({ payments, search, onSearch }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="space-y-4">
      <Toolbar>
        <SearchBox value={search} onChange={onSearch} placeholder={autoT("legacy.search_payments_3a82474c")} />
      </Toolbar>
      <DataTable
        rows={payments}
        empty={autoT("legacy.no_contractor_payments_found_dc952ab6")}
        columns={[
          { key: "date", header: "Date" },
          { key: "contractor", header: "Contractor", render: (payment) => payment.contractor_name },
          { key: "invoice", header: "Invoice", render: (payment) => payment.invoice_number || "-" },
          { key: "method", header: "Method", render: (payment) => formatMethod(payment.payment_method) },
          { key: "reference", header: "Reference", render: (payment) => payment.reference_number || "-" },
          { key: "amount", header: "Amount", className: "text-right font-semibold tabular-nums theme-text-primary", render: (payment) => money(payment.amount) },
        ]}
      />
    </div>
  );
}
