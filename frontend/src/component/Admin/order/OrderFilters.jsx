import { Search, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";

export default function OrderFilters({ filters, setFilters, onSearch }) {
  const { t } = useTranslation();
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const isRTL = i18n.language === "fa" || i18n.language === "ps";
  return (
    <div
      className="bg-white p-4 rounded-xl shadow flex flex-wrap items-center justify-between gap-3"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-2">
        <Search size={18} />
        <input
          type="text"
          name="search"
          placeholder={t("filters.search_placeholder")}
          value={filters.search}
          onChange={handleChange}
          className="border rounded-lg px-3 py-1 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter size={18} />
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="border cursor-pointer rounded-lg px-2 py-1"
        >
          <option value="">{t("filters.all_statuses")}</option>
          <option value="pending">{t("status.pending")}</option>
          <option value="in_progress">{t("status.in_progress")}</option>
          <option value="ready">{t("status.ready")}</option>
          <option value="completed">{t("status.completed")}</option>
          <option value="cancelled">{t("status.cancelled")}</option>
        </select>
      </div>

      <div className="flex gap-2">
        <label>{t("filters.from")}:</label>
        <input
          type="date"
          name="start_date"
          value={filters.start_date}
          onChange={handleChange}
          className="border cursor-pointer rounded-lg px-2 py-1"
        />
        <label>{t("filters.to")}:</label>
        <input
          type="date"
          name="end_date"
          value={filters.end_date}
          onChange={handleChange}
          className="border cursor-pointer rounded-lg px-2 py-1"
        />
      </div>

      <button
        onClick={onSearch}
        className="bg-blue-600 cursor-pointer text-white px-4 py-1.5 rounded-lg hover:bg-blue-700"
      >
        {t("filters.apply")}
      </button>
    </div>
  );
}
