import React from "react";
import { inputClass } from "../../shared/erp/constants";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import ContractorInvoiceTable from "../components/ContractorInvoiceTable";

export default function ContractorInvoices({
  invoices,
  filters,
  contractors,
  onFilters,
  onOpen,
  onPayment,
}) {
  return (
    <div className="space-y-4">
      <Toolbar>
        <SearchBox
          value={filters.search}
          onChange={(value) => onFilters({ ...filters, search: value })}
          placeholder="Search contractor invoices"
        />
        <select
          value={filters.status}
          onChange={(event) => onFilters({ ...filters, status: event.target.value })}
          className={inputClass}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
        </select>
        <select
          value={filters.contractor}
          onChange={(event) => onFilters({ ...filters, contractor: event.target.value })}
          className={inputClass}
        >
          <option value="">All Contractors</option>
          {contractors.map((contractor) => (
            <option key={contractor.value} value={contractor.value}>{contractor.label}</option>
          ))}
        </select>
      </Toolbar>
      <ContractorInvoiceTable invoices={invoices} onOpen={onOpen} onPayment={onPayment} />
    </div>
  );
}
