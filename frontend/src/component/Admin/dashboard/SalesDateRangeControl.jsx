import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getSalesPresetRange,
  getSalesToday,
  SALES_PRESETS,
  validateSalesRange,
} from "./salesChartUtils";

export default function SalesDateRangeControl({ range, onApply }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(range);
  const [error, setError] = useState("");
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const id = useId();
  const key = "dashboard.sales_chart";

  useEffect(() => {
    if (!open) return undefined;
    panelRef.current?.querySelector("button")?.focus();
    const dismiss = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    containerRef.current?.addEventListener("keydown", handleKey);
    const container = containerRef.current;
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      container?.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const apply = (next) => {
    const validation = validateSalesRange(next.start, next.end);
    if (validation) {
      setError(t(`${key}.errors.${validation}`));
      return;
    }
    onApply(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="theme-btn theme-btn-outline h-7 gap-1.5 px-2 text-[11px]"
        title={t(`${key}.customize`)}
        aria-label={t(`${key}.customize`)}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => {
          setDraft(range);
          setError("");
          setOpen((value) => !value);
        }}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{t(`${key}.presets.${range.preset}`)}</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          id={`${id}-panel`}
          className="absolute end-0 top-full z-40 mt-2 w-[min(320px,calc(100vw-48px))] rounded-lg border border-[var(--theme-border-strong)] bg-[var(--theme-elevated)] p-3 shadow-lg"
          aria-label={t(`${key}.customize`)}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold theme-text-primary">
              <CalendarDays
                className="h-3.5 w-3.5 text-[var(--theme-primary)]"
                aria-hidden="true"
              />
              {t(`${key}.customize`)}
            </h4>
            <button
              type="button"
              className="theme-btn theme-btn-ghost theme-btn-icon h-6 w-6"
              aria-label={t(`${key}.close`)}
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {SALES_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`min-h-8 rounded-md border px-1.5 py-1 text-[10px] font-medium transition ${
                  range.preset === preset
                    ? "border-[var(--theme-primary)] bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]"
                    : "border-[var(--theme-border)] theme-text-secondary hover:bg-[var(--theme-hover)]"
                }`}
                aria-pressed={range.preset === preset}
                onClick={() =>
                  apply({
                    ...getSalesPresetRange(preset),
                    interval: draft.interval,
                  })
                }
              >
                {t(`${key}.presets.${preset}`)}
              </button>
            ))}
          </div>
          <form
            className="mt-3 space-y-2.5 border-t border-[var(--theme-border)] pt-3"
            onSubmit={(event) => {
              event.preventDefault();
              apply({
                ...draft,
                preset:
                  draft.start === range.start && draft.end === range.end
                    ? range.preset
                    : "custom",
              });
            }}
          >
            <p className="text-[11px] font-semibold theme-text-primary">
              {t(`${key}.presets.custom`)}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {["start", "end"].map((field) => (
                <label
                  key={field}
                  className="min-w-0 text-[11px] theme-text-secondary"
                  htmlFor={`${id}-${field}`}
                >
                  {t(`${key}.${field}_date`)}
                  <input
                    id={`${id}-${field}`}
                    type="date"
                    dir="ltr"
                    value={draft[field]}
                    max={getSalesToday()}
                    required
                    className="theme-input mt-1 h-8 w-full min-w-0 px-2 text-[11px]"
                    onChange={(event) => {
                      setDraft((value) => ({
                        ...value,
                        [field]: event.target.value,
                      }));
                      setError("");
                    }}
                  />
                </label>
              ))}
            </div>
            <label
              className="block text-[11px] theme-text-secondary"
              htmlFor={`${id}-interval`}
            >
              {t(`${key}.group_by`)}
              <select
                id={`${id}-interval`}
                value={draft.interval}
                className="theme-select mt-1 h-8 w-full text-[11px]"
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    interval: event.target.value,
                  }))
                }
              >
                {["auto", "day", "week", "month"].map((interval) => (
                  <option key={interval} value={interval}>
                    {t(`${key}.intervals.${interval}`)}
                  </option>
                ))}
              </select>
            </label>
            {error && (
              <p
                role="alert"
                className="text-[11px] text-[var(--theme-danger)]"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              className="theme-btn theme-btn-primary h-8 w-full text-[11px]"
            >
              {t(`${key}.apply`)}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
