import SearchBox from "../../modules/shared/erp/components/SearchBox";
import { useTranslation } from "react-i18next";

export default function TableWorkspaceToolbar({
  search,
  onSearch,
  searchPlaceholder,
  filters,
  activeFilter,
  onFilter,
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--theme-border)] pb-3">
      <div
        className="hidden flex-wrap items-center gap-5 lg:flex"
        role="group"
        aria-label={t("table.status")}
      >
        {filters.map((filter) => {
          const active = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => onFilter(filter.key)}
              className={`inline-flex min-h-9 cursor-pointer items-center gap-2 border-b-2 py-2 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-input-focus)] ${
                active
                  ? "border-[var(--theme-text-primary)] font-medium theme-text-primary"
                  : "border-transparent theme-text-muted hover:text-[var(--theme-text-primary)]"
              }`}
              aria-pressed={active}
            >
              <span>{filter.label}</span>
              <span className="text-xs font-normal tabular-nums theme-text-muted">
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex w-full min-w-0 items-center gap-3 lg:w-auto">
        <select
          value={activeFilter}
          onChange={(event) => onFilter(event.target.value)}
          aria-label={t("table.status")}
          className="theme-select h-9 min-w-0 flex-1 px-2.5 text-[13px] lg:hidden"
        >
          {filters.map((filter) => (
            <option key={filter.key} value={filter.key}>
              {filter.label} ({filter.count})
            </option>
          ))}
        </select>
        <div className="min-w-0 flex-1 lg:w-60">
          <SearchBox
            value={search}
            onChange={onSearch}
            placeholder={searchPlaceholder}
          />
        </div>
      </div>
    </div>
  );
}
