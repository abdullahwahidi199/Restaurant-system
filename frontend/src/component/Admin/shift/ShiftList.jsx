import { ArrowRight, Clock3, Trash2, UserRoundPlus, UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import StaffAvatar from "./StaffAvatar";

function formatTime(time, locale) {
  if (!time) return "--:--";
  const [hours = 0, minutes = 0] = String(time).split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDuration(startTime, endTime, locale) {
  if (!startTime || !endTime) return "";
  const [startHour = 0, startMinute = 0] = startTime.split(":").map(Number);
  const [endHour = 0, endMinute = 0] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  let end = endHour * 60 + endMinute;
  if (end < start) end += 24 * 60;
  const total = end - start;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const number = new Intl.NumberFormat(locale);
  return minutes
    ? `${number.format(hours)}h ${number.format(minutes)}m`
    : `${number.format(hours)}h`;
}

function readableRole(member) {
  return String(member?.custom_role || member?.role || "—").replaceAll("_", " ");
}

export default function ShiftList({ shifts, onShiftDelete, deletingShiftId }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language;
  const isRTL = i18n.dir() === "rtl";

  if (!shifts.length) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--theme-border)] bg-[var(--theme-muted)] px-6 py-12 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text-muted)]">
          <Clock3 className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-3 text-[var(--theme-text-primary)]">{t("no_shifts")}</h2>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {shifts.map((shift) => {
        const members = Array.isArray(shift.staff) ? shift.staff : [];
        const visibleMembers = members.slice(0, 5);
        const hiddenCount = Math.max(0, members.length - visibleMembers.length);

        return (
          <article
            key={shift.id}
            className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-sm transition hover:border-[rgb(var(--theme-primary-rgb)/0.35)]"
          >
            <div className="border-b border-[var(--theme-border)] bg-[var(--theme-primary-subtle)] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--theme-primary)] text-[var(--theme-text-inverse)] shadow-sm">
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-[var(--theme-text-primary)]">
                      {shift.shift_type}
                    </h2>
                    <p className="mt-0.5 text-xs font-medium text-[var(--theme-text-secondary)]">
                      {t("shift")}
                    </p>
                  </div>
                </div>
                <span className="rounded-lg border border-[rgb(var(--theme-primary-rgb)/0.2)] bg-[var(--theme-surface)] px-2 py-1 text-xs font-bold tabular-nums text-[var(--theme-primary-hover)]">
                  {getDuration(shift.start_time, shift.end_time, locale)}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm tabular-nums text-[var(--theme-text-secondary)]">
                <span className="font-semibold text-[var(--theme-text-primary)]">
                  {formatTime(shift.start_time, locale)}
                </span>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--theme-surface)] text-[var(--theme-text-muted)]">
                  <ArrowRight className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} aria-hidden="true" />
                </span>
                <span className="font-semibold text-[var(--theme-text-primary)]">
                  {formatTime(shift.end_time, locale)}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <UsersRound className="h-4 w-4 text-[var(--theme-primary)]" aria-hidden="true" />
                  <h3 className="font-bold text-[var(--theme-text-primary)]">{t("assigned_staff")}</h3>
                </div>
                <span className="inline-flex min-w-7 items-center justify-center rounded-lg bg-[var(--theme-muted)] px-2 py-1 text-xs font-bold tabular-nums text-[var(--theme-text-secondary)]">
                  {members.length}
                </span>
              </div>

              {members.length ? (
                <ul className="space-y-1.5">
                  {visibleMembers.map((member) => (
                    <li
                      key={member.id}
                      className="flex min-w-0 items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 transition hover:border-[var(--theme-border)] hover:bg-[var(--theme-hover)]"
                    >
                      <StaffAvatar member={member} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--theme-text-primary)]">
                          {member.name}
                        </p>
                        <p className="truncate text-xs capitalize text-[var(--theme-text-muted)]">
                          {readableRole(member)}
                        </p>
                      </div>
                    </li>
                  ))}
                  {hiddenCount > 0 && (
                    <li className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-[var(--theme-primary)]">
                      <UserRoundPlus className="h-4 w-4" aria-hidden="true" />
                      +{hiddenCount} {t("assigned_staff")}
                    </li>
                  )}
                </ul>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--theme-border)] bg-[var(--theme-muted)] px-4 py-8 text-center">
                  <UsersRound className="mb-2 h-6 w-6 text-[var(--theme-text-muted)]" aria-hidden="true" />
                  <p className="text-sm font-medium text-[var(--theme-text-muted)]">{t("no_staff")}</p>
                </div>
              )}
            </div>

            <footer className="flex items-center justify-between border-t border-[var(--theme-border)] bg-[var(--theme-muted)] px-4 py-2.5">
              <div className="-space-x-2 rtl:space-x-reverse">
                {members.slice(0, 4).map((member) => (
                  <StaffAvatar
                    key={member.id}
                    member={member}
                    size="sm"
                    className="ring-2 ring-[var(--theme-surface)]"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => onShiftDelete(shift)}
                disabled={deletingShiftId === shift.id}
                className="theme-btn theme-btn-ghost min-h-8 px-2 text-[var(--theme-danger-hover)] hover:bg-[var(--theme-danger-soft)] hover:text-[var(--theme-danger-hover)]"
                aria-label={`${t("staff.table.delete")} ${shift.shift_type}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>{t("staff.table.delete")}</span>
              </button>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
