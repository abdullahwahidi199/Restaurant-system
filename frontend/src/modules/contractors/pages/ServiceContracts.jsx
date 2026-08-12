import React from "react";
import { Plus } from "lucide-react";
import DataTable from "../../shared/erp/components/DataTable";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import { inputClass } from "../../shared/erp/constants";
import { money } from "../../shared/erp/formatters";

export default function ServiceContracts({ contracts, filters, onFilters, onAdd }) {
  return (
    <div className="space-y-4">
      <Toolbar>
        <SearchBox value={filters.search} onChange={(value) => onFilters({ ...filters, search: value })} placeholder="Search contracts" />
        <select value={filters.status} onChange={(event) => onFilters({ ...filters, status: event.target.value })} className={inputClass}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
        <button type="button" onClick={onAdd} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          Contract
        </button>
      </Toolbar>
      <DataTable
        rows={contracts}
        empty="No service contracts found."
        columns={[
          { key: "title", header: "Title", render: (contract) => <span className="font-semibold text-slate-950">{contract.title}</span> },
          { key: "contractor", header: "Contractor", render: (contract) => contract.contractor_name },
          { key: "period", header: "Period", render: (contract) => `${contract.start_date} to ${contract.end_date || "Open"}` },
          { key: "value", header: "Value", className: "px-4 py-3 text-right font-semibold text-slate-950", render: (contract) => money(contract.contract_value) },
          { key: "invoiced", header: "Invoiced", className: "px-4 py-3 text-right", render: (contract) => money(contract.total_invoiced) },
          { key: "status", header: "Status", render: (contract) => <StatusBadge status={contract.status} /> },
        ]}
      />
    </div>
  );
}
