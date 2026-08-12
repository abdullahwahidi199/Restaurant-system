import React from "react";
import DataTable from "../../shared/erp/components/DataTable";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import { formatMethod, money } from "../../shared/erp/formatters";

export default function ContractorPayments({ payments, search, onSearch }) {
  return (
    <div className="space-y-4">
      <Toolbar>
        <SearchBox value={search} onChange={onSearch} placeholder="Search payments" />
      </Toolbar>
      <DataTable
        rows={payments}
        empty="No contractor payments found."
        columns={[
          { key: "date", header: "Date" },
          { key: "contractor", header: "Contractor", render: (payment) => payment.contractor_name },
          { key: "invoice", header: "Invoice", render: (payment) => payment.invoice_number || "-" },
          { key: "method", header: "Method", render: (payment) => formatMethod(payment.payment_method) },
          { key: "reference", header: "Reference", render: (payment) => payment.reference_number || "-" },
          { key: "amount", header: "Amount", className: "px-4 py-3 text-right font-semibold text-slate-950", render: (payment) => money(payment.amount) },
        ]}
      />
    </div>
  );
}
