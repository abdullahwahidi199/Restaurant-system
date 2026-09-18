import React from "react";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import { inputClass } from "../../shared/erp/constants";
import PayrollTable from "../components/PayrollTable";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function PayrollRecords({
  payrolls,
  filters,
  onFilters,
  onApprove,
  onPayment,
  basePath = "/admin/dashboard",
}) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="space-y-4">
      <Toolbar>
        <SearchBox value={filters.search} onChange={(value) => onFilters({ ...filters, search: value })} placeholder={autoT("legacy.search_employee_role_or_notes_fe2031c8")} />
        <select value={filters.status} onChange={(event) => onFilters({ ...filters, status: event.target.value })} className={inputClass}>
          <option value="">{autoT("filters.all_statuses")}</option>
          <option value="draft">{autoT("landing.mockups.inventory.values.purchase")}</option>
          <option value="approved">{autoT("inventory_manager.statuses.approved")}</option>
          <option value="paid">{autoT("legacy.paid_dc9d4584")}</option>
        </select>
        <select value={filters.period_type} onChange={(event) => onFilters({ ...filters, period_type: event.target.value })} className={inputClass}>
          <option value="">{autoT("legacy.all_periods_e4e33dee")}</option>
          <option value="monthly">{autoT("legacy.monthly_d31edb7b")}</option>
          <option value="weekly">{autoT("legacy.weekly_158f3da5")}</option>
        </select>
      </Toolbar>
      <PayrollTable payrolls={payrolls} onApprove={onApprove} onPayment={onPayment} basePath={basePath} />
    </div>
  );
}
