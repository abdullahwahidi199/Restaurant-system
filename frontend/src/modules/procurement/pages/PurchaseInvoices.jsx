import React from "react";
import { inputClass } from "../../shared/erp/constants";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import PurchaseInvoiceTable from "../components/PurchaseInvoiceTable";

export default function PurchaseInvoices({ invoices, filters, onFilters, onOpen, onPayment }) {
  return (
    <div className="space-y-4">
      <Toolbar>
        <SearchBox
          value={filters.search}
          onChange={(value) => onFilters({ ...filters, search: value })}
          placeholder="Search invoices or suppliers"
        />
        <select
          value={filters.status}
          onChange={(event) => onFilters({ ...filters, status: event.target.value })}
          className={inputClass}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="unpaid">Unpaid</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
        </select>
      </Toolbar>
      <PurchaseInvoiceTable invoices={invoices} onOpen={onOpen} onPayment={onPayment} />
    </div>
  );
}
