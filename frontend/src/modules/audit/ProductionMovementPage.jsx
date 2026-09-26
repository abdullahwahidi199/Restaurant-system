import { useCallback, useEffect, useState } from "react";
import { History, RefreshCw, Search } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";
import { getProductionMovements } from "../../api/auditApi";
import PageHeader from "../shared/erp/components/PageHeader";

const movementLabels = {
  create: "Created",
  replace: "Replaced",
  increment: "Added",
  decrement: "Reduced",
  adjust: "Adjusted",
  consume: "Standalone order",
  restore: "Restored",
  clear: "Cleared",
};

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "-";

export default function ProductionMovementPage() {
  const { t } = useAutoTranslation();
  const [filters, setFilters] = useState({ ordering: "newest", page: 1 });
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError("");
    getProductionMovements(filters)
      .then((response) => {
        if (!active) return;
        setRows(response.data?.results || []);
        setCount(response.data?.count || 0);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError.response?.data?.detail ||
            t("production.movements_load_error", {
              defaultValue: "Could not load production movements.",
            }),
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters, t]);

  useEffect(() => load(), [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((current) => ({
        ...current,
        search: search.trim() || undefined,
        page: 1,
      }));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const updateFilter = (key, value) =>
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
      page: 1,
    }));

  return (
    <section className="space-y-4 px-4 pb-6 lg:px-5">
      <PageHeader
        eyebrow={t("production.audit", { defaultValue: "Production audit" })}
        breadcrumb={t("production.movements", {
          defaultValue: "Daily production movements",
        })}
        icon={History}
        title={t("production.movements", {
          defaultValue: "Daily production movements",
        })}
        description={t("production.movements_description", {
          defaultValue:
            "Trace every production change, including who made it, when it happened, and the resulting balance.",
        })}
        quickStats={[
          {
            label: t("production.total_movements", {
              defaultValue: "Total movements",
            }),
            value: count,
          },
        ]}
      />

      <div className="theme-card grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="relative md:col-span-2">
          <span className="sr-only">
            {t("production.search_movements", {
              defaultValue: "Search movements",
            })}
          </span>
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 theme-text-secondary" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("production.search_item_or_user", {
              defaultValue: "Search item, user, or order...",
            })}
            className="theme-input h-9 w-full pl-9"
          />
        </label>
        <select
          value={filters.movement_type || ""}
          onChange={(event) => updateFilter("movement_type", event.target.value)}
          className="theme-input h-9"
          aria-label={t("production.movement_type", {
            defaultValue: "Movement type",
          })}
        >
          <option value="">
            {t("production.all_movement_types", {
              defaultValue: "All movement types",
            })}
          </option>
          {Object.entries(movementLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.start_date || ""}
          onChange={(event) => updateFilter("start_date", event.target.value)}
          className="theme-input h-9"
          aria-label={t("production.start_date", { defaultValue: "Start date" })}
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.end_date || ""}
            onChange={(event) => updateFilter("end_date", event.target.value)}
            className="theme-input h-9 min-w-0 flex-1"
            aria-label={t("production.end_date", { defaultValue: "End date" })}
          />
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="theme-btn theme-btn-outline h-9 w-9 p-0"
            title={t("production.refresh", { defaultValue: "Refresh" })}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="theme-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b theme-border theme-surface-muted">
              <tr>
                {["When", "Item", "Movement", "Change", "Balance", "Done by", "Reference"].map(
                  (heading) => (
                    <th key={heading} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide theme-text-secondary">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y theme-divide">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center theme-text-secondary">
                    {t("production.loading_movements", {
                      defaultValue: "Loading production movements...",
                    })}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center theme-text-secondary">
                    {t("production.no_movements", {
                      defaultValue: "No production movements found.",
                    })}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const metadata = row.metadata || {};
                  const movement = metadata.movement_type || "adjust";
                  const change = number(metadata.quantity_change);
                  const before = number(row.old_values?.quantity_remaining);
                  const after = number(row.new_values?.quantity_remaining);
                  const orderReference = metadata.order_number || metadata.order_id;
                  return (
                    <tr key={row.id} className="theme-table-row align-top">
                      <td className="whitespace-nowrap px-4 py-3 theme-text-secondary">
                        {formatDateTime(row.created_at)}
                      </td>
                      <td className="px-4 py-3 font-semibold theme-text-primary">
                        {row.object_repr || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="theme-badge theme-badge-neutral whitespace-nowrap">
                          {movementLabels[movement] || movement}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-4 py-3 font-semibold tabular-nums ${change > 0 ? "text-emerald-600" : change < 0 ? "text-rose-600" : "theme-text-secondary"}`}>
                        {change > 0 ? "+" : ""}{change}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums theme-text-primary">
                        {before} → {after}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium theme-text-primary">{metadata.actor_name || row.user_name || "System"}</div>
                        <div className="text-xs theme-text-secondary">{metadata.actor_role || row.user_role || row.branch_name || "-"}</div>
                      </td>
                      <td className="px-4 py-3 theme-text-secondary">
                        {orderReference ? `Order #${orderReference}` : metadata.notes || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={(filters.page || 1) <= 1 || loading}
          onClick={() => setFilters((current) => ({ ...current, page: Math.max((current.page || 1) - 1, 1) }))}
          className="theme-btn theme-btn-outline h-9 px-3"
        >
          {t("menu_item_sales.previous", { defaultValue: "Previous" })}
        </button>
        <span className="text-sm theme-text-secondary">
          {t("legacy.page_fb06270f", { defaultValue: "Page" })} {filters.page || 1}
        </span>
        <button
          type="button"
          disabled={(filters.page || 1) * 20 >= count || loading}
          onClick={() => setFilters((current) => ({ ...current, page: (current.page || 1) + 1 }))}
          className="theme-btn theme-btn-outline h-9 px-3"
        >
          {t("inventory_manager.common.next", { defaultValue: "Next" })}
        </button>
      </div>
    </section>
  );
}
