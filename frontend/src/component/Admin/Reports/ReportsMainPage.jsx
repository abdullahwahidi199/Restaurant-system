import React, { useState } from "react";
import { BarChart3, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import OrdersReport from "./OrdersReport";
import FinanceReport from "./FinanceReport";
import InventoryReport from "./InventoryReport";
import StaffReport from "./StaffReport";
import MenuItemSalesReport from "./MenuItemSalesReport";
import { REPORT_OPTIONS, todayLocalISO } from "./menuItemReportUtils";

export default function ReportsMainPage() {
  const { t } = useTranslation();
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
    <div className="min-w-0 space-y-4">
      <header className="theme-card min-w-0 p-4">
        <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex min-w-0 items-center gap-3 xl:pb-1">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary-hover)]"
              aria-hidden="true"
            >
              <BarChart3 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-[1.5rem] font-bold leading-tight theme-text-primary">
                {t("menu_item_sales.reports", { defaultValue: "Reports" })}
              </h1>
              <p className="mt-0.5 text-xs leading-snug theme-text-secondary">
                {t("menu_item_sales.reports_subtitle", {
                  defaultValue:
                    "Generate branch-aware operational and financial reports.",
                })}
              </p>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-2.5 lg:grid-cols-[minmax(180px,1.3fr)_minmax(130px,1fr)_minmax(130px,1fr)_auto] xl:flex-1 xl:ps-6">
            <label className="col-span-2 min-w-0 space-y-1 text-xs font-semibold theme-text-secondary lg:col-span-1">
              <span className="block">
                {t("menu_item_sales.report_type", {
                  defaultValue: "Report Type",
                })}
              </span>
              <select
                id="report-type"
                value={reportType}
                onChange={(event) => setReportType(event.target.value)}
                className="theme-select h-9 w-full px-2.5"
              >
                {REPORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(`menu_item_sales.${option.key}`, {
                      defaultValue: option.fallback,
                    })}
                  </option>
                ))}
              </select>
            </label>

            <label className="min-w-0 space-y-1 text-xs font-semibold theme-text-secondary">
              <span className="block">
                {t("menu_item_sales.from", { defaultValue: "From" })}
              </span>
              <input
                id="start"
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
                id="end"
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
              className="theme-btn theme-btn-primary col-span-2 h-9 gap-2 px-4 lg:col-span-1"
              onClick={generateReport}
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              {t("menu_item_sales.generate", { defaultValue: "Generate" })}
            </button>
          </div>
        </div>

        {dateError && (
          <p
            id="report-date-error"
            role="alert"
            className="mt-3 rounded-md bg-[var(--theme-danger-soft)] px-3 py-2 text-xs text-[var(--theme-danger-hover)]"
          >
            {dateError}
          </p>
        )}
      </header>

      <div className="min-w-0">
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
    </div>
  );
}
