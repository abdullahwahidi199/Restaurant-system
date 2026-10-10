import { useContext, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  Save,
  UserCheck,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../api/authforRBC";
import instance from "../../api/axiosInstance";
import RestrictedToast from "../RistrictedAction";
import StaffAvatar from "./shift/StaffAvatar";

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShiftTime(time, locale) {
  if (!time) return "--:--";
  const [hours = 0, minutes = 0] = String(time).split(":").map(Number);
  const value = new Date();
  value.setHours(hours, minutes, 0, 0);
  return value.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function readableRole(member) {
  return String(member?.custom_role || member?.role || "—").replaceAll("_", " ");
}

export default function Attendance() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const locale = i18n.resolvedLanguage || i18n.language;
  const { auth, activeBranch } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;
  const today = getLocalDateKey();

  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [shiftsLoading, setShiftsLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState(null);
  const [showRestriction, setShowRestriction] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchShifts = async () => {
      setShiftsLoading(true);
      setLoadError("");
      try {
        const response = await instance.get("/users/shift/");
        const data = response.data?.results || response.data || [];
        if (ignore) return;
        const nextShifts = Array.isArray(data) ? data : [];
        setShifts(nextShifts);
        setSelectedShiftId(nextShifts[0]?.id ?? null);
      } catch (error) {
        console.error(error);
        if (!ignore) {
          setShifts([]);
          setSelectedShiftId(null);
          setLoadError(t("attendance.failed"));
        }
      } finally {
        if (!ignore) setShiftsLoading(false);
      }
    };

    fetchShifts();
    return () => {
      ignore = true;
    };
  }, [activeBranch?.id, t]);

  useEffect(() => {
    let ignore = false;

    const fetchStaffAndAttendance = async () => {
      if (!selectedShiftId) {
        setStaff([]);
        setAttendance({});
        return;
      }

      setStaffLoading(true);
      setLoadError("");
      setMessage(null);
      try {
        const [staffResponse, attendanceResponse] = await Promise.all([
          instance.get(`/users/shift/${selectedShiftId}/`),
          instance.get("/users/attendance/recent/"),
        ]);
        if (ignore) return;

        const staffData = staffResponse.data?.staff || [];
        const records = attendanceResponse.data?.results || attendanceResponse.data || [];
        const existingAttendance = (Array.isArray(records) ? records : []).filter(
          (record) => record.shift?.id === selectedShiftId && record.date === today,
        );
        const attendanceMap = {};
        existingAttendance.forEach((record) => {
          attendanceMap[record.staff.id] = record.status;
        });

        setStaff(staffData);
        setAttendance(attendanceMap);
      } catch (error) {
        console.error(error);
        if (!ignore) {
          setStaff([]);
          setAttendance({});
          setLoadError(t("attendance.failed"));
        }
      } finally {
        if (!ignore) setStaffLoading(false);
      }
    };

    fetchStaffAndAttendance();
    return () => {
      ignore = true;
    };
  }, [activeBranch?.id, selectedShiftId, t, today]);

  const selectedShift = useMemo(
    () => shifts.find((shift) => shift.id === selectedShiftId),
    [selectedShiftId, shifts],
  );

  const counts = useMemo(() => {
    return staff.reduce(
      (summary, member) => {
        const status = attendance[member.id] || "Present";
        summary[status] = (summary[status] || 0) + 1;
        return summary;
      },
      { Present: 0, Absent: 0, Leave: 0 },
    );
  }, [attendance, staff]);

  const statusOptions = [
    {
      value: "Present",
      label: t("attendance.status.present"),
      icon: Check,
      activeClass:
        "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success-hover)]",
    },
    {
      value: "Absent",
      label: t("attendance.status.absent"),
      icon: UserRoundX,
      activeClass:
        "border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] text-[var(--theme-danger-hover)]",
    },
    {
      value: "Leave",
      label: t("attendance.status.leave"),
      icon: Clock3,
      activeClass:
        "border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] text-[var(--theme-warning-hover)]",
    },
  ];

  const handleStatusChange = (staffId, status) => {
    setAttendance((previous) => ({ ...previous, [staffId]: status }));
    setMessage(null);
  };

  const handleSave = async () => {
    if (isDemo) {
      setShowRestriction(true);
      return;
    }
    if (!selectedShiftId || !staff.length) return;

    const payload = {
      date: today,
      attendance: staff.map((member) => ({
        staff_id: member.id,
        shift_id: selectedShiftId,
        status: attendance[member.id] || "Present",
      })),
    };

    setSaving(true);
    setMessage(null);
    try {
      const response = await instance.post(
        `/users/attendance/mark/${selectedShiftId}/`,
        payload,
      );
      const successful = response.status === 200 || response.status === 201;
      setMessage({
        type: successful ? "success" : "error",
        text: successful ? t("attendance.saved") : t("attendance.failed"),
      });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: t("attendance.failed") });
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = new Date(`${today}T12:00:00`).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={`min-w-0 space-y-4 text-[var(--theme-text-primary)] ${
        isRTL ? "text-right" : "text-left"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <header className="flex flex-col gap-4 border-b border-[var(--theme-border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[rgb(var(--theme-primary-rgb)/0.18)] bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
            <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-[var(--theme-text-primary)]">{t("attendance.title")}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--theme-text-secondary)]">
              <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{formattedDate}</span>
            </p>
          </div>
        </div>
        {selectedShift && (
          <div className="flex items-center gap-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-sm shadow-sm">
            <Clock3 className="h-4 w-4 text-[var(--theme-primary)]" aria-hidden="true" />
            <span className="font-semibold text-[var(--theme-text-primary)]">
              {selectedShift.shift_type}
            </span>
            <span className="text-[var(--theme-text-muted)]">•</span>
            <span className="tabular-nums text-[var(--theme-text-secondary)]">
              {formatShiftTime(selectedShift.start_time, locale)} –{" "}
              {formatShiftTime(selectedShift.end_time, locale)}
            </span>
          </div>
        )}
      </header>

      <section aria-label={t("staff.form.select_shift")}>
        {shiftsLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)]"
              />
            ))}
          </div>
        ) : shifts.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {shifts.map((shift) => {
              const active = selectedShiftId === shift.id;
              return (
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => setSelectedShiftId(shift.id)}
                  aria-pressed={active}
                  className={`group flex min-w-0 items-center gap-3 rounded-xl border p-3 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 ${
                    active
                      ? "border-[var(--theme-primary)] bg-[var(--theme-primary-soft)] shadow-sm"
                      : "border-[var(--theme-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-border-strong)] hover:bg-[var(--theme-hover)]"
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition ${
                      active
                        ? "bg-[var(--theme-primary)] text-[var(--theme-text-inverse)]"
                        : "bg-[var(--theme-muted)] text-[var(--theme-text-muted)] group-hover:text-[var(--theme-primary)]"
                    }`}
                  >
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-[var(--theme-text-primary)]">
                      {shift.shift_type}
                    </span>
                    <span className="mt-0.5 block truncate text-xs tabular-nums text-[var(--theme-text-muted)]">
                      {formatShiftTime(shift.start_time, locale)} –{" "}
                      {formatShiftTime(shift.end_time, locale)}
                    </span>
                  </span>
                  {active && (
                    <CheckCircle2 className="ms-auto h-5 w-5 shrink-0 text-[var(--theme-primary)]" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--theme-border)] bg-[var(--theme-muted)] px-5 py-8 text-center text-sm text-[var(--theme-text-muted)]">
            <Clock3 className="mx-auto mb-2 h-6 w-6" aria-hidden="true" />
            {t("no_shifts")}
          </div>
        )}
      </section>

      {selectedShiftId && (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label={t("attendance.table.status")}>
            {[
              { label: t("assigned_staff"), value: staff.length, icon: UsersRound, tone: "primary" },
              { label: t("attendance.status.present"), value: counts.Present, icon: UserCheck, tone: "success" },
              { label: t("attendance.status.absent"), value: counts.Absent, icon: UserRoundX, tone: "danger" },
              { label: t("attendance.status.leave"), value: counts.Leave, icon: Clock3, tone: "warning" },
            ].map(({ label, value, icon: Icon, tone }) => {
              const toneClass = {
                primary: "bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]",
                success: "bg-[var(--theme-success-soft)] text-[var(--theme-success-hover)]",
                danger: "bg-[var(--theme-danger-soft)] text-[var(--theme-danger-hover)]",
                warning: "bg-[var(--theme-warning-soft)] text-[var(--theme-warning-hover)]",
              }[tone];
              return (
                <div key={label} className="theme-kpi-card flex items-center gap-3 p-3.5">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${toneClass}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[var(--theme-text-secondary)]">{label}</p>
                    <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--theme-text-primary)]">{value}</p>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="overflow-hidden rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-sm">
            <div className="flex flex-col gap-2 border-b border-[var(--theme-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-[var(--theme-text-primary)]">
                  <BriefcaseBusiness className="h-4 w-4 text-[var(--theme-primary)]" aria-hidden="true" />
                  {t("assigned_staff")}
                </h2>
                <p className="mt-0.5 text-xs text-[var(--theme-text-muted)]">
                  {selectedShift?.shift_type} {t("shift")}
                </p>
              </div>
              <span className="inline-flex w-fit items-center rounded-lg bg-[var(--theme-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--theme-text-secondary)]">
                {staff.length} {t("assigned_staff")}
              </span>
            </div>

            {staffLoading ? (
              <div className="flex min-h-56 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-[var(--theme-primary)]" aria-label={t("attendance.loading")} />
              </div>
            ) : loadError ? (
              <div className="m-4 rounded-lg border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] p-4 text-sm font-medium text-[var(--theme-danger-hover)]">
                {loadError}
              </div>
            ) : staff.length ? (
              <div className="divide-y divide-[var(--theme-border)]">
                {staff.map((member, index) => {
                  const currentStatus = attendance[member.id] || "Present";
                  return (
                    <div
                      key={member.id}
                      className="grid gap-3 px-4 py-3 transition hover:bg-[var(--theme-table-row-hover)] md:grid-cols-[2.25rem_minmax(180px,1fr)_minmax(130px,0.65fr)_minmax(310px,1.2fr)] md:items-center"
                    >
                      <span className="hidden text-center text-xs font-semibold tabular-nums text-[var(--theme-text-muted)] md:block">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex min-w-0 items-center gap-3">
                        <StaffAvatar member={member} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[var(--theme-text-primary)]">{member.name}</p>
                          <p className="truncate text-xs text-[var(--theme-text-muted)] md:hidden">{readableRole(member)}</p>
                        </div>
                      </div>
                      <p className="hidden truncate text-sm capitalize text-[var(--theme-text-secondary)] md:block">
                        {readableRole(member)}
                      </p>
                      <div className="grid grid-cols-3 gap-1.5" role="group" aria-label={`${member.name} ${t("attendance.table.status")}`}>
                        {statusOptions.map((option) => {
                          const active = currentStatus === option.value;
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleStatusChange(member.id, option.value)}
                              aria-pressed={active}
                              aria-label={option.label}
                              className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] ${
                                active
                                  ? option.activeClass
                                  : "border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text-muted)] hover:bg-[var(--theme-hover)]"
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span className="hidden sm:inline">{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-12 text-center text-sm text-[var(--theme-text-muted)]">
                <UsersRound className="mx-auto mb-2 h-7 w-7 opacity-60" aria-hidden="true" />
                {t("no_staff")}
              </div>
            )}

            <footer className="flex flex-col gap-3 border-t border-[var(--theme-border)] bg-[var(--theme-muted)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div aria-live="polite">
                {message && (
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                      message.type === "success"
                        ? "text-[var(--theme-success-hover)]"
                        : "text-[var(--theme-danger-hover)]"
                    }`}
                  >
                    {message.type === "success" && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                    {message.text}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || staffLoading || !staff.length}
                className="theme-btn theme-btn-primary min-h-10 px-4"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
                {t("attendance.save")}
              </button>
            </footer>
          </section>
        </>
      )}

      {loadError && !selectedShiftId && (
        <div className="rounded-xl border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] p-4 text-sm font-semibold text-[var(--theme-danger-hover)]">
          {loadError}
        </div>
      )}

      {showRestriction && <RestrictedToast onClose={() => setShowRestriction(false)} />}
    </div>
  );
}
