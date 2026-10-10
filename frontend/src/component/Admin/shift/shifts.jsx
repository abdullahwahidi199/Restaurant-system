import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../../api/authforRBC";
import instance from "../../../api/axiosInstance";
import AttendanceTable from "./AttendanceTable";
import AddShiftModal from "./addShiftModal";
import ShiftList from "./ShiftList";

export default function Shifts() {
  const { t, i18n } = useTranslation();
  const { activeBranch } = useContext(AuthContext);
  const isRTL = i18n.dir() === "rtl";

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [deletingShiftId, setDeletingShiftId] = useState(null);

  const getShifts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await instance.get("/users/shift/");
      const data = response.data?.results || response.data || [];
      setShifts(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error(
        "Could not get shifts:",
        requestError.response?.data || requestError.message,
      );
      setShifts([]);
      setError(t("attendance.failed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    getShifts();
  }, [activeBranch?.id, getShifts]);

  const uniqueStaffCount = useMemo(() => {
    const ids = new Set();
    shifts.forEach((shift) => {
      (shift.staff || []).forEach((member) => ids.add(member.id));
    });
    return ids.size;
  }, [shifts]);

  const handleShiftAdded = async () => {
    setShowAddModal(false);
    await getShifts();
  };

  const handleConfirmDelete = async () => {
    if (!shiftToDelete) return;

    setDeletingShiftId(shiftToDelete.id);
    try {
      await instance.delete(`/users/shift/${shiftToDelete.id}/`);
      setShifts((previous) =>
        previous.filter((shift) => shift.id !== shiftToDelete.id),
      );
      setShiftToDelete(null);
    } catch (requestError) {
      console.error(requestError);
      setError(t("attendance.failed"));
    } finally {
      setDeletingShiftId(null);
    }
  };

  return (
    <div
      className="min-w-0 space-y-5 text-[var(--theme-text-primary)]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <header className="flex flex-col gap-4 border-b border-[var(--theme-border)] pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[rgb(var(--theme-primary-rgb)/0.18)] bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
            <CalendarClock className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-[var(--theme-text-primary)]">{t("staff_shifts")}</h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--theme-text-secondary)]">
              {t("shifts.subtitle", {
                defaultValue: "Plan coverage, see who is assigned, and review attendance at a glance.",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center divide-x divide-[var(--theme-border)] rtl:divide-x-reverse">
            <div className="px-3 first:ps-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--theme-text-muted)]">
                {t("staff_shifts")}
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-[var(--theme-text-primary)]">
                {shifts.length}
              </p>
            </div>
            <div className="px-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--theme-text-muted)]">
                {t("assigned_staff")}
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-[var(--theme-text-primary)]">
                {uniqueStaffCount}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="theme-btn theme-btn-primary min-h-10 px-4"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("add_shift")}
          </button>
        </div>
      </header>

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] p-4 text-sm text-[var(--theme-danger-hover)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
          <button
            type="button"
            onClick={getShifts}
            className="theme-btn min-h-8 border border-current px-2.5"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            {t("menu_item_sales.retry")}
          </button>
        </div>
      )}

      <section aria-label={t("staff_shifts")}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-[var(--theme-primary)]" aria-hidden="true" />
            <h2 className="text-[var(--theme-text-primary)]">{t("staff_shifts")}</h2>
          </div>
          {!loading && (
            <span className="rounded-lg bg-[var(--theme-muted)] px-2.5 py-1 text-xs font-bold tabular-nums text-[var(--theme-text-secondary)]">
              {shifts.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)]"
              >
                <div className="h-28 border-b border-[var(--theme-border)] bg-[var(--theme-primary-subtle)]" />
              </div>
            ))}
          </div>
        ) : (
          <ShiftList
            shifts={shifts}
            onShiftDelete={setShiftToDelete}
            deletingShiftId={deletingShiftId}
          />
        )}
      </section>

      <AttendanceTable />

      {showAddModal && (
        <AddShiftModal
          onClose={() => setShowAddModal(false)}
          onShiftAdded={handleShiftAdded}
        />
      )}

      {shiftToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--theme-overlay)] p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletingShiftId) {
              setShiftToDelete(null);
            }
          }}
        >
          <div
            className="theme-modal-surface relative w-full max-w-md p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-shift-title"
          >
            <button
              type="button"
              onClick={() => setShiftToDelete(null)}
              disabled={Boolean(deletingShiftId)}
              className="theme-btn theme-btn-ghost theme-btn-icon absolute end-3 top-3"
              aria-label={t("staff.cancel")}
            >
              <X className="h-4 w-4" />
            </button>

            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--theme-danger-soft)] text-[var(--theme-danger-hover)]">
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 id="delete-shift-title" className="mt-4 text-[var(--theme-text-primary)]">
              {t("shifts.delete_title", { defaultValue: "Delete this shift?" })}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-[var(--theme-text-secondary)]">
              {t("shifts.delete_description", {
                defaultValue: "This will remove {{name}} from the schedule. This action cannot be undone.",
                name: shiftToDelete.shift_type,
              })}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShiftToDelete(null)}
                disabled={Boolean(deletingShiftId)}
                className="theme-btn theme-btn-outline min-h-10 px-4"
              >
                {t("staff.cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={Boolean(deletingShiftId)}
                className="theme-btn theme-btn-danger min-h-10 px-4"
              >
                {deletingShiftId ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                )}
                {t("staff.table.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
