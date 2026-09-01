import React, { useState } from "react";
import { BarChart3, CalendarDays, Play } from "lucide-react";
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
  const [appliedRange, setAppliedRange] = useState({ start: today, end: today });
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
    <div className="space-y-6 p-3 sm:p-6">
      <div className="theme-card overflow-hidden">
        <div className="flex flex-col gap-5 p-4 sm:p-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-[var(--theme-primary-soft)] p-2.5 text-[var(--theme-primary)]">
              <BarChart3 className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold theme-text-primary">
                {t("menu_item_sales.reports", { defaultValue: "Reports" })}
              </h1>
              <p className="mt-1 text-sm theme-text-muted">
                {t("menu_item_sales.reports_subtitle", {
                  defaultValue: "Generate branch-aware operational and financial reports.",
                })}
              </p>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[minmax(210px,1fr)_160px_160px_auto]">
            <label className="space-y-1 text-sm font-semibold theme-text-secondary">
              <span>{t("menu_item_sales.report_type", { defaultValue: "Report Type" })}</span>
              <select
                id="report-type"
                value={reportType}
                onChange={(event) => setReportType(event.target.value)}
                className="theme-select h-10 w-full px-3"
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

            <label className="space-y-1 text-sm font-semibold theme-text-secondary">
              <span>{t("menu_item_sales.from", { defaultValue: "From" })}</span>
              <span className="relative block">
                <CalendarDays className="pointer-events-none absolute start-3 top-2.5 h-4 w-4 theme-text-muted" />
                <input
                  id="start"
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="theme-input h-10 w-full ps-9 pe-2"
                />
              </span>
            </label>

            <label className="space-y-1 text-sm font-semibold theme-text-secondary">
              <span>{t("menu_item_sales.to", { defaultValue: "To" })}</span>
              <span className="relative block">
                <CalendarDays className="pointer-events-none absolute start-3 top-2.5 h-4 w-4 theme-text-muted" />
                <input
                  id="end"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="theme-input h-10 w-full ps-9 pe-2"
                />
              </span>
            </label>

            <button
              type="button"
              className="theme-btn theme-btn-primary h-10 self-end px-5"
              onClick={generateReport}
            >
              <Play className="h-4 w-4" />
              {t("menu_item_sales.generate", { defaultValue: "Generate" })}
            </button>
          </div>
        </div>
        {dateError && (
          <p className="border-t border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] px-6 py-2 text-sm text-[var(--theme-danger)]">
            {dateError}
          </p>
        )}
      </div>

      <div className="theme-card p-3 sm:p-5">
        {reportType === "orders" && (
          <OrdersReport startDate={appliedRange.start} endDate={appliedRange.end} />
        )}

        {reportType === "finance" && (
          <FinanceReport startDate={appliedRange.start} endDate={appliedRange.end} />
        )}

        {reportType === "inventory" && (
          <InventoryReport startDate={appliedRange.start} endDate={appliedRange.end} />
        )}

        {reportType === "staff_performance" && (
          <StaffReport startDate={appliedRange.start} endDate={appliedRange.end} />
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
