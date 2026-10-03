import { useCallback, useEffect, useRef, useState } from "react";
import {
  Boxes,
  ChefHat,
  CheckCircle2,
  FileDown,
  Package,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import instance from "../../../api/axiosInstance";
import ProductionCard from "./ProductionCard";
import { useTranslation as useAutoTranslation } from "react-i18next";

const number = (value) => {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
};

const itemName = (item) =>
  item.name ?? item.item_name ?? item.menu_item?.name ?? item.title ?? "";

export default function DailyProduction() {
  const { t: autoT } = useAutoTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyItems, setBusyItems] = useState(new Set());
  const [pendingClear, setPendingClear] = useState(null);
  const inFlight = useRef(new Set());
  const latestFetch = useRef(0);
  const dialogRef = useRef(null);

  const fetchItems = useCallback(
    async ({ initial = false } = {}) => {
      const requestId = ++latestFetch.current;
      if (initial) setLoading(true);
      try {
        const res = await instance.get("/menu/production/");
        if (requestId === latestFetch.current) {
          setItems(Array.isArray(res.data) ? res.data : []);
          setHasLoaded(true);
          setError("");
        }
        return true;
      } catch (err) {
        if (requestId === latestFetch.current) {
          setError(
            err.response?.data?.error ||
              autoT("production.load_error", {
                defaultValue: "Could not load production. Please try again.",
              }),
          );
        }
        return false;
      } finally {
        if (initial && requestId === latestFetch.current) setLoading(false);
      }
    },
    [autoT],
  );

  useEffect(() => {
    fetchItems({ initial: true });
    return () => {
      latestFetch.current += 1;
    };
  }, [fetchItems]);

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await fetchItems({ initial: !hasLoaded });
    } finally {
      setRefreshing(false);
    }
  };

  const downloadPdf = async () => {
    if (downloadingPdf) return;
    setDownloadingPdf(true);
    setError("");
    try {
      const response = await instance.get("/menu/production/pdf/", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `daily_production_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          autoT("production.pdf_error", {
            defaultValue: "The daily production PDF could not be downloaded.",
          }),
      );
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (pendingClear && !dialog.open) dialog.showModal();
    if (!pendingClear && dialog.open) dialog.close();
  }, [pendingClear]);

  const markBusy = (id, busy) => {
    setBusyItems((current) => {
      const next = new Set(current);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const adjust = async (item, action, quantity) => {
    if (inFlight.current.has(item.id)) return;
    inFlight.current.add(item.id);
    markBusy(item.id, true);
    setError("");
    try {
      await instance.post("/menu/production/", {
        menu_item: item.id,
        action,
        quantity,
      });
      await fetchItems();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          autoT("production.adjust_error", {
            defaultValue: "Production could not be updated. Please try again.",
          }),
      );
    } finally {
      inFlight.current.delete(item.id);
      markBusy(item.id, false);
    }
  };

  const clearProduction = async () => {
    if (!pendingClear) return;
    const { item, refund } = pendingClear;
    if (!item.production || inFlight.current.has(item.id)) return;
    inFlight.current.add(item.id);
    markBusy(item.id, true);
    setError("");
    try {
      await instance.delete(
        `/menu/production/${item.production.id}/?refund=${refund}`,
      );
      setPendingClear(null);
      await fetchItems();
    } catch (err) {
      setPendingClear(null);
      setError(
        err.response?.data?.error ||
          autoT("production.clear_error", {
            defaultValue: "Production could not be cleared. Please try again.",
          }),
      );
    } finally {
      inFlight.current.delete(item.id);
      markBusy(item.id, false);
    }
  };

  const activeCount = items.filter(
    (item) => number(item.production?.quantity_remaining) > 0,
  ).length;
  const totalRemaining = items.reduce(
    (sum, item) => sum + number(item.production?.quantity_remaining),
    0,
  );
  const totalProduced = items.reduce(
    (sum, item) => sum + number(item.production?.quantity_produced),
    0,
  );
  const search = query.trim().toLocaleLowerCase();
  const visibleItems = items.filter((item) => {
    const available = number(item.production?.quantity_remaining) > 0;
    if (filter === "available" && !available) return false;
    if (filter === "empty" && available) return false;
    return (
      !search || String(itemName(item)).toLocaleLowerCase().includes(search)
    );
  });

  const filters = [
    {
      id: "all",
      label: autoT("production.filter_all", { defaultValue: "All items" }),
      count: items.length,
    },
    {
      id: "available",
      label: autoT("production.filter_available", { defaultValue: "In stock" }),
      count: activeCount,
    },
    {
      id: "empty",
      label: autoT("production.filter_empty", {
        defaultValue: "Needs production",
      }),
      count: items.length - activeCount,
    },
  ];
  const clearItemLabel = pendingClear
    ? itemName(pendingClear.item) ||
      autoT("production.this_item", { defaultValue: "this item" })
    : "";

  return (
    <div className="min-w-0 space-y-4">
      <header className="theme-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary-hover)]"
            aria-hidden="true"
          >
            <ChefHat className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight theme-text-primary">
              {autoT("legacy.daily_production_64c16322")}
            </h1>
            <p className="mt-0.5 text-xs theme-text-secondary">
              {autoT("production.subtitle", {
                defaultValue:
                  "Track prepared quantities and what is still available.",
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={downloadPdf}
            disabled={loading || !hasLoaded || downloadingPdf}
            className="theme-btn theme-btn-primary inline-flex h-9 items-center gap-2 px-3"
          >
            <FileDown className="h-4 w-4" aria-hidden="true" />
            {downloadingPdf
              ? autoT("production.downloading_pdf", {
                  defaultValue: "Downloading PDF...",
                })
              : autoT("legacy.download_pdf_98e5ef06")}
          </button>
          <button
            type="button"
            onClick={refresh}
            disabled={loading || refreshing}
            className="theme-btn theme-btn-outline inline-flex h-9 items-center gap-2 px-3"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            {autoT("production.refresh", { defaultValue: "Refresh" })}
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] px-4 py-3 text-sm text-[var(--theme-danger-hover)]"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="theme-btn theme-btn-ghost h-8 px-2"
            aria-label={autoT("production.dismiss_error", {
              defaultValue: "Dismiss error",
            })}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {hasLoaded && (
        <section
          aria-label={autoT("production.summary", {
            defaultValue: "Production summary",
          })}
          className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4"
        >
          <Metric
            label={autoT("legacy.tracked_items_11d7c935")}
            value={items.length}
            icon={Package}
          />
          <Metric
            label={autoT("legacy.active_in_stock_fa671872")}
            value={activeCount}
            icon={CheckCircle2}
            tone="success"
          />
          <Metric
            label={autoT("production.remaining", { defaultValue: "Remaining" })}
            value={totalRemaining}
            icon={Boxes}
          />
          <Metric
            label={autoT("production.produced", { defaultValue: "Produced" })}
            value={totalProduced}
            icon={ChefHat}
          />
        </section>
      )}

      <section className="theme-card min-w-0">
        {hasLoaded && (
          <div className="flex flex-col gap-3 border-b border-[var(--theme-border)] p-3 sm:p-4 lg:flex-row lg:items-end lg:justify-between">
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label={autoT("production.stock_filter", {
                defaultValue: "Filter by stock",
              })}
            >
              {filters.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={filter === option.id}
                  onClick={() => setFilter(option.id)}
                  className={`theme-btn h-8 gap-1.5 px-2.5 text-xs ${filter === option.id ? "theme-btn-primary" : "theme-btn-outline"}`}
                >
                  {option.label}
                  <span className="tabular-nums opacity-80">
                    {option.count}
                  </span>
                </button>
              ))}
            </div>
            <label className="relative block w-full min-w-0 lg:w-64">
              <Search
                className="pointer-events-none absolute start-3 top-2.5 h-4 w-4 theme-text-muted"
                aria-hidden="true"
              />
              <span className="sr-only">
                {autoT("production.search", {
                  defaultValue: "Search menu items",
                })}
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={autoT("production.search", {
                  defaultValue: "Search menu items",
                })}
                className="theme-input h-9 w-full ps-9 pe-3"
              />
            </label>
          </div>
        )}

        {loading ? (
          <div
            role="status"
            className="px-4 py-10 text-center text-sm theme-text-secondary"
          >
            {autoT("dashboard.loading")}
          </div>
        ) : !hasLoaded ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold theme-text-primary">
              {autoT("production.unavailable", {
                defaultValue: "Production data is unavailable",
              })}
            </p>
            <button
              type="button"
              onClick={() => fetchItems({ initial: true })}
              className="theme-btn theme-btn-outline mt-3 h-9 gap-2 px-3"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {autoT("production.try_again", { defaultValue: "Try again" })}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Package
              className="mx-auto h-8 w-8 theme-text-muted"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-semibold theme-text-primary">
              {autoT("production.no_items", {
                defaultValue: "No items use daily production yet",
              })}
            </p>
            <p className="mx-auto mt-1 max-w-md text-xs theme-text-secondary">
              {autoT(
                "legacy.no_menu_items_use_daily_production_enable_uses_daily_p_3ce95f6c",
              )}
            </p>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Search
              className="mx-auto h-8 w-8 theme-text-muted"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-semibold theme-text-primary">
              {autoT("production.no_matches", {
                defaultValue: "No matching items",
              })}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
              className="theme-btn theme-btn-outline mt-3 h-8 px-3"
            >
              {autoT("production.clear_filters", {
                defaultValue: "Clear filters",
              })}
            </button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[var(--theme-border)]">
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className={`relative min-w-0 ${busyItems.has(item.id) ? "pointer-events-none opacity-60" : ""}`}
                  aria-busy={busyItems.has(item.id)}
                >
                  <ProductionCard
                    item={item}
                    onIncrement={(qty) => adjust(item, "increment", qty)}
                    onDecrement={(qty) => adjust(item, "decrement", qty)}
                    onClear={(refund) =>
                      item.production &&
                      setPendingClear({ item, refund: Boolean(refund) })
                    }
                  />
                  {busyItems.has(item.id) && (
                    <span className="absolute end-3 top-3 rounded-md bg-[var(--theme-surface)] px-2 py-1 text-xs font-semibold theme-text-secondary">
                      {autoT("production.saving", {
                        defaultValue: "Updating…",
                      })}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="border-t border-[var(--theme-border)] px-4 py-2 text-xs theme-text-muted">
              {autoT("production.showing_count", {
                defaultValue: "Showing {{shown}} of {{total}} items",
                shown: visibleItems.length,
                total: items.length,
              })}
            </p>
          </>
        )}
      </section>

      <dialog
        ref={dialogRef}
        onClose={() => setPendingClear(null)}
        onCancel={(event) => {
          if (pendingClear && busyItems.has(pendingClear.item.id))
            event.preventDefault();
        }}
        className="theme-modal-surface w-[min(92vw,28rem)] max-w-none p-5 text-[var(--theme-text-primary)] backdrop:bg-slate-950/70"
        aria-labelledby="production-clear-title"
        aria-describedby="production-clear-description"
      >
        <h2
          id="production-clear-title"
          className="text-lg font-semibold theme-text-primary"
        >
          {pendingClear?.refund
            ? autoT("production.clear_refund_title", {
                defaultValue: "Clear and refund ingredients?",
              })
            : autoT("production.clear_title", {
                defaultValue: "Clear production?",
              })}
        </h2>
        <p
          id="production-clear-description"
          className="mt-2 text-sm leading-relaxed theme-text-secondary"
        >
          {pendingClear?.refund
            ? autoT("production.clear_refund_description", {
                defaultValue:
                  "This clears production for {{name}} and returns unused ingredients to stock.",
                name: clearItemLabel,
              })
            : autoT("production.clear_description", {
                defaultValue:
                  "This clears the current production for {{name}} without refunding ingredients.",
                name: clearItemLabel,
              })}
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setPendingClear(null)}
            disabled={
              pendingClear ? busyItems.has(pendingClear.item.id) : false
            }
            className="theme-btn theme-btn-outline h-9 px-4"
          >
            {autoT("production.cancel", { defaultValue: "Cancel" })}
          </button>
          <button
            type="button"
            onClick={clearProduction}
            disabled={!pendingClear || busyItems.has(pendingClear.item.id)}
            className="theme-btn theme-btn-danger h-9 px-4"
          >
            {autoT("production.confirm_clear", {
              defaultValue: "Clear production",
            })}
          </button>
        </div>
      </dialog>
    </div>
  );
}

function Metric({ label, value, icon: iconComponent, tone = "neutral" }) {
  const Icon = iconComponent;
  const color = tone === "success" ? "theme-badge-success" : "theme-muted";
  return (
    <div
      className="theme-kpi-card flex min-w-0 items-start justify-between gap-2 p-3.5"
      style={{ borderTopWidth: 1, borderTopColor: "var(--theme-border)" }}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-snug theme-text-secondary">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold leading-none tabular-nums theme-text-primary">
          {new Intl.NumberFormat().format(value)}
        </p>
      </div>
      <span
        className={`erp-kpi-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>
    </div>
  );
}
