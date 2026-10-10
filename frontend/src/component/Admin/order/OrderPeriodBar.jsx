import { useEffect, useId, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";
import {
  formatOrderPeriodDate,
  getOrderPeriodRange,
  getOrderToday,
  ORDER_PERIOD_PRESETS,
  validateOrderPeriodRange,
} from "./orderPeriod";

export default function OrderPeriodBar({ period, onApply }) {
  const { t } = useTranslation();
  const id = useId();
  const [showCustom, setShowCustom] = useState(period.preset === "custom");
  const [draft, setDraft] = useState(() => ({
    start: period.start || getOrderToday(),
    end: period.end || getOrderToday(),
  }));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!period.start || !period.end) return;
    setDraft({ start: period.start, end: period.end });
  }, [period.start, period.end]);

  const language = i18n.resolvedLanguage || i18n.language || "en";
  const rangeLabel = period.preset === "all_time"
    ? t("orders.period.presets.all_time")
    : period.start === period.end
      ? formatOrderPeriodDate(period.start, language)
      : `${formatOrderPeriodDate(period.start, language)} – ${formatOrderPeriodDate(period.end, language)}`;

  const applyPreset = (preset) => {
    setShowCustom(false);
    setError("");
    onApply(getOrderPeriodRange(preset));
  };

  const applyCustom = (event) => {
    event.preventDefault();
    const validation = validateOrderPeriodRange(draft.start, draft.end);
    if (validation) {
      setError(t(`orders.period.errors.${validation}`));
      return;
    }

    setError("");
    onApply({ preset: "custom", ...draft });
  };

  return (
    <section
      className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3"
      aria-label={t("orders.period.title")}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="erp-kpi-icon grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--theme-primary-soft)]">
            <CalendarDays className="h-4 w-4 text-[var(--theme-primary)]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide theme-text-muted">
              {t("orders.period.title")}
            </p>
            <p className="mt-0.5 truncate text-sm font-medium theme-text-primary">{rangeLabel}</p>
          </div>
        </div>

        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label={t("orders.period.presets_label")}
        >
          {ORDER_PERIOD_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`theme-btn h-8 px-2.5 text-xs ${
                period.preset === preset
                  ? "theme-btn-primary"
                  : "theme-btn-outline"
              }`}
              aria-pressed={period.preset === preset}
              onClick={() => applyPreset(preset)}
            >
              {t(`orders.period.presets.${preset}`)}
            </button>
          ))}
          <button
            type="button"
            className={`theme-btn h-8 px-2.5 text-xs ${
              period.preset === "custom" || showCustom
                ? "theme-btn-primary"
                : "theme-btn-outline"
            }`}
            aria-expanded={showCustom}
            aria-controls={`${id}-custom-range`}
            onClick={() => {
              setShowCustom((value) => !value);
              setError("");
            }}
          >
            {t("orders.period.presets.custom")}
          </button>
        </div>
      </div>

      {showCustom && (
        <form
          id={`${id}-custom-range`}
          className="mt-3 grid gap-2 border-t border-[var(--theme-border)] pt-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
          onSubmit={applyCustom}
        >
          {[
            ["start", "orders.period.start_date"],
            ["end", "orders.period.end_date"],
          ].map(([field, label]) => (
            <label key={field} className="text-xs theme-text-secondary" htmlFor={`${id}-${field}`}>
              {t(label)}
              <input
                id={`${id}-${field}`}
                type="date"
                dir="ltr"
                value={draft[field]}
                max={getOrderToday()}
                required
                className="theme-input mt-1 h-9 w-full px-2 text-xs"
                onChange={(event) => {
                  setDraft((value) => ({ ...value, [field]: event.target.value }));
                  setError("");
                }}
              />
            </label>
          ))}
          <button type="submit" className="theme-btn theme-btn-primary h-9 px-4 text-xs">
            {t("orders.period.apply")}
          </button>
          {error && (
            <p role="alert" className="text-xs text-[var(--theme-danger)] sm:col-span-3">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
