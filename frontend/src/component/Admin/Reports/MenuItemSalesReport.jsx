import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  PackageOpen,
  Percent,
  ReceiptText,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  TrendingDown,
  TrendingUp,
  Utensils,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import instance from "../../../api/axiosInstance";
import Modal from "../../../modules/shared/erp/components/Modal";
import {
  buildMenuItemPdfParams,
  buildMenuItemReportParams,
  hasActiveMenuItemFilters,
  localizedValue,
  nextSort,
  parseRanking,
  RANKING_OPTIONS,
} from "./menuItemReportUtils";

const PAGE_SIZE = 25;
const CHART_COLORS = [
  "var(--theme-chart-1)",
  "var(--theme-chart-2)",
  "var(--theme-chart-3)",
  "var(--theme-chart-4)",
  "var(--theme-chart-5)",
  "var(--theme-success)",
  "var(--theme-warning)",
  "var(--theme-danger)",
];

const DEFAULT_FILTERS = {
  search: "",
  category: "all",
  ranking: "all",
  rankBy: "quantity",
  salesStatus: "all",
  includeZeroSales: false,
  sortBy: "quantity",
  sortOrder: "desc",
};

const PDF_SECTIONS = {
  summary: true,
  kpis: true,
  details: true,
  categories: true,
  charts: true,
  trend: true,
  insights: true,
};

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}

function localeFor(language) {
  if (language?.startsWith("fa")) return "fa-AF";
  if (language?.startsWith("ps")) return "ps-AF";
  return "en-US";
}

function ReportSkeleton({ label }) {
  return (
    <div className="space-y-5" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className="h-20 animate-pulse rounded-2xl bg-[var(--theme-muted)]" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl bg-[var(--theme-muted)]"
          />
        ))}
      </div>
      <div className="h-28 animate-pulse rounded-2xl bg-[var(--theme-muted)]" />
      <div className="h-80 animate-pulse rounded-2xl bg-[var(--theme-muted)]" />
    </div>
  );
}

function KpiCard({ icon, label, value, hint }) {
  return (
    <article className="theme-kpi-card min-w-0 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide theme-text-muted">
            {label}
          </p>
          <p className="mt-2 truncate text-xl font-extrabold theme-text-primary" title={String(value)}>
            {value}
          </p>
          {hint && <p className="mt-1 truncate text-xs theme-text-muted">{hint}</p>}
        </div>
        <span className="shrink-0 rounded-xl bg-[var(--theme-primary-soft)] p-2.5 text-[var(--theme-primary)]">
          {React.createElement(icon, { className: "h-5 w-5" })}
        </span>
      </div>
    </article>
  );
}

function EmptyReport({ filtered, onReset, t }) {
  return (
    <div className="theme-card border-dashed px-5 py-14 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--theme-muted)] theme-text-muted">
        <PackageOpen className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-lg font-bold theme-text-primary">
        {filtered
          ? t("menu_item_sales.no_filter_results", {
              defaultValue: "No menu items match your filters.",
            })
          : t("menu_item_sales.no_sales", {
              defaultValue: "No menu item sales found",
            })}
      </h3>
      <p className="mx-auto mt-2 max-w-lg text-sm theme-text-muted">
        {filtered
          ? t("menu_item_sales.no_filter_results_hint", {
              defaultValue: "Clear or change the filters to see more menu items.",
            })
          : t("menu_item_sales.no_sales_hint", {
              defaultValue:
                "There were no qualifying menu item sales during the selected period. Try changing the date range or filters.",
            })}
      </p>
      {filtered && (
        <button
          type="button"
          onClick={onReset}
          className="theme-btn theme-btn-outline mt-5 px-4 py-2"
        >
          <X className="h-4 w-4" />
          {t("menu_item_sales.clear_filters", { defaultValue: "Clear Filters" })}
        </button>
      )}
    </div>
  );
}

