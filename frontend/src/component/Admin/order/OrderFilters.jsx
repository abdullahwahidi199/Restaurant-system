import { Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";
import Toolbar from "../../../modules/shared/erp/components/Toolbar";
import Field from "../../../modules/shared/erp/components/Field";
import SearchBox from "../../../modules/shared/erp/components/SearchBox";
import ActionButton from "../../../modules/shared/erp/components/ActionButton";

export default function OrderFilters({ filters, setFilters, onSearch }) {
  const { t } = useTranslation();
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const isRTL = i18n.language === "fa" || i18n.language === "ps";
  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <Toolbar title={t("filterss")} compactMobile>
        <Field label={t("filters.search_placeholder")}>
          <SearchBox
            value={filters.search}
            onChange={(value) => setFilters({ ...filters, search: value })}
            placeholder={t("filters.search_placeholder")}
          />
        </Field>

        <Field label={t("table.status")}>
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="theme-select w-full cursor-pointer px-3"
        >
          <option value="">{t("filters.all_statuses")}</option>
          <option value="pending">{t("status.pending")}</option>
          <option value="in_progress">{t("status.in_progress")}</option>
          <option value="ready">{t("status.ready")}</option>
          <option value="completed">{t("status.completed")}</option>
          <option value="cancelled">{t("status.cancelled")}</option>
        </select>
        </Field>

        <ActionButton
          onClick={() => onSearch(1)}
          icon={Filter}
          variant="primary"
          className="self-end"
        >
        {t("filters.apply")}
        </ActionButton>
      </Toolbar>
    </div>
  );
}
