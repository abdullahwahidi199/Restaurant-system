import { useCallback, useContext, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  Maximize2,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../../api/authforRBC";
import instance from "../../../api/axiosInstance";
import Modal from "../../../modules/shared/erp/components/Modal";
import SalesDateRangeControl from "./SalesDateRangeControl";
import { formatSalesDate, getSalesPresetRange } from "./salesChartUtils";

const key = "dashboard.sales_chart";

function SalesTooltip({ active, payload }) {
  const { t, i18n } = useTranslation();

  if (!active || !payload?.length) return null;

  const item = payload[0].payload;
  const accent = payload[0]?.color || "var(--theme-primary)";
  const money = (value) =>
    `${new Intl.NumberFormat(i18n.language, {
      maximumFractionDigits: 2,
    }).format(value ?? 0)} AFN`;

  const dateLabel =
    item.date === item.end_date
      ? formatSalesDate(item.date, i18n.language, { year: "numeric" })
      : `${formatSalesDate(item.date, i18n.language)} – ${formatSalesDate(
          item.end_date,
          i18n.language,
          { year: "numeric" },
        )}`;

  return (
    <div className="pointer-events-none min-w-[210px] rounded-2xl border border-[var(--theme-border-strong)] bg-[var(--theme-elevated)] p-3.5 text-xs shadow-xl">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />
        <p className="font-semibold theme-text-primary">{dateLabel}</p>
      </div>

      <dl className="space-y-2 border-t border-[var(--theme-border)] pt-3 theme-text-secondary">
        <div className="flex justify-between gap-5">
          <dt>{t("dashboard.charts.revenue")}</dt>
          <dd className="font-semibold tabular-nums theme-text-primary">
            {money(item.revenue)}
          </dd>
        </div>
        <div className="flex justify-between gap-5">
          <dt>{t(`${key}.completed_orders`)}</dt>
          <dd className="font-semibold tabular-nums theme-text-primary">
            {item.orders}
          </dd>
        </div>
        <div className="flex justify-between gap-5">
          <dt>{t(`${key}.average_order`)}</dt>
          <dd className="font-semibold tabular-nums theme-text-primary">
            {money(item.average_order_value)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

const rangeSliderStyles = `
  .sales-range-input {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    pointer-events: none;
  }

  .sales-range-input:focus {
    outline: none;
  }

  .sales-range-input::-webkit-slider-runnable-track {
    height: 4px;
    background: transparent;
  }

  .sales-range-input::-moz-range-track {
    height: 4px;
    background: transparent;
  }

  .sales-range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    box-sizing: border-box;
    width: 16px;
    height: 16px;
    margin-top: -6px;
    border: 2px solid var(--theme-card);
    border-radius: 9999px;
    background: var(--theme-primary);
    box-shadow: 0 2px 8px rgb(15 23 42 / 24%);
    pointer-events: auto;
    cursor: grab;
    transition: transform 120ms ease, box-shadow 120ms ease;
  }

  .sales-range-input::-moz-range-thumb {
    box-sizing: border-box;
    width: 16px;
    height: 16px;
    border: 2px solid var(--theme-card);
    border-radius: 9999px;
    background: var(--theme-primary);
    box-shadow: 0 2px 8px rgb(15 23 42 / 24%);
    pointer-events: auto;
    cursor: grab;
    transition: transform 120ms ease, box-shadow 120ms ease;
  }

  .sales-range-input:active::-webkit-slider-thumb,
  .sales-range-input:active::-moz-range-thumb {
    transform: scale(1.08);
    cursor: grabbing;
  }

  .sales-range-input:focus-visible::-webkit-slider-thumb {
    box-shadow:
      0 0 0 3px var(--theme-card),
      0 0 0 5px var(--theme-primary),
      0 2px 8px rgb(15 23 42 / 24%);
  }

  .sales-range-input:focus-visible::-moz-range-thumb {
    box-shadow:
      0 0 0 3px var(--theme-card),
      0 0 0 5px var(--theme-primary),
      0 2px 8px rgb(15 23 42 / 24%);
  }
`;

function SalesRangeSlider({
  series,
  startIndex,
  endIndex,
  onRangeChange,
  onReset,
}) {
  const { t, i18n } = useTranslation();
  const id = useId().replace(/:/g, "");
  const [activeThumb, setActiveThumb] = useState("end");
  const maxIndex = Math.max(1, series.length - 1);

  const formatPointDate = (point, useEndDate = false) => {
    const value = useEndDate ? point?.end_date || point?.date : point?.date;

    return value
      ? formatSalesDate(value, i18n.language, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";
  };

  const selectedStart = formatPointDate(series[startIndex]);
  const selectedEnd = formatPointDate(series[endIndex], true);
  const fullStart = formatPointDate(series[0]);
  const fullEnd = formatPointDate(series[series.length - 1], true);
  const zoomLabel = t(`${key}.zoom`);
  const showAllLabel = t(`${key}.show_all`, {
    defaultValue: "Show all",
  });
  const isZoomed = startIndex !== 0 || endIndex !== series.length - 1;

  const startPercent = (startIndex / maxIndex) * 100;
  const endPercent = (endIndex / maxIndex) * 100;

  return (
    <div
      role="group"
      aria-label={zoomLabel}
      className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-muted)] p-2.5 sm:p-3"
    >
      <style>{rangeSliderStyles}</style>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold theme-text-primary">
            {zoomLabel}
          </p>
          <p className="mt-0.5 truncate text-xs tabular-nums theme-text-secondary">
            {selectedStart}
            <span className="mx-1 theme-text-muted">–</span>
            {selectedEnd}
          </p>
        </div>

        {isZoomed && (
          <button
            type="button"
            onClick={onReset}
            title={showAllLabel}
            aria-label={showAllLabel}
            className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] px-2.5 text-[11px] font-semibold theme-text-secondary transition hover:theme-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{showAllLabel}</span>
          </button>
        )}
      </div>

      <div className="relative mx-2 mt-1.5 h-7" dir="ltr">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--theme-border)]" />

        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--theme-primary)]"
          style={{
            left: `${startPercent}%`,
            right: `${100 - endPercent}%`,
          }}
        />

        <input
          type="range"
          min={0}
          max={series.length - 1}
          step={1}
          value={startIndex}
          aria-label={`${zoomLabel}: ${selectedStart}`}
          aria-valuetext={selectedStart}
          aria-describedby={`${id}-hint`}
          onFocus={() => setActiveThumb("start")}
          onPointerDown={() => setActiveThumb("start")}
          onChange={(event) => {
            const nextStart = Math.min(
              Number(event.currentTarget.value),
              endIndex - 1,
            );
            onRangeChange(nextStart, endIndex);
          }}
          className={`sales-range-input absolute inset-0 h-full w-full ${
            activeThumb === "start" ? "z-30" : "z-20"
          }`}
        />

        <input
          type="range"
          min={0}
          max={series.length - 1}
          step={1}
          value={endIndex}
          aria-label={`${zoomLabel}: ${selectedEnd}`}
          aria-valuetext={selectedEnd}
          aria-describedby={`${id}-hint`}
          onFocus={() => setActiveThumb("end")}
          onPointerDown={() => setActiveThumb("end")}
          onChange={(event) => {
            const nextEnd = Math.max(
              Number(event.currentTarget.value),
              startIndex + 1,
            );
            onRangeChange(startIndex, nextEnd);
          }}
          className={`sales-range-input absolute inset-0 h-full w-full ${
            activeThumb === "end" ? "z-30" : "z-20"
          }`}
        />
      </div>

      <div
        className="mt-0 hidden justify-between gap-3 text-[9px] font-medium theme-text-muted sm:flex"
        dir="ltr"
      >
        <span>{fullStart}</span>
        <span>{fullEnd}</span>
      </div>

      <p id={`${id}-hint`} className="sr-only">
        {t(`${key}.zoom_hint`)}
      </p>
    </div>
  );
}

