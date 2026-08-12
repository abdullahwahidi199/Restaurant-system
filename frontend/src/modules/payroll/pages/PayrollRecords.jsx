import React from "react";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import { inputClass } from "../../shared/erp/constants";
import PayrollTable from "../components/PayrollTable";

export default function PayrollRecords({
  payrolls,
  filters,
  onFilters,
  onApprove,
  onPayment,
  basePath = "/admin/dashboard",
}) {
  return (
    <div className="space-y-4">
      <Toolbar>
        <SearchBox value={filters.search} onChange={(value) => onFilters({ ...filters, search: value })} placeholder="Search employee, role, or notes" />
        <select value={filters.status} onChange={(event) => onFilters({ ...filters, status: event.target.value })} className={inputClass}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
        </select>
        <select value={filters.period_type} onChange={(event) => onFilters({ ...filters, period_type: event.target.value })} className={inputClass}>
          <option value="">All Periods</option>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
        </select>
      </Toolbar>
      <PayrollTable payrolls={payrolls} onApprove={onApprove} onPayment={onPayment} basePath={basePath} />
    </div>
  );
}
