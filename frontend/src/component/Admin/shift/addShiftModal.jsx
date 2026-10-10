import { useContext, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarClock, Clock3, Loader2, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../../api/authforRBC";
import instance from "../../../api/axiosInstance";
import RestrictedToast from "../../RistrictedAction";

function getDuration(startTime, endTime) {
  if (!startTime || !endTime) return "";
  const [startHour = 0, startMinute = 0] = startTime.split(":").map(Number);
  const [endHour = 0, endMinute = 0] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  let end = endHour * 60 + endMinute;
  if (end < start) end += 24 * 60;
  const total = end - start;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export default function AddShiftModal({ onClose, onShiftAdded }) {
  const { t, i18n } = useTranslation();
  const { auth } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;
  const isRTL = i18n.dir() === "rtl";

  const [shiftType, setShiftType] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showRestriction, setShowRestriction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const duration = useMemo(
    () => getDuration(startTime, endTime),
    [endTime, startTime],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isDemo) {
      setShowRestriction(true);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await instance.post("/users/shift/", {
        shift_type: shiftType.trim(),
        start_time: startTime,
        end_time: endTime,
      });

      if (response.status === 200 || response.status === 201) {
        onShiftAdded();
      } else {
        throw new Error("Failed to add shift");
      }
    } catch (requestError) {
      console.error(requestError);
      setError(t("attendance.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--theme-overlay)] p-4"
      dir={isRTL ? "rtl" : "ltr"}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <motion.div
        initial={{ y: 16, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="theme-modal-surface relative w-full max-w-lg overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-shift-title"
      >
        <div className="border-b border-[var(--theme-border)] bg-[var(--theme-primary-subtle)] px-5 py-5 pe-14">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--theme-primary)] text-[var(--theme-text-inverse)] shadow-sm">
              <CalendarClock className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="add-shift-title" className="text-[var(--theme-text-primary)]">
                {t("add_new_shift")}
              </h2>
              <p className="mt-0.5 text-xs text-[var(--theme-text-secondary)]">
                {t("shifts.form_description", {
                  defaultValue: "Set the shift name and working hours.",
                })}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="theme-btn theme-btn-ghost theme-btn-icon absolute end-3 top-3"
          aria-label={t("staff.cancel")}
        >
          <X className="h-4 w-4" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label
              htmlFor="shift-name"
              className="mb-1.5 block text-xs font-bold text-[var(--theme-text-secondary)]"
            >
              {t("shift_name")}
            </label>
            <input
              id="shift-name"
              value={shiftType}
              onChange={(event) => setShiftType(event.target.value)}
              className="theme-input w-full px-3"
              required
              autoFocus
              placeholder={t("shift_name")}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="shift-start-time"
                className="mb-1.5 block text-xs font-bold text-[var(--theme-text-secondary)]"
              >
                {t("shifts.start_time", { defaultValue: "Start time" })}
              </label>
              <div className="relative">
                <Clock3 className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-text-muted)]" />
                <input
                  id="shift-start-time"
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="theme-input w-full ps-9 pe-3"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="shift-end-time"
                className="mb-1.5 block text-xs font-bold text-[var(--theme-text-secondary)]"
              >
                {t("shifts.end_time", { defaultValue: "End time" })}
              </label>
              <div className="relative">
                <Clock3 className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-text-muted)]" />
                <input
                  id="shift-end-time"
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="theme-input w-full ps-9 pe-3"
                  required
                />
              </div>
            </div>
          </div>

          {startTime && endTime && (
            <div className="flex items-center gap-3 rounded-xl border border-[rgb(var(--theme-primary-rgb)/0.18)] bg-[var(--theme-primary-soft)] p-3 text-sm">
              <span className="font-bold tabular-nums text-[var(--theme-text-primary)]">
                {startTime}
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--theme-surface)] text-[var(--theme-primary)]">
                <ArrowRight className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} />
              </span>
              <span className="font-bold tabular-nums text-[var(--theme-text-primary)]">
                {endTime}
              </span>
              <span className="ms-auto rounded-lg bg-[var(--theme-surface)] px-2 py-1 text-xs font-bold text-[var(--theme-primary-hover)]">
                {duration}
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--theme-danger-hover)]">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-[var(--theme-border)] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="theme-btn theme-btn-outline min-h-10 px-4"
            >
              {t("staff.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="theme-btn theme-btn-primary min-h-10 px-4"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              {loading ? t("adding") : t("add_shift")}
            </button>
          </div>
        </form>
      </motion.div>

      {showRestriction && (
        <RestrictedToast actionType="add" onClose={() => setShowRestriction(false)} />
      )}
    </div>
  );
}