function SalesPlot({ report, metric, expanded }) {
  const { t, i18n } = useTranslation();
  const id = useId().replace(/:/g, "");
  const series = report.series || [];
  const maxIndex = Math.max(0, series.length - 1);

  const selectionKey = `${report.range.start_date}:${report.range.end_date}:${report.range.interval}:${series.length}`;
  const [savedSelection, setSavedSelection] = useState(null);

  const currentSelection =
    savedSelection?.key === selectionKey ? savedSelection : null;

  const startIndex = Math.min(
    currentSelection?.startIndex ?? 0,
    Math.max(0, maxIndex - 1),
  );

  const endIndex = Math.max(
    startIndex,
    Math.min(currentSelection?.endIndex ?? maxIndex, maxIndex),
  );

  const visibleSeries = expanded
    ? series.slice(startIndex, endIndex + 1)
    : series;

  const color =
    metric === "revenue" ? "var(--theme-chart-2)" : "var(--theme-chart-3)";

  const dateOptions =
    report.range.interval === "month"
      ? { month: "short", year: "2-digit" }
      : { month: "short", day: "numeric" };

  const tickDate = (value) =>
    formatSalesDate(value, i18n.language, dateOptions);

  const saveSelection = (nextStartIndex, nextEndIndex) => {
    setSavedSelection({
      key: selectionKey,
      startIndex: nextStartIndex,
      endIndex: nextEndIndex,
    });
  };

  const resetSelection = () => {
    setSavedSelection({
      key: selectionKey,
      startIndex: 0,
      endIndex: maxIndex,
    });
  };

  return (
    <div className="space-y-2">
      <div
        className="overflow-hidden rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)]"
        style={{
          height: expanded ? "clamp(110px, calc(100dvh - 480px), 280px)" : 180,
        }}
        dir="ltr"
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
          <AreaChart
            data={visibleSeries}
            margin={{
              top: 12,
              right: 12,
              left: expanded ? 2 : -8,
              bottom: expanded ? 6 : 0,
            }}
            accessibilityLayer
          >
            <defs>
              <linearGradient
                id={`sales-fill-${id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0.025} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="var(--theme-border)"
              strokeDasharray="4 6"
            />

            <XAxis
              dataKey="date"
              tickFormatter={tickDate}
              axisLine={false}
              tickLine={false}
              minTickGap={expanded ? 42 : 28}
              tickMargin={6}
              interval="preserveStartEnd"
              tick={{
                fill: "var(--theme-text-muted)",
                fontSize: expanded ? 11 : 10,
              }}
            />

            <YAxis
              width={expanded ? 64 : 56}
              axisLine={false}
              tickLine={false}
              tickMargin={6}
              domain={[0, "auto"]}
              allowDecimals={metric === "revenue"}
              tickFormatter={(value) =>
                new Intl.NumberFormat(i18n.language, {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(value)
              }
              tick={{
                fill: "var(--theme-text-muted)",
                fontSize: expanded ? 11 : 10,
              }}
            />

            <Tooltip
              content={<SalesTooltip />}
              cursor={{
                stroke: color,
                strokeWidth: 1,
                strokeDasharray: "4 4",
                strokeOpacity: 0.55,
              }}
            />

            <Area
              type="monotone"
              dataKey={metric}
              name={t(`dashboard.charts.${metric}`)}
              stroke={color}
              strokeWidth={expanded ? 3 : 2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={`url(#sales-fill-${id})`}
              dot={
                visibleSeries.length === 1
                  ? {
                      r: 5,
                      fill: "var(--theme-card)",
                      stroke: color,
                      strokeWidth: 2.5,
                    }
                  : false
              }
              activeDot={{
                r: 5,
                fill: "var(--theme-card)",
                stroke: color,
                strokeWidth: 2.5,
              }}
              isAnimationActive={false}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {expanded && series.length > 2 && (
        <SalesRangeSlider
          series={series}
          startIndex={startIndex}
          endIndex={endIndex}
          onRangeChange={saveSelection}
          onReset={resetSelection}
        />
      )}
    </div>
  );
}

export default function DailySalesChart() {
  const { t, i18n } = useTranslation();
  const authContext = useContext(AuthContext);

  const [range, setRange] = useState(() => getSalesPresetRange("last_30_days"));
  const [result, setResult] = useState(null);
  const [retry, setRetry] = useState(0);
  const [metric, setMetric] = useState("revenue");
  const [expanded, setExpanded] = useState(false);

  const branchId =
    authContext?.activeBranch?.id ??
    authContext?.auth?.user?.active_branch?.id ??
    "";

  const requestKey = `${range.start}:${range.end}:${range.interval}:${branchId}:${retry}`;
  const loading = result?.key !== requestKey;
  const report = loading ? null : result?.report;
  const error = loading ? "" : result?.error;
  const closeExpanded = useCallback(() => setExpanded(false), []);

  useEffect(() => {
    const controller = new AbortController();

    instance
      .get("/reports/dashboard-sales/", {
        params: {
          start_date: range.start,
          end_date: range.end,
          interval: range.interval,
        },
        signal: controller.signal,
      })
      .then((response) => {
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, report: response.data });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setResult({
            key: requestKey,
            error: err.response?.status || "failed",
          });
        }
      });

    return () => controller.abort();
  }, [range.start, range.end, range.interval, requestKey]);

  const period = t(`${key}.presets.${range.preset}`);
  const title = t(`${key}.title`, {
    metric: t(`dashboard.charts.${metric}`),
    period,
  });

  const formatNumber = (value, money = false) =>
    `${new Intl.NumberFormat(i18n.language, {
      maximumFractionDigits: money ? 2 : 0,
    }).format(value || 0)}${money ? " AFN" : ""}`;

  const dateRange = `${formatSalesDate(range.start, i18n.language, {
    year: "numeric",
  })} – ${formatSalesDate(range.end, i18n.language, {
    year: "numeric",
  })}`;

  const change = report?.comparison?.[`${metric}_change_percent`];

  const metrics = report
    ? [
        {
          label: t(`${key}.total_revenue`),
          value: formatNumber(report.totals.revenue, true),
        },
        {
          label: t(`${key}.completed_orders`),
          value: formatNumber(report.totals.orders),
        },
        {
          label: t(`${key}.average_order`),
          value: formatNumber(report.totals.average_order_value, true),
        },
        {
          label: t(`${key}.daily_average`),
          value: formatNumber(report.totals.daily_average_revenue, true),
        },
      ]
    : [];

  const renderChart = (large = false) => (
    <div className={large ? "space-y-3 p-3 sm:p-4" : "space-y-3"}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          {!large && (
            <h3 className="text-sm font-semibold tracking-tight theme-text-primary">
              {title}
            </h3>
          )}

          <p className="mt-0.5 text-[10px] leading-4 theme-text-muted">
            {dateRange}
          </p>

          {report && (
            <p className="text-[10px] theme-text-muted">
              {t(`${key}.intervals.${report.range.interval}`)} ·{" "}
              {report.range.days} {t(`${key}.days`)} · {report.range.timezone}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <SalesDateRangeControl range={range} onApply={setRange} />

          {!large && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="theme-btn theme-btn-outline theme-btn-icon h-8 w-8 rounded-lg"
              title={t(`${key}.expand`)}
              aria-label={t(`${key}.expand`)}
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div
          className={`grid place-items-center rounded-xl bg-[var(--theme-muted)] ${
            large ? "min-h-[120px]" : "min-h-[180px]"
          }`}
          role="status"
        >
          <p className="flex items-center gap-2 text-xs theme-text-muted">
            <Loader2
              className="h-4 w-4 animate-spin text-[var(--theme-primary)]"
              aria-hidden="true"
            />
            {t(`${key}.loading`)}
          </p>
        </div>
      ) : error ? (
        <div
          className={`grid place-items-center rounded-xl bg-[var(--theme-muted)] px-4 text-center ${
            large ? "min-h-[120px]" : "min-h-[180px]"
          }`}
        >
          <div>
            <p role="alert" className="text-xs text-[var(--theme-danger)]">
              {t(`${key}.load_failed`)}
            </p>
            <button
              type="button"
              className="theme-btn theme-btn-outline mt-2 h-8 rounded-lg px-3 text-xs"
              onClick={() => setRetry((value) => value + 1)}
            >
              {t(`${key}.retry`)}
            </button>
          </div>
        </div>
      ) : (
        report && (
          <>
            <dl
              className={`grid gap-1.5 ${
                large ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"
              }`}
            >
              {metrics.map((item) => (
                <div
                  key={item.label}
                  className="min-w-0 rounded-lg bg-[var(--theme-muted)] px-2 py-1.5"
                >
                  <dt className="text-[9px] font-medium theme-text-muted">
                    {item.label}
                  </dt>
                  <dd
                    className={`mt-0.5 break-words font-semibold tabular-nums theme-text-primary ${
                      large ? "text-sm sm:text-base" : "text-[13px]"
                    }`}
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex rounded-lg bg-[var(--theme-muted)] p-0.5">
                {["revenue", "orders"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMetric(item)}
                    aria-pressed={metric === item}
                    className={`min-h-8 rounded-md px-2.5 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] ${
                      metric === item
                        ? "bg-[var(--theme-card)] text-[var(--theme-primary)] shadow-sm"
                        : "theme-text-muted hover:theme-text-primary"
                    }`}
                  >
                    {t(`dashboard.charts.${item}`)}
                  </button>
                ))}
              </div>

              <p
                className={`flex min-h-7 items-center gap-1 rounded-full border border-[var(--theme-border)] px-2.5 text-[10px] font-semibold ${
                  change == null
                    ? "bg-[var(--theme-muted)] theme-text-muted"
                    : change >= 0
                      ? "bg-[var(--theme-muted)] text-[var(--theme-success)]"
                      : "bg-[var(--theme-muted)] text-[var(--theme-danger)]"
                }`}
                title={
                  report.comparison.start_date
                    ? `${report.comparison.start_date} – ${report.comparison.end_date}`
                    : undefined
                }
              >
                {change == null ? (
                  t(`${key}.no_previous_sales`)
                ) : (
                  <>
                    {change >= 0 ? (
                      <TrendingUp className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="h-3 w-3" aria-hidden="true" />
                    )}
                    {change > 0 ? "+" : ""}
                    {new Intl.NumberFormat(i18n.language, {
                      maximumFractionDigits: 1,
                    }).format(change)}
                    % {t(`${key}.vs_previous`)}
                  </>
                )}
              </p>
            </div>

            {report.totals.orders === 0 && (
              <p className="rounded-lg bg-[var(--theme-muted)] px-2 py-1.5 text-[11px] theme-text-muted">
                {t(`${key}.no_sales`)}
              </p>
            )}

            <SalesPlot report={report} metric={metric} expanded={large} />

            {!large && (
              <p className="text-[10px] leading-4 theme-text-muted">
                {t(`${key}.sales_note`)}
              </p>
            )}
          </>
        )
      )}
    </div>
  );

  return (
    <>
      {renderChart()}

      {expanded &&
        createPortal(
          <Modal title={title} wide onClose={closeExpanded}>
            {renderChart(true)}
          </Modal>,
          document.body,
        )}
    </>
  );
}
