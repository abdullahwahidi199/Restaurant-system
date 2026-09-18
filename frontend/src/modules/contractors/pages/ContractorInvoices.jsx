import React from "react";
import { inputClass } from "../../shared/erp/constants";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import ContractorInvoiceTable from "../components/ContractorInvoiceTable";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ContractorInvoices({
  invoices,
  filters,
  contractors,
  onFilters,
  onOpen,
  onPayment,
}) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="space-y-4">
      <Toolbar>
        <SearchBox
          value={filters.search}
          onChange={(value) => onFilters({ ...filters, search: value })}
          placeholder={autoT("legacy.search_contractor_invoices_6bc23b49")}
        />
        <select
          value={filters.status}
          onChange={(event) => onFilters({ ...filters, status: event.target.value })}
          className={inputClass}
        >
          <option value="">{autoT("filters.all_statuses")}</option>
          <option value="draft">{autoT("landing.mockups.inventory.values.purchase")}</option>
          <option value="approved">{autoT("inventory_manager.statuses.approved")}</option>
          <option value="partially_paid">{autoT("legacy.partially_paid_0d4ed2e9")}</option>
          <option value="paid">{autoT("legacy.paid_dc9d4584")}</option>
        </select>
        <select
          value={filters.contractor}
          onChange={(event) => onFilters({ ...filters, contractor: event.target.value })}
          className={inputClass}
        >
          <option value="">{autoT("legacy.all_contractors_ee651240")}</option>
          {contractors.map((contractor) => (
            <option key={contractor.value} value={contractor.value}>{contractor.label}</option>
          ))}
        </select>
      </Toolbar>
      <ContractorInvoiceTable invoices={invoices} onOpen={onOpen} onPayment={onPayment} />
    </div>
  );
}
