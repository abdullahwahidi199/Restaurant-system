import React from "react";
import { inputClass } from "../../shared/erp/constants";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import PurchaseInvoiceTable from "../components/PurchaseInvoiceTable";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function PurchaseInvoices({ invoices, filters, onFilters, onOpen, onPayment }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="space-y-4">
      <Toolbar>
        <SearchBox
          value={filters.search}
          onChange={(value) => onFilters({ ...filters, search: value })}
          placeholder={autoT("legacy.search_invoices_or_suppliers_da895671")}
        />
        <select
          value={filters.status}
          onChange={(event) => onFilters({ ...filters, status: event.target.value })}
          className={inputClass}
        >
          <option value="">{autoT("filters.all_statuses")}</option>
          <option value="draft">{autoT("landing.mockups.inventory.values.purchase")}</option>
          <option value="unpaid">{autoT("legacy.unpaid_50cc12f6")}</option>
          <option value="partially_paid">{autoT("legacy.partially_paid_0d4ed2e9")}</option>
          <option value="paid">{autoT("legacy.paid_dc9d4584")}</option>
        </select>
      </Toolbar>
      <PurchaseInvoiceTable invoices={invoices} onOpen={onOpen} onPayment={onPayment} />
    </div>
  );
}
