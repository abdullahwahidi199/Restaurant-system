import React from "react";
import { Plus } from "lucide-react";
import DataTable from "../../shared/erp/components/DataTable";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import { inputClass } from "../../shared/erp/constants";
import { money } from "../../shared/erp/formatters";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ServiceContracts({ contracts, filters, onFilters, onAdd }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="space-y-4">
      <Toolbar>
        <SearchBox value={filters.search} onChange={(value) => onFilters({ ...filters, search: value })} placeholder={autoT("legacy.search_contracts_b5b66d1a")} />
        <select value={filters.status} onChange={(event) => onFilters({ ...filters, status: event.target.value })} className={inputClass}>
          <option value="">{autoT("filters.all_statuses")}</option>
          <option value="active">{autoT("staff.status.active")}</option>
          <option value="draft">{autoT("landing.mockups.inventory.values.purchase")}</option>
          <option value="completed">{autoT("stats.completed")}</option>
          <option value="cancelled">{autoT("status.cancelled")}</option>
          <option value="expired">{autoT("legacy.expired_a689a999")}</option>
        </select>
        <button type="button" onClick={onAdd} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          {autoT("legacy.contract_5a0ba3bb")}
        </button>
      </Toolbar>
      <DataTable
        rows={contracts}
        empty={autoT("legacy.no_service_contracts_found_0c2050a3")}
        columns={[
          { key: "title", header: "Title", render: (contract) => <span className="font-semibold theme-text-primary">{contract.title}</span> },
          { key: "contractor", header: "Contractor", render: (contract) => contract.contractor_name },
          { key: "period", header: "Period", render: (contract) => `${contract.start_date} to ${contract.end_date || "Open"}` },
          { key: "value", header: "Value", className: "text-right font-semibold tabular-nums theme-text-primary", render: (contract) => money(contract.contract_value) },
          { key: "invoiced", header: "Invoiced", className: "text-right tabular-nums", render: (contract) => money(contract.total_invoiced) },
          { key: "status", header: "Status", render: (contract) => <StatusBadge status={contract.status} /> },
        ]}
      />
    </div>
  );
}
