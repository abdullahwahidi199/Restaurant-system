import { useCallback, useContext, useEffect, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  PackageX,
  Plus,
  RefreshCw,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import TopConsumedChart from "./TopConsumedChart";
import IngredientList from "./IngredientList";
import LowStockItems from "./LowStockItems";
import StockMovementList from "./StockMovementList";
import CreateIngredientModal from "./CreateIngredient";
import StockTransferPanel from "./StockTransferPanel";
import InventorySearch from "./InventorySearch";
import { getInventorySummary } from "../../../api/inventoryApi";
import { AuthContext } from "../../../api/authforRBC";

const formatNumber = (value, options) => {
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat(undefined, options).format(number)
    : "—";
};

export default function InventoryDashboard() {
  const { t } = useTranslation();
  const { auth } = useContext(AuthContext);
  const [showCreate, setShowCreate] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isBranchAdmin = auth?.user?.role === "BranchAdmin";

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getInventorySummary();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load inventory summary", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const summary = stats ?? {};
  const highWaste = Array.isArray(summary.high_waste_ingredients)
    ? summary.high_waste_ingredients
    : [];
  const topConsumed = Array.isArray(summary.top_consumed_ingredients)
    ? summary.top_consumed_ingredients
    : [];

  return (
    <div className="min-w-0 space-y-4">
      <header className="theme-card flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-[1.5rem] font-bold leading-tight theme-text-primary">
            {t("inventory_manager.dashboard.title", {
              defaultValue: "Inventory",
            })}
          </h1>
          <p className="mt-1 text-xs theme-text-secondary">
            {t("inventory_manager.dashboard.subtitle", {
              defaultValue: "Stock overview and management",
            })}
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center xl:justify-end">
          <div className="min-w-0 sm:w-64 lg:w-72">
            <InventorySearch />
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="theme-btn theme-btn-primary inline-flex h-9 w-full shrink-0 items-center justify-center gap-2 px-3 sm:w-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("inventory_manager.ingredients.new_ingredient", {
              defaultValue: "New Ingredient",
            })}
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] px-4 py-3 text-sm text-[var(--theme-danger-hover)]"
        >
          <span>
            {t("inventory_manager.dashboard.summary_error", {
              defaultValue: "Inventory summary could not be loaded.",
            })}
          </span>
          <button
            type="button"
            onClick={loadSummary}
            className="theme-btn theme-btn-outline gap-1.5 px-3"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t("inventory_manager.common.retry", { defaultValue: "Retry" })}
          </button>
        </div>
      )}

      {loading && !stats ? (
        <div
          role="status"
          className="theme-card p-5 text-sm theme-text-secondary"
        >
          {t("inventory_manager.dashboard.loading", {
            defaultValue: "Loading inventory dashboard...",
          })}
        </div>
      ) : !stats ? null : (
        <>
          <section
            aria-label={t("inventory_manager.dashboard.stock_summary", {
              defaultValue: "Stock summary",
            })}
            className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            <InventoryMetric
              label={t("inventory_manager.dashboard.total_ingredients", {
                defaultValue: "Total Ingredients",
              })}
              value={formatNumber(summary.total_ingredients ?? 0)}
              icon={Boxes}
              tone="neutral"
            />
            <InventoryMetric
              label={t("inventory_manager.common.low_stock", {
                defaultValue: "Low Stock",
              })}
              value={formatNumber(summary.low_stock ?? 0)}
              icon={AlertTriangle}
              tone="warning"
            />
            <InventoryMetric
              label={t("inventory_manager.common.out_of_stock", {
                defaultValue: "Out of Stock",
              })}
              value={formatNumber(summary.out_of_stock ?? 0)}
              icon={PackageX}
              tone="danger"
            />
            <InventoryMetric
              label={t("inventory_manager.dashboard.inventory_value", {
                defaultValue: "Inventory Value",
              })}
              value={`AFN ${formatNumber(summary.inventory_value ?? 0, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              icon={TrendingUp}
              tone="primary"
            />
          </section>

          <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="min-w-0">
              <TopConsumedChart items={topConsumed} />
            </div>
            <SummaryList
              title={t("inventory_manager.dashboard.high_waste", {
                defaultValue: "High Waste Ingredients (30 days)",
              })}
              items={highWaste}
              valueKey="wasted"
            />
          </section>

          <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(250px,0.7fr)]">
            <div className="min-w-0 space-y-4">
              <IngredientList />
              <StockMovementList />
            </div>
            <aside className="min-w-0 space-y-4">
              {!isBranchAdmin && <StockTransferPanel />}
              <LowStockItems />
            </aside>
          </div>
        </>
      )}

      {showCreate && (
        <CreateIngredientModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            loadSummary();
          }}
        />
      )}
    </div>
  );
}

const metricTones = {
  neutral: "theme-muted",
  warning: "theme-badge-warning",
  danger: "theme-badge-danger",
  primary: "bg-[var(--theme-primary-soft)] text-[var(--theme-primary-hover)]",
};

function InventoryMetric({ label, value, icon: Icon, tone }) {
  return (
    <div
      className="theme-kpi-card flex min-w-0 items-start justify-between gap-3 p-4"
      style={{ borderTopWidth: 1, borderTopColor: "var(--theme-border)" }}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-snug theme-text-secondary">
          {label}
        </p>
        <p className="mt-2 break-words text-2xl font-bold leading-none tracking-tight theme-text-primary">
          {value}
        </p>
      </div>
      <span
        className={`erp-kpi-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${metricTones[tone] ?? metricTones.neutral}`}
        aria-hidden="true"
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
    </div>
  );
}

function SummaryList({ title, items, valueKey }) {
  const { t } = useTranslation();

  return (
    <section className="theme-card min-w-0 p-4">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--theme-border)] pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="theme-badge-danger flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            aria-hidden="true"
          >
            <Trash2 className="h-4 w-4" />
          </span>
          <h2 className="min-w-0 text-sm font-semibold theme-text-primary">
            {title}
          </h2>
        </div>
        <span className="theme-text-muted text-xs tabular-nums">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm theme-text-muted">
          {t("inventory_manager.common.no_data_available", {
            defaultValue: "No data available",
          })}
        </p>
      ) : (
        <ul className="divide-y divide-[var(--theme-border)]">
          {items.map((item, index) => (
            <li
              key={`${item.ingredient__name ?? "ingredient"}-${index}`}
              className="flex min-w-0 items-center justify-between gap-3 py-2.5 text-sm"
            >
              <span
                className="min-w-0 truncate theme-text-primary"
                title={item.ingredient__name}
              >
                {item.ingredient__name}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-[var(--theme-danger-hover)]">
                {formatNumber(Math.abs(Number(item[valueKey] ?? 0)), {
                  maximumFractionDigits: 2,
                })}
                {item.ingredient__unit && (
                  <span className="ml-1 font-normal theme-text-muted">
                    {item.ingredient__unit}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