function SortHeader({ field, label, filters, onSort, align = "start" }) {
  const active = filters.sortBy === field;
  const Icon = active
    ? filters.sortOrder === "desc"
      ? ArrowDown
      : ArrowUp
    : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`inline-flex w-full items-center gap-1 whitespace-nowrap font-bold ${
        align === "end" ? "justify-end" : "justify-start"
      } ${active ? "text-[var(--theme-primary)]" : "theme-text-secondary"}`}
    >
      {label}
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function PdfConfigurator({
  categories,
  initialConfig,
  onClose,
  onGenerate,
  generating,
  language,
  t,
}) {
  const [config, setConfig] = useState(initialConfig);
  const update = (field, value) => setConfig((current) => ({ ...current, [field]: value }));
  const updateSection = (field, value) =>
    setConfig((current) => ({
      ...current,
      sections: { ...current.sections, [field]: value },
    }));

  const inputClass = "theme-input h-10 w-full px-3 text-sm";
  const selectClass = "theme-select h-10 w-full px-3 text-sm";
  const fieldLabel = "space-y-1 text-sm font-semibold theme-text-secondary";
  const sectionLabels = {
    summary: t("menu_item_sales.pdf_summary", { defaultValue: "Summary" }),
    kpis: t("menu_item_sales.pdf_kpis", { defaultValue: "KPI Statistics" }),
    details: t("menu_item_sales.pdf_details", { defaultValue: "Menu Item Details" }),
    categories: t("menu_item_sales.pdf_category_summary", {
      defaultValue: "Category Summary",
    }),
    charts: t("menu_item_sales.charts", { defaultValue: "Charts" }),
    trend: t("menu_item_sales.sales_trend", { defaultValue: "Sales Trend" }),
    insights: t("menu_item_sales.insights", { defaultValue: "Insights" }),
  };

  return (
    <Modal
      title={t("menu_item_sales.generate_pdf_title", {
        defaultValue: "Generate Menu Item Sales PDF",
      })}
      onClose={onClose}
      wide
    >
      <form
        className="space-y-6 p-4 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          onGenerate(config);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className={fieldLabel}>
            <span>{t("menu_item_sales.from", { defaultValue: "From" })}</span>
            <input
              type="date"
              value={config.startDate}
              max={config.endDate}
              onChange={(event) => update("startDate", event.target.value)}
              className={inputClass}
              required
            />
          </label>
          <label className={fieldLabel}>
            <span>{t("menu_item_sales.to", { defaultValue: "To" })}</span>
            <input
              type="date"
              value={config.endDate}
              min={config.startDate}
              onChange={(event) => update("endDate", event.target.value)}
              className={inputClass}
              required
            />
          </label>
          <label className={fieldLabel}>
            <span>{t("menu_item_sales.category", { defaultValue: "Category" })}</span>
            <select
              value={config.category}
              onChange={(event) => update("category", event.target.value)}
              className={selectClass}
            >
              <option value="all">
                {t("menu_item_sales.all_categories", { defaultValue: "All Categories" })}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {localizedValue(category, "name", language)}
                </option>
              ))}
            </select>
          </label>
          <label className={fieldLabel}>
            <span>{t("menu_item_sales.pdf_report_type", { defaultValue: "Report Type" })}</span>
            <select
              value={config.reportType}
              onChange={(event) => update("reportType", event.target.value)}
              className={selectClass}
            >
              <option value="complete">
                {t("menu_item_sales.pdf_complete", {
                  defaultValue: "Complete Menu Item Sales Report",
                })}
              </option>
              <option value="top">
                {t("menu_item_sales.pdf_top", { defaultValue: "Top Selling Items" })}
              </option>
              <option value="bottom">
                {t("menu_item_sales.pdf_bottom", { defaultValue: "Least Selling Items" })}
              </option>
              <option value="category">
                {t("menu_item_sales.pdf_category", { defaultValue: "Category Sales Report" })}
              </option>
              <option value="all_ranked">
                {t("menu_item_sales.pdf_all_ranked", {
                  defaultValue: "All Menu Items Ranked",
                })}
              </option>
            </select>
          </label>
          <label className={fieldLabel}>
            <span>{t("menu_item_sales.rank_by", { defaultValue: "Rank By" })}</span>
            <select
              value={config.rankBy}
              onChange={(event) => update("rankBy", event.target.value)}
              className={selectClass}
            >
              <option value="quantity">
                {t("menu_item_sales.quantity_sold", { defaultValue: "Quantity Sold" })}
              </option>
              <option value="revenue">
                {t("menu_item_sales.revenue", { defaultValue: "Revenue" })}
              </option>
            </select>
          </label>
          <label className={fieldLabel}>
            <span>{t("menu_item_sales.number_of_items", { defaultValue: "Number of Items" })}</span>
            <select
              value={config.limit}
              onChange={(event) => update("limit", event.target.value)}
              disabled={!['top', 'bottom'].includes(config.reportType)}
              className={selectClass}
            >
              {[5, 10, 20, 50].map((limit) => (
                <option key={limit} value={limit}>{limit}</option>
              ))}
            </select>
          </label>
          <label className={fieldLabel}>
            <span>{t("menu_item_sales.sort_by", { defaultValue: "Sort By" })}</span>
            <select
              value={config.sortBy}
              onChange={(event) => update("sortBy", event.target.value)}
              className={selectClass}
            >
              <option value="quantity">{t("menu_item_sales.quantity_sold", { defaultValue: "Quantity Sold" })}</option>
              <option value="revenue">{t("menu_item_sales.revenue", { defaultValue: "Revenue" })}</option>
              <option value="average_price">{t("menu_item_sales.average_price", { defaultValue: "Average Price" })}</option>
              <option value="orders">{t("menu_item_sales.number_of_orders", { defaultValue: "Number of Orders" })}</option>
            </select>
          </label>
          <label className={fieldLabel}>
            <span>{t("menu_item_sales.sort_order", { defaultValue: "Sort Order" })}</span>
            <select
              value={config.sortOrder}
              onChange={(event) => update("sortOrder", event.target.value)}
              className={selectClass}
            >
              <option value="desc">{t("menu_item_sales.high_to_low", { defaultValue: "High to Low" })}</option>
              <option value="asc">{t("menu_item_sales.low_to_high", { defaultValue: "Low to High" })}</option>
            </select>
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-[var(--theme-border)] p-3 text-sm font-semibold theme-text-secondary">
          <input
            type="checkbox"
            checked={config.includeZeroSales}
            onChange={(event) => update("includeZeroSales", event.target.checked)}
            className="h-4 w-4 accent-[var(--theme-primary)]"
          />
          {t("menu_item_sales.include_zero_sales", {
            defaultValue: "Include Zero-Sales Items",
          })}
        </label>

        <fieldset>
          <legend className="text-sm font-bold theme-text-primary">
            {t("menu_item_sales.include_sections", { defaultValue: "Include" })}
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(sectionLabels).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 rounded-xl border border-[var(--theme-border)] px-3 py-2.5 text-sm theme-text-secondary"
              >
                <input
                  type="checkbox"
                  checked={config.sections[key]}
                  onChange={(event) => updateSection(key, event.target.checked)}
                  className="h-4 w-4 accent-[var(--theme-primary)]"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--theme-border)] pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="theme-btn theme-btn-outline px-5 py-2.5"
          >
            {t("menu_item_sales.cancel", { defaultValue: "Cancel" })}
          </button>
          <button
            type="submit"
            disabled={generating || config.startDate > config.endDate}
            className="theme-btn theme-btn-danger px-5 py-2.5"
          >
            {generating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {generating
              ? t("menu_item_sales.generating_pdf", { defaultValue: "Generating PDF..." })
              : t("menu_item_sales.generate_pdf", { defaultValue: "Generate PDF" })}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function MenuItemSalesReport({ startDate, endDate, generationKey = 0 }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || "en";
  const locale = localeFor(language);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const debouncedSearch = useDebouncedValue(filters.search);

  const requestFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    filters.category,
    filters.ranking,
    filters.rankBy,
    filters.salesStatus,
    filters.includeZeroSales,
    filters.sortBy,
    filters.sortOrder,
    startDate,
    endDate,
    generationKey,
  ]);

  useEffect(() => {
    if (!startDate || !endDate) return undefined;
    const controller = new AbortController();
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await instance.get("/reports/generate_report/", {
          params: buildMenuItemReportParams({
            startDate,
            endDate,
            filters: requestFilters,
            page,
            pageSize: PAGE_SIZE,
          }),
          signal: controller.signal,
        });
        setData({ ...response.data.data, branch: response.data.branch });
      } catch (requestError) {
        if (requestError.code === "ERR_CANCELED") return;
        setError(
          requestError.response?.data?.error ||
            t("menu_item_sales.load_error", {
              defaultValue: "The menu item sales report could not be loaded.",
            }),
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchReport();
    return () => controller.abort();
  }, [startDate, endDate, generationKey, requestFilters, page, retryKey, t]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: data?.currency || "AFN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  const formatNumber = (value, digits = 0) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(
      Number(value || 0),
    );
  const itemName = (item) => localizedValue(item, "name", language);
  const categoryName = (item) =>
    item?.category_id === null
      ? t("menu_item_sales.uncategorized", { defaultValue: "Uncategorized" })
      : localizedValue(item, "category_name", language);
  const dynamicCategoryName = (category) => localizedValue(category, "name", language);
  const insightItemName = (insight) =>
    localizedValue(
      {
        name: insight.item,
        name_dari: insight.item_dari,
        name_pashto: insight.item_pashto,
      },
      "name",
      language,
    );
  const insightCategoryName = (insight) =>
    localizedValue(
      {
        name: insight.category,
        name_dari: insight.category_dari,
        name_pashto: insight.category_pashto,
      },
      "name",
      language,
    );

  const updateFilter = (field, value) => {
    setFilters((current) => {
      const next = { ...current, [field]: value };
      if (field === "ranking") {
        const ranking = parseRanking(value);
        next.sortBy = current.rankBy;
        next.sortOrder = ranking.ranking === "bottom" ? "asc" : "desc";
      }
      if (field === "rankBy" && current.ranking !== "all") {
        next.sortBy = value;
      }
      if (field === "salesStatus" && value === "zero") {
        next.includeZeroSales = true;
      }
      return next;
    });
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);
  const handleSort = (field) => {
    const sort = nextSort(filters.sortBy, filters.sortOrder, field);
    setFilters((current) => ({ ...current, ...sort }));
  };

  const openPdf = () => setPdfOpen(true);
  const pdfInitialConfig = {
    startDate,
    endDate,
    category: filters.category,
    reportType:
      filters.ranking.startsWith("top")
        ? "top"
        : filters.ranking.startsWith("bottom")
          ? "bottom"
          : "complete",
    rankBy: filters.rankBy,
    limit: parseRanking(filters.ranking).limit || 10,
    includeZeroSales: filters.includeZeroSales,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    sections: PDF_SECTIONS,
  };

  const generatePdf = async (config) => {
    setPdfGenerating(true);
    try {
      const response = await instance.get("/reports/menu-items-pdf/", {
        params: buildMenuItemPdfParams({
          startDate: config.startDate,
          endDate: config.endDate,
          config,
        }),
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `menu_item_sales_${config.reportType}_${config.startDate}_${config.endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setPdfOpen(false);
      toast.success(
        t("menu_item_sales.pdf_ready", { defaultValue: "Menu item sales PDF generated." }),
      );
    } catch (pdfError) {
      toast.error(
        pdfError.response?.data?.error ||
          t("menu_item_sales.pdf_error", { defaultValue: "PDF generation failed." }),
      );
    } finally {
      setPdfGenerating(false);
    }
  };

  if (loading && !data) {
    return (
      <ReportSkeleton
        label={t("menu_item_sales.loading", { defaultValue: "Loading menu item sales report" })}
      />
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-[var(--theme-danger)]" />
        <h3 className="mt-3 font-bold theme-text-primary">
          {t("menu_item_sales.unable_to_load", { defaultValue: "Unable to load report" })}
        </h3>
        <p className="mt-1 text-sm theme-text-secondary">{error}</p>
        <button
          type="button"
          onClick={() => setRetryKey((value) => value + 1)}
          className="theme-btn theme-btn-outline mt-4 px-4 py-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t("menu_item_sales.retry", { defaultValue: "Retry" })}
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, items, category_summary: categories, trend, insights, pagination } = data;
  const filtersActive = hasActiveMenuItemFilters({
    ...filters,
    search: debouncedSearch,
  });
  const chartItems = data.top_items || [];
  const top = summary.top_selling_item;
  const lowest = summary.lowest_selling_item;
  const chartCategories = categories.filter((row) => row.net_sales > 0);

  const tooltipStyle = {
    background: "var(--theme-card)",
    border: "1px solid var(--theme-border)",
    borderRadius: "12px",
    color: "var(--theme-text-primary)",
    boxShadow: "var(--theme-shadow-md)",
  };

  return (
    <div className="space-y-6" aria-busy={loading}>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-[var(--theme-primary)]" />
            <h2 className="text-2xl font-extrabold theme-text-primary">
              {t("menu_item_sales.title", { defaultValue: "Menu Item Sales" })}
            </h2>
          </div>
          <p className="mt-1 text-sm theme-text-muted">
            {t("menu_item_sales.period", {
              defaultValue: "{{start}} – {{end}}",
              start: data.range.start,
              end: data.range.end,
            })}
            {data.branch?.name ? (
              <span>
                {" "}· {t("menu_item_sales.branch", { defaultValue: "Branch" })}: {data.branch.name}
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-xs theme-text-muted">
            {t("menu_item_sales.sales_rule_note", {
              defaultValue:
                "Completed and delivered orders only; cancelled items are excluded.",
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={openPdf}
          className="theme-btn theme-btn-danger w-full px-5 py-2.5 sm:w-auto"
        >
          <Download className="h-4 w-4" />
          {t("menu_item_sales.generate_pdf", { defaultValue: "Generate PDF" })}
        </button>
      </header>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] px-4 py-3 text-sm theme-text-secondary">
          <span>{error}</span>
          <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="font-bold text-[var(--theme-primary)]">
            {t("menu_item_sales.retry", { defaultValue: "Retry" })}
          </button>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          icon={Tag}
          label={t("menu_item_sales.total_items_sold", { defaultValue: "Total Menu Items Sold" })}
          value={formatNumber(summary.distinct_items_sold)}
        />
        <KpiCard
          icon={Utensils}
          label={t("menu_item_sales.total_units_sold", { defaultValue: "Total Units Sold" })}
          value={formatNumber(summary.total_units_sold)}
        />
        <KpiCard
          icon={ReceiptText}
          label={t("menu_item_sales.total_revenue", { defaultValue: "Total Menu Item Revenue" })}
          value={formatCurrency(summary.total_revenue)}
          hint={`${t("menu_item_sales.discount", { defaultValue: "Discount" })}: ${formatCurrency(summary.total_discount)}`}
        />
        <KpiCard
          icon={BarChart3}
          label={t("menu_item_sales.average_revenue_per_item", { defaultValue: "Average Revenue Per Item" })}
          value={formatCurrency(summary.average_revenue_per_item)}
        />
        <KpiCard
          icon={Percent}
          label={t("menu_item_sales.average_selling_price", { defaultValue: "Average Selling Price" })}
          value={formatCurrency(summary.average_selling_price)}
        />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="theme-card flex items-center gap-4 p-4">
          <span className="rounded-xl bg-[var(--theme-success-soft)] p-3 text-[var(--theme-success)]">
            <TrendingUp className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide theme-text-muted">
              {t("menu_item_sales.top_selling_item", { defaultValue: "Top Selling Item" })}
            </p>
            <p className="mt-1 truncate font-extrabold theme-text-primary">
              {top ? itemName(top) : "—"}
            </p>
            <p className="text-sm theme-text-muted">
              {top
                ? `${formatNumber(top.units_sold)} ${t("menu_item_sales.units", { defaultValue: "units" })} · ${formatCurrency(top.revenue)}`
                : t("menu_item_sales.no_sales_short", { defaultValue: "No recorded sales" })}
            </p>
          </div>
        </article>
        <article className="theme-card flex items-center gap-4 p-4">
          <span className="rounded-xl bg-[var(--theme-warning-soft)] p-3 text-[var(--theme-warning-hover)]">
            <TrendingDown className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide theme-text-muted">
              {t("menu_item_sales.lowest_selling_item", { defaultValue: "Lowest Selling Item" })}
            </p>
            <p className="mt-1 truncate font-extrabold theme-text-primary">
              {lowest ? itemName(lowest) : "—"}
            </p>
            <p className="text-sm theme-text-muted">
              {lowest
                ? `${formatNumber(lowest.units_sold)} ${t("menu_item_sales.units", { defaultValue: "units" })} · ${formatCurrency(lowest.revenue)}`
                : t("menu_item_sales.zero_excluded_note", {
                    defaultValue: "Zero-sales items are excluded from this KPI",
                  })}
            </p>
          </div>
        </article>
      </section>

      <section className="theme-card p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[var(--theme-primary)]" />
            <h3 className="font-extrabold theme-text-primary">
              {t("menu_item_sales.filters", { defaultValue: "Filters" })}
            </h3>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="theme-btn theme-btn-ghost px-3 py-1.5 text-sm"
          >
            <X className="h-4 w-4" />
            {t("menu_item_sales.reset", { defaultValue: "Reset" })}
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="relative block md:col-span-2 xl:col-span-1">
            <span className="sr-only">
              {t("menu_item_sales.search_item", { defaultValue: "Search item" })}
            </span>
            <Search className="pointer-events-none absolute start-3 top-3 h-4 w-4 theme-text-muted" />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder={t("menu_item_sales.search_item", { defaultValue: "Search item" })}
              className="theme-input h-10 w-full ps-9 pe-3 text-sm"
            />
          </label>
          <select
            value={filters.category}
            onChange={(event) => updateFilter("category", event.target.value)}
            aria-label={t("menu_item_sales.category", { defaultValue: "Category" })}
            className="theme-select h-10 w-full px-3 text-sm"
          >
            <option value="all">{t("menu_item_sales.all_categories", { defaultValue: "All Categories" })}</option>
            {data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {dynamicCategoryName(category)}
              </option>
            ))}
          </select>
          <select
            value={filters.ranking}
            onChange={(event) => updateFilter("ranking", event.target.value)}
            aria-label={t("menu_item_sales.sales_ranking", { defaultValue: "Sales Ranking" })}
            className="theme-select h-10 w-full px-3 text-sm"
          >
            {RANKING_OPTIONS.map((option) => {
              const label =
                option.direction === "all"
                  ? t("menu_item_sales.all_menu_items", { defaultValue: "All Menu Items" })
                  : t(`menu_item_sales.${option.direction}_number`, {
                      defaultValue: `${option.direction === "top" ? "Top" : "Bottom"} {{count}}`,
                      count: option.limit,
                    });
              return (
                <option key={option.value} value={option.value}>{label}</option>
              );
            })}
          </select>
          <select
            value={filters.rankBy}
            onChange={(event) => updateFilter("rankBy", event.target.value)}
            aria-label={t("menu_item_sales.rank_by", { defaultValue: "Rank By" })}
            className="theme-select h-10 w-full px-3 text-sm"
          >
            <option value="quantity">{t("menu_item_sales.quantity_sold", { defaultValue: "Quantity Sold" })}</option>
            <option value="revenue">{t("menu_item_sales.revenue", { defaultValue: "Revenue" })}</option>
          </select>
          <select
            value={filters.salesStatus}
            onChange={(event) => updateFilter("salesStatus", event.target.value)}
            aria-label={t("menu_item_sales.sales_status", { defaultValue: "Sales Status" })}
            className="theme-select h-10 w-full px-3 text-sm"
          >
            <option value="all">{t("menu_item_sales.all", { defaultValue: "All" })}</option>
            <option value="selling">{t("menu_item_sales.selling", { defaultValue: "Selling" })}</option>
            <option value="zero">{t("menu_item_sales.zero_sales", { defaultValue: "Zero Sales" })}</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced((value) => !value)}
          className="theme-btn theme-btn-ghost mt-3 px-2 py-1.5 text-sm"
          aria-expanded={showAdvanced}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t("menu_item_sales.advanced_filters", { defaultValue: "Advanced Filters" })}
          <ChevronDown className={`h-4 w-4 transition ${showAdvanced ? "rotate-180" : ""}`} />
        </button>
        {showAdvanced && (
          <div className="mt-3 flex flex-col gap-3 rounded-xl bg-[var(--theme-muted)] p-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm font-semibold theme-text-secondary">
              <input
                type="checkbox"
                checked={filters.includeZeroSales}
                onChange={(event) => updateFilter("includeZeroSales", event.target.checked)}
                className="h-4 w-4 accent-[var(--theme-primary)]"
              />
              {t("menu_item_sales.include_zero_sales", { defaultValue: "Include Zero-Sales Items" })}
            </label>
            <span className="hidden h-5 w-px bg-[var(--theme-border)] sm:block" />
            <label className="flex items-center gap-2 text-sm theme-text-secondary">
              <span className="font-semibold">{t("menu_item_sales.sort_by", { defaultValue: "Sort By" })}</span>
              <select
                value={filters.sortBy}
                onChange={(event) => updateFilter("sortBy", event.target.value)}
                className="theme-select h-9 min-w-40 px-2"
              >
                <option value="quantity">{t("menu_item_sales.quantity_sold", { defaultValue: "Quantity Sold" })}</option>
                <option value="revenue">{t("menu_item_sales.revenue", { defaultValue: "Revenue" })}</option>
                <option value="average_price">{t("menu_item_sales.average_price", { defaultValue: "Average Price" })}</option>
                <option value="orders">{t("menu_item_sales.number_of_orders", { defaultValue: "Number of Orders" })}</option>
                <option value="percentage_sales">{t("menu_item_sales.percentage_sales", { defaultValue: "% of Sales" })}</option>
              </select>
              <button
                type="button"
                onClick={() => updateFilter("sortOrder", filters.sortOrder === "desc" ? "asc" : "desc")}
                className="theme-btn theme-btn-outline h-9 px-3"
                title={t("menu_item_sales.sort_order", { defaultValue: "Sort Order" })}
              >
                {filters.sortOrder === "desc" ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
              </button>
            </label>
          </div>
        )}
      </section>

      {loading && (
        <div className="h-1 overflow-hidden rounded-full bg-[var(--theme-muted)]">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-[var(--theme-primary)]" />
        </div>
      )}

      {items.length === 0 ? (
        <EmptyReport filtered={filtersActive} onReset={resetFilters} t={t} />
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-2">
            <article className="theme-card min-w-0 p-4 sm:p-5">
              <h3 className="font-extrabold theme-text-primary">
                {t("menu_item_sales.top_selling_items", { defaultValue: "Top Selling Items" })}
              </h3>
              <p className="mt-1 text-xs theme-text-muted">
                {t("menu_item_sales.by_units_sold", { defaultValue: "Ranked by units sold" })}
              </p>
              <div className="mt-4 h-80" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartItems} layout="vertical" margin={{ left: 16, right: 22 }}>
                    <CartesianGrid stroke="var(--theme-border)" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "var(--theme-text-muted)", fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey={(row) => itemName(row)}
                      width={110}
                      tick={{ fill: "var(--theme-text-secondary)", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [formatNumber(value), t("menu_item_sales.units_sold", { defaultValue: "Units Sold" })]}
                    />
                    <Bar dataKey="units_sold" fill="var(--theme-primary)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="theme-card min-w-0 p-4 sm:p-5">
              <h3 className="font-extrabold theme-text-primary">
                {t("menu_item_sales.revenue_by_category", { defaultValue: "Revenue by Category" })}
              </h3>
              <p className="mt-1 text-xs theme-text-muted">
                {t("menu_item_sales.sales_distribution", { defaultValue: "Net sales distribution" })}
              </p>
              <div className="mt-4 h-80" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartCategories}
                      dataKey="net_sales"
                      nameKey="category_name"
                      innerRadius="48%"
                      outerRadius="76%"
                      paddingAngle={2}
                    >
                      {chartCategories.map((row, index) => (
                        <Cell key={row.category_id ?? "none"} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(_, payload) =>
                        payload?.[0] ? categoryName(payload[0].payload) : ""
                      }
                    />
                    <Legend
                      formatter={(_, entry) => categoryName(entry.payload)}
                      wrapperStyle={{ color: "var(--theme-text-secondary)", fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="theme-table overflow-hidden">
            <div className="flex flex-col gap-2 border-b border-[var(--theme-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-extrabold theme-text-primary">
                  {t("menu_item_sales.detail_title", { defaultValue: "Menu Item Sales" })}
                </h3>
                <p className="text-xs theme-text-muted">
                  {t("menu_item_sales.item_count", {
                    defaultValue: "{{count}} menu products in this report",
                    count: pagination.count,
                  })}
                </p>
              </div>
              <span className="rounded-full bg-[var(--theme-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--theme-primary)]">
                {t("menu_item_sales.net_total", { defaultValue: "Net total" })}: {formatCurrency(summary.total_revenue)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-3 text-start">{t("menu_item_sales.rank", { defaultValue: "Rank" })}</th>
                    <th className="min-w-48 px-3 py-3 text-start">
                      <SortHeader field="name" label={t("menu_item_sales.menu_item", { defaultValue: "Menu Item" })} filters={filters} onSort={handleSort} />
                    </th>
                    <th className="min-w-36 px-3 py-3 text-start">
                      <SortHeader field="category" label={t("menu_item_sales.category", { defaultValue: "Category" })} filters={filters} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-end">
                      <SortHeader field="quantity" label={t("menu_item_sales.units_sold", { defaultValue: "Units Sold" })} filters={filters} onSort={handleSort} align="end" />
                    </th>
                    <th className="px-3 py-3 text-end">
                      <SortHeader field="orders" label={t("menu_item_sales.orders", { defaultValue: "Orders" })} filters={filters} onSort={handleSort} align="end" />
                    </th>
                    <th className="px-3 py-3 text-end">{t("menu_item_sales.gross_sales", { defaultValue: "Gross Sales" })}</th>
                    <th className="px-3 py-3 text-end">{t("menu_item_sales.discount", { defaultValue: "Discount" })}</th>
                    <th className="px-3 py-3 text-end">
                      <SortHeader field="revenue" label={t("menu_item_sales.net_sales", { defaultValue: "Net Sales" })} filters={filters} onSort={handleSort} align="end" />
                    </th>
                    <th className="px-3 py-3 text-end">
                      <SortHeader field="average_price" label={t("menu_item_sales.average_price", { defaultValue: "Average Price" })} filters={filters} onSort={handleSort} align="end" />
                    </th>
                    <th className="px-3 py-3 text-end">
                      <SortHeader field="percentage_sales" label={t("menu_item_sales.percentage_sales", { defaultValue: "% of Sales" })} filters={filters} onSort={handleSort} align="end" />
                    </th>
                    <th className="px-3 py-3 text-end">{t("menu_item_sales.cancelled_qty", { defaultValue: "Cancelled Qty" })}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={`${item.product_type}-${item.product_id}`} className="border-t border-[var(--theme-border)]">
                      <td className="px-3 py-3 font-extrabold text-[var(--theme-primary)]">#{item.rank}</td>
                      <td className="px-3 py-3">
                        <div className="font-bold theme-text-primary">{itemName(item)}</div>
                        {item.product_type === "platter" && (
                          <span className="mt-1 inline-flex rounded-full bg-[var(--theme-warning-soft)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--theme-warning-hover)]">
                            {t("menu_item_sales.platter", { defaultValue: "Platter" })}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 theme-text-secondary">{categoryName(item)}</td>
                      <td className="px-3 py-3 text-end font-bold theme-text-primary">{formatNumber(item.units_sold)}</td>
                      <td className="px-3 py-3 text-end theme-text-secondary">{formatNumber(item.order_count)}</td>
                      <td className="px-3 py-3 text-end theme-text-secondary">{formatCurrency(item.gross_sales)}</td>
                      <td className="px-3 py-3 text-end text-[var(--theme-danger)]">{formatCurrency(item.discount)}</td>
                      <td className="px-3 py-3 text-end font-bold theme-text-primary">{formatCurrency(item.net_sales)}</td>
                      <td className="px-3 py-3 text-end theme-text-secondary">{formatCurrency(item.average_price)}</td>
                      <td className="px-3 py-3 text-end theme-text-secondary">{formatNumber(item.sales_percentage, 2)}%</td>
                      <td className="px-3 py-3 text-end theme-text-secondary">{formatNumber(item.cancelled_quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.total_pages > 1 && (
              <div className="flex flex-col gap-3 border-t border-[var(--theme-border)] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="theme-text-muted">
                  {t("menu_item_sales.page_of", {
                    defaultValue: "Page {{page}} of {{total}} ({{count}} items)",
                    page: pagination.page,
                    total: pagination.total_pages,
                    count: pagination.count,
                  })}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!pagination.has_previous || loading}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    className="theme-btn theme-btn-outline px-3 py-1.5 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                    {t("menu_item_sales.previous", { defaultValue: "Previous" })}
                  </button>
                  <button
                    type="button"
                    disabled={!pagination.has_next || loading}
                    onClick={() => setPage((value) => Math.min(pagination.total_pages, value + 1))}
                    className="theme-btn theme-btn-outline px-3 py-1.5 disabled:opacity-50"
                  >
                    {t("menu_item_sales.next", { defaultValue: "Next" })}
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="theme-table overflow-hidden">
            <div className="border-b border-[var(--theme-border)] p-4">
              <h3 className="font-extrabold theme-text-primary">
                {t("menu_item_sales.category_performance", { defaultValue: "Category Performance" })}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-start">{t("menu_item_sales.category", { defaultValue: "Category" })}</th>
                    <th className="px-4 py-3 text-end">{t("menu_item_sales.items_sold", { defaultValue: "Items Sold" })}</th>
                    <th className="px-4 py-3 text-end">{t("menu_item_sales.units_sold", { defaultValue: "Units Sold" })}</th>
                    <th className="px-4 py-3 text-end">{t("menu_item_sales.gross_sales", { defaultValue: "Gross Sales" })}</th>
                    <th className="px-4 py-3 text-end">{t("menu_item_sales.discount", { defaultValue: "Discount" })}</th>
                    <th className="px-4 py-3 text-end">{t("menu_item_sales.net_sales", { defaultValue: "Net Sales" })}</th>
                    <th className="px-4 py-3 text-end">{t("menu_item_sales.percentage_sales", { defaultValue: "% of Sales" })}</th>
                    <th className="px-4 py-3 text-end">{t("menu_item_sales.avg_item_revenue", { defaultValue: "Avg Item Revenue" })}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.category_id ?? "none"} className="border-t border-[var(--theme-border)]">
                      <td className="px-4 py-3 font-bold theme-text-primary">{categoryName(category)}</td>
                      <td className="px-4 py-3 text-end theme-text-secondary">{formatNumber(category.items_sold)}</td>
                      <td className="px-4 py-3 text-end theme-text-secondary">{formatNumber(category.units_sold)}</td>
                      <td className="px-4 py-3 text-end theme-text-secondary">{formatCurrency(category.gross_sales)}</td>
                      <td className="px-4 py-3 text-end text-[var(--theme-danger)]">{formatCurrency(category.discount)}</td>
                      <td className="px-4 py-3 text-end font-bold theme-text-primary">{formatCurrency(category.net_sales)}</td>
                      <td className="px-4 py-3 text-end theme-text-secondary">{formatNumber(category.sales_percentage, 2)}%</td>
                      <td className="px-4 py-3 text-end theme-text-secondary">{formatCurrency(category.average_item_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="theme-card min-w-0 p-4 sm:p-5">
            <h3 className="font-extrabold theme-text-primary">
              {t("menu_item_sales.sales_trend", { defaultValue: "Sales Trend" })}
            </h3>
            <p className="mt-1 text-xs theme-text-muted">
              {t("menu_item_sales.trend_granularity", {
                defaultValue: "Automatically aggregated {{granularity}}",
                granularity: t(`menu_item_sales.${trend.granularity}`, {
                  defaultValue: trend.granularity,
                }),
              })}
            </p>
            <div className="mt-4 h-80" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trend.points} margin={{ left: 4, right: 16 }}>
                  <CartesianGrid stroke="var(--theme-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="period" tick={{ fill: "var(--theme-text-muted)", fontSize: 11 }} />
                  <YAxis yAxisId="units" tick={{ fill: "var(--theme-text-muted)", fontSize: 11 }} />
                  <YAxis yAxisId="revenue" orientation="right" tick={{ fill: "var(--theme-text-muted)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, _name, entry) =>
                      entry?.dataKey === "revenue"
                        ? formatCurrency(value)
                        : formatNumber(value)
                    }
                  />
                  <Legend wrapperStyle={{ color: "var(--theme-text-secondary)", fontSize: 12 }} />
                  <Bar
                    yAxisId="units"
                    dataKey="units_sold"
                    name={t("menu_item_sales.units_sold", { defaultValue: "Units Sold" })}
                    fill="var(--theme-chart-2)"
                    radius={[5, 5, 0, 0]}
                  />
                  <Line
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    name={t("menu_item_sales.revenue", { defaultValue: "Revenue" })}
                    stroke="var(--theme-primary)"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "var(--theme-primary)" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="theme-card p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--theme-primary)]" />
              <h3 className="font-extrabold theme-text-primary">
                {t("menu_item_sales.insights", { defaultValue: "Insights" })}
              </h3>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {insights.map((insight) => {
                const localizedItem = insight.item ? insightItemName(insight) : "";
                const localizedCategory = insight.category
                  ? insightCategoryName(insight)
                  : "";
                const messages = {
                  top_performer: t("menu_item_sales.insight_top_performer", {
                    defaultValue: "{{item}} generated the highest revenue ({{value}}).",
                    item: localizedItem,
                    value: formatCurrency(insight.value),
                  }),
                  most_sold: t("menu_item_sales.insight_most_sold", {
                    defaultValue: "{{item}} had the highest quantity sold ({{value}} units).",
                    item: localizedItem,
                    value: formatNumber(insight.value),
                  }),
                  category_leader: t("menu_item_sales.insight_category_leader", {
                    defaultValue: "{{category}} generated the highest category revenue ({{value}}).",
                    category: localizedCategory,
                    value: formatCurrency(insight.value),
                  }),
                  low_performer: t("menu_item_sales.insight_low_performer", {
                    defaultValue: "{{item}} had the lowest sales among items with recorded sales.",
                    item: localizedItem,
                  }),
                };
                return (
                  <article key={insight.type} className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-muted)] p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--theme-primary)]">
                      {t(`menu_item_sales.${insight.type}`, {
                        defaultValue: insight.type.replaceAll("_", " "),
                      })}
                    </p>
                    <p className="mt-2 text-sm leading-6 theme-text-secondary">{messages[insight.type]}</p>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}

      {pdfOpen && (
        <PdfConfigurator
          categories={data.categories}
          initialConfig={pdfInitialConfig}
          onClose={() => !pdfGenerating && setPdfOpen(false)}
          onGenerate={generatePdf}
          generating={pdfGenerating}
          language={language}
          t={t}
        />
      )}
    </div>
  );
}
