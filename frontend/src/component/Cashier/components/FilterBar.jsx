// src/pages/cashier/components/FilterBar.jsx
import React from "react";
import { useTranslation as useAutoTranslation } from "react-i18next";
import i18n from "../../../i18n";

// Provide value options as backend keys
const ORDER_TYPES = [
  { value: "", label: i18n.t("inventory_manager.stock_movements.all_types") },
  { value: "dine-in", label: i18n.t("landing.features.groups.operations.items.dineIn") },
  { value: "takeaway", label: i18n.t("landing.features.groups.operations.items.takeaway") },
  { value: "delivery", label: i18n.t("settings_center.nav.delivery") },
];

const STATUS_OPTIONS = [
  { value: "", label: i18n.t("filters.all_statuses") },
  { value: "pending", label: i18n.t("stats.pending") },
  { value: "in_progress", label: i18n.t("status.in_progress") },
  { value: "ready", label: i18n.t("status.ready") },
  { value: "served", label: i18n.t("legacy.served_4de0b10a") },
  { value: "picked_up", label: i18n.t("legacy.picked_up_6b173470") },
  { value: "out_for_delivery", label: i18n.t("legacy.out_for_delivery_dd25c6ef") },
  { value: "delivered", label: i18n.t("legacy.delivered_eea956cd") },
  { value: "completed", label: i18n.t("stats.completed") },
];

const FilterBar = ({ filters, setFilters }) => {
                    const { t: autoT } = useAutoTranslation();
  const f = { search: "", type: "", status: "", date: "", ...filters };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 mb-6">
      <input
        type="text"
        name="search"
        value={f.search}
        onChange={handleChange}
        placeholder={autoT("legacy.search_by_order_id_customer_or_table_88f20d66")}
        className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={autoT("legacy.search_orders_7ab30154")}
      />

      <select
        name="type"
        value={f.type}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-1/5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={autoT("legacy.filter_by_type_e55aa1d9")}
      >
        {ORDER_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;
