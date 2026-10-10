import React, { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Landmark,
  PackageSearch,
  Play,
  ShoppingBag,
  UsersRound,
  Utensils,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../../modules/shared/erp/components/PageHeader";
import OrdersReport from "./OrdersReport";
import FinanceReport from "./FinanceReport";
import InventoryReport from "./InventoryReport";
import StaffReport from "./StaffReport";
import MenuItemSalesReport from "./MenuItemSalesReport";
import { REPORT_OPTIONS, todayLocalISO } from "./menuItemReportUtils";

const REPORT_META = {
  orders: { icon: ShoppingBag },
  finance: { icon: Landmark },
  inventory: { icon: PackageSearch },
  staff_performance: { icon: UsersRound },
  menu_items: { icon: Utensils },
};

const toLocalISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const offsetDate = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const formatDisplayDate = (value, locale) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale || "en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export default function ReportsMainPage() {
  const { t, i18n } = useTranslation();
  const today = todayLocalISO();

  const [reportType, setReportType] = useState("orders");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [appliedRange, setAppliedRange] = useState({
    start: today,
    end: today,
  });
  const [generationKey, setGenerationKey] = useState(0);
  const [dateError, setDateError] = useState("");

  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const selectedOption =
    REPORT_OPTIONS.find((option) => option.value === reportType) ||
    REPORT_OPTIONS[0];
  const selectedLabel = t(`menu_item_sales.${selectedOption.key}`, {
    defaultValue: selectedOption.fallback,
  });
  const appliedPeriod = `${formatDisplayDate(appliedRange.start, locale)} — ${formatDisplayDate(
    appliedRange.end,
    locale,
  )}`;

  const presets = useMemo(() => {
    const now = new Date();
    const todayValue = toLocalISO(now);
    return [
      {
        key: "today",
        label: t("reports.range.today", { defaultValue: "Today" }),
        start: todayValue,
        end: todayValue,
      },
      {
        key: "seven_days",
        label: t("reports.range.last_7_days", { defaultValue: "Last 7 days" }),
        start: toLocalISO(offsetDate(now, -6)),
        end: todayValue,
      },
      {
        key: "thirty_days",
        label: t("reports.range.last_30_days", { defaultValue: "Last 30 days" }),
        start: toLocalISO(offsetDate(now, -29)),
        end: todayValue,
      },
      {
        key: "month",
        label: t("reports.range.this_month", { defaultValue: "This month" }),
        start: toLocalISO(new Date(now.getFullYear(), now.getMonth(), 1)),
        end: todayValue,
      },
    ];
  }, [t]);

  const selectPreset = (preset) => {
    setStartDate(preset.start);
    setEndDate(preset.end);
    setDateError("");
  };

  const generateReport = () => {
    if (!startDate || !endDate || startDate > endDate) {
      setDateError(
        t("menu_item_sales.date_range_error", {
          defaultValue: "Choose a valid date range.",
        }),
      );
      return;
    }
    setDateError("");
    setAppliedRange({ start: startDate, end: endDate });
    setGenerationKey((value) => value + 1);
  };

  return (
    <section className="reports-workspace min-w-0 space-y-4">
      <PageHeader
        icon={BarChart3}
        title={t("menu_item_sales.reports", { defaultValue: "Reports" })}
        description={t("menu_item_sales.reports_subtitle", {
          defaultValue:
            "Turn live restaurant data into clear operational and financial decisions.",
        })}
        quickStats={[
          {
            label: t("menu_item_sales.report_type", {
              defaultValue: "Report type",
            }),
            value: selectedLabel,
          },
          {
            label: t("reports.period", { defaultValue: "Applied period" }),
            value: appliedPeriod,
          },
        ]}
      />

      <section className="theme-card min-w-0 overflow-hidden" aria-label={t("menu_item_sales.report_type", { defaultValue: "Report type" })}>
        <div className="border-b border-[var(--theme-border)] p-3">
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3 xl:grid-cols-5" role="tablist" aria-label={t("menu_item_sales.report_type", { defaultValue: "Report type" })}>
            {REPORT_OPTIONS.map((option) => {
              const active = reportType === option.value;
              const meta = REPORT_META[option.value] || REPORT_META.orders;
              const Icon = meta.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setReportType(option.value)}
                  className={`group relative flex min-w-0 items-center gap-2 rounded-md border p-2 text-start transition ${
                    active
                      ? "border-[var(--theme-primary)] bg-[var(--theme-primary-soft)]"
                      : "border-[var(--theme-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-border-strong)] hover:bg-[var(--theme-hover)]"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${
                      active
                        ? "bg-[var(--theme-primary)] text-[var(--theme-text-inverse)]"
                        : "bg-[var(--theme-muted)] theme-text-secondary group-hover:text-[var(--theme-primary)]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <p className={`min-w-0 truncate text-xs font-semibold ${active ? "text-[var(--theme-primary-hover)]" : "theme-text-primary"}`}>
                    {t(`menu_item_sales.${option.key}`, {
                      defaultValue: option.fallback,
                    })}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-[var(--theme-muted)] p-3">
        <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[var(--theme-primary)]" aria-hidden="true" />
              <h3 className="text-xs font-semibold uppercase tracking-wide theme-text-secondary">
                {t("reports.date_range", { defaultValue: "Date range" })}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5" aria-label={t("reports.quick_ranges", { defaultValue: "Quick date ranges" })}>
              {presets.map((preset) => {
                const active = startDate === preset.start && endDate === preset.end;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                      active
                        ? "border-[var(--theme-primary)] bg-[var(--theme-primary-soft)] text-[var(--theme-primary-hover)]"
                        : "border-[var(--theme-border)] bg-[var(--theme-surface)] theme-text-secondary hover:border-[var(--theme-border-strong)]"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(145px,1fr)_minmax(145px,1fr)_auto_auto]">
            <label className="min-w-0 space-y-1 text-xs font-semibold theme-text-secondary">
              <span className="block">
                {t("menu_item_sales.from", { defaultValue: "From" })}
              </span>
              <input
                id="report-start"
                type="date"
                value={startDate}
                max={endDate || undefined}
                aria-invalid={Boolean(dateError)}
                aria-describedby={dateError ? "report-date-error" : undefined}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setDateError("");
                }}
                className="theme-input h-9 w-full min-w-0 px-2.5"
              />
            </label>

            <label className="min-w-0 space-y-1 text-xs font-semibold theme-text-secondary">
              <span className="block">
                {t("menu_item_sales.to", { defaultValue: "To" })}
              </span>
              <input
                id="report-end"
                type="date"
                value={endDate}
                min={startDate || undefined}
                aria-invalid={Boolean(dateError)}
                aria-describedby={dateError ? "report-date-error" : undefined}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setDateError("");
                }}
                className="theme-input h-9 w-full min-w-0 px-2.5"
              />
            </label>

            <button
              type="button"
              className="theme-btn theme-btn-primary mt-auto h-9 w-full gap-2 px-4 sm:w-auto"
              onClick={generateReport}
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              {t("reports.run", { defaultValue: "Run report" })}
            </button>

            <div id="report-export-action" className="mt-auto min-w-0" />
          </div>
        </div>

        {dateError && (
          <p
            id="report-date-error"
            role="alert"
            className="mt-3 rounded-md border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] px-3 py-2 text-xs text-[var(--theme-danger-hover)]"
          >
            {dateError}
          </p>
        )}
        </div>
      </section>

      <div className="min-w-0" role="tabpanel" aria-label={selectedLabel}>
        {reportType === "orders" && (
          <OrdersReport
            startDate={appliedRange.start}
            endDate={appliedRange.end}
          />
        )}

        {reportType === "finance" && (
          <FinanceReport
            startDate={appliedRange.start}
            endDate={appliedRange.end}
          />
        )}

        {reportType === "inventory" && (
          <InventoryReport
            startDate={appliedRange.start}
            endDate={appliedRange.end}
          />
        )}

        {reportType === "staff_performance" && (
          <StaffReport
            startDate={appliedRange.start}
            endDate={appliedRange.end}
          />
        )}

        {reportType === "menu_items" && (
          <MenuItemSalesReport
            startDate={appliedRange.start}
            endDate={appliedRange.end}
            generationKey={generationKey}
          />
        )}
      </div>
    </section>
  );
}
