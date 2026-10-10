import { useContext, useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  Check,
  Loader2,
  Minus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  UserCheck,
  UserRoundX,
  UsersRound,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";
import StaffAvatar from "./StaffAvatar";

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthDates(date = new Date()) {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const month = String(monthIndex + 1).padStart(2, "0");

  return Array.from({ length: lastDay }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
}

function AttendanceMark({ status, labels }) {
  if (status === "Present") {
    return (
      <span
        className="mx-auto grid h-7 w-7 place-items-center rounded-lg bg-[var(--theme-success-soft)] text-[var(--theme-success-hover)]"
        title={labels.present}
        aria-label={labels.present}
      >
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    );
  }

  if (status === "Absent") {
    return (
      <span
        className="mx-auto grid h-7 w-7 place-items-center rounded-lg bg-[var(--theme-danger-soft)] text-[var(--theme-danger-hover)]"
        title={labels.absent}
        aria-label={labels.absent}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    );
  }

  if (status === "Leave") {
    return (
      <span
        className="mx-auto grid h-7 w-7 place-items-center rounded-lg bg-[var(--theme-warning-soft)] text-[var(--theme-warning-hover)]"
        title={labels.leave}
        aria-label={labels.leave}
      >
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    );
  }

  return <span className="mx-auto block h-1 w-1 rounded-full bg-[var(--theme-border-strong)]" aria-hidden="true" />;
}

export default function AttendanceTable() {
  const { t, i18n } = useTranslation();
  const { activeBranch } = useContext(AuthContext);
  const locale = i18n.resolvedLanguage || i18n.language;
  const isRTL = i18n.dir() === "rtl";

  const [attendanceData, setAttendanceData] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterShift, setFilterShift] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchAttendance = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await instance.get("/users/attendance/recent/");
        const data = response.data?.results || response.data || [];
        if (!ignore) setAttendanceData(Array.isArray(data) ? data : []);
      } catch (requestError) {
        console.error("Failed to fetch attendance", requestError);
        if (!ignore) {
          setAttendanceData([]);
          setError(t("attendance.failed"));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchAttendance();
    return () => {
      ignore = true;
    };
  }, [activeBranch?.id, t]);

  const now = new Date();
  const monthDates = useMemo(() => getMonthDates(now), []);
  const todayKey = getLocalDateKey(now);
  const monthPrefix = todayKey.slice(0, 7);

  const monthlyRecords = useMemo(
    () => attendanceData.filter((record) => String(record.date || "").startsWith(monthPrefix)),
    [attendanceData, monthPrefix],
  );

  const shiftOptions = useMemo(() => {
    return [
      ...new Map(
        monthlyRecords
          .filter((record) => record.shift?.id)
          .map((record) => [record.shift.id, record.shift]),
      ).values(),
    ];
  }, [monthlyRecords]);

  const filteredRecords = useMemo(() => {
    const nameQuery = filterName.trim().toLowerCase();
    return monthlyRecords.filter((record) => {
      const matchesName =
        !nameQuery || String(record.staff?.name || "").toLowerCase().includes(nameQuery);
      const matchesShift =
        !filterShift || String(record.shift?.id) === String(filterShift);
      return matchesName && matchesShift;
    });
  }, [filterName, filterShift, monthlyRecords]);

  const uniqueStaff = useMemo(
    () => [
      ...new Map(
        filteredRecords
          .filter((record) => record.staff?.id)
          .map((record) => [record.staff.id, record.staff]),
      ).values(),
    ],
    [filteredRecords],
  );

  const recordMap = useMemo(
    () =>
      new Map(
        filteredRecords.map((record) => [
          `${record.staff?.id}:${record.date}`,
          record,
        ]),
      ),
    [filteredRecords],
  );

  const staffRates = useMemo(() => {
    const totals = new Map();
    filteredRecords.forEach((record) => {
      const current = totals.get(record.staff?.id) || { present: 0, total: 0 };
      if (record.status === "Present") current.present += 1;
      if (["Present", "Absent", "Leave"].includes(record.status)) current.total += 1;
      totals.set(record.staff?.id, current);
    });
    return totals;
  }, [filteredRecords]);

  const summary = useMemo(() => {
    const counts = filteredRecords.reduce(
      (result, record) => {
        if (record.status in result) result[record.status] += 1;
        return result;
      },
      { Present: 0, Absent: 0, Leave: 0 },
    );
    const tracked = counts.Present + counts.Absent + counts.Leave;
    return {
      ...counts,
      rate: tracked ? Math.round((counts.Present / tracked) * 100) : 0,
    };
  }, [filteredRecords]);

  const monthLabel = now.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  const labels = {
    present: t("attendance.status.present"),
    absent: t("attendance.status.absent"),
    leave: t("attendance.status.leave"),
  };

  return (
    <section
      className="overflow-hidden rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-sm"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="border-b border-[var(--theme-border)] px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
              <CalendarRange className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-[var(--theme-text-primary)]">{t("monthly_attendance")}</h2>
              <p className="mt-0.5 text-xs font-medium text-[var(--theme-text-muted)]">
                {monthLabel}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: labels.present, value: summary.Present, icon: UserCheck, tone: "success" },
              { label: labels.absent, value: summary.Absent, icon: UserRoundX, tone: "danger" },
              { label: labels.leave, value: summary.Leave, icon: Minus, tone: "warning" },
              { label: "%", value: `${summary.rate}%`, icon: TrendingUp, tone: "primary" },
            ].map(({ label, value, icon: Icon, tone }) => {
              const toneClass = {
                primary: "bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]",
                success: "bg-[var(--theme-success-soft)] text-[var(--theme-success-hover)]",
                danger: "bg-[var(--theme-danger-soft)] text-[var(--theme-danger-hover)]",
                warning: "bg-[var(--theme-warning-soft)] text-[var(--theme-warning-hover)]",
              }[tone];

              return (
                <div
                  key={label}
                  className="flex min-w-[112px] items-center gap-2 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-muted)] px-2.5 py-2"
                >
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${toneClass}`}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold text-[var(--theme-text-muted)]">
                      {label}
                    </p>
                    <p className="text-sm font-bold tabular-nums text-[var(--theme-text-primary)]">
                      {value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-[var(--theme-border)] bg-[var(--theme-muted)] p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-text-muted)]" aria-hidden="true" />
          <input
            type="search"
            placeholder={t("filter_name")}
            value={filterName}
            onChange={(event) => setFilterName(event.target.value)}
            className="theme-input w-full ps-9 pe-9"
          />
          {filterName && (
            <button
              type="button"
              onClick={() => setFilterName("")}
              className="absolute end-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-[var(--theme-text-muted)] hover:bg-[var(--theme-hover)]"
              aria-label={t("staff.cancel")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="relative min-w-0 sm:w-56">
          <SlidersHorizontal className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-text-muted)]" aria-hidden="true" />
          <select
            value={filterShift}
            onChange={(event) => setFilterShift(event.target.value)}
            className="theme-select w-full ps-9 pe-8"
            aria-label={t("filter_shift")}
          >
            <option value="">{t("filter_shift")}</option>
            {shiftOptions.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.shift_type}
              </option>
            ))}
          </select>
        </div>
        <div className="ms-auto flex items-center gap-3 text-xs font-semibold text-[var(--theme-text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[var(--theme-success)]" />
            {labels.present}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[var(--theme-danger)]" />
            {labels.absent}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[var(--theme-warning)]" />
            {labels.leave}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[var(--theme-primary)]" aria-label={t("attendance.loading")} />
        </div>
      ) : error ? (
        <div className="m-4 rounded-lg border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] p-4 text-center text-sm font-semibold text-[var(--theme-danger-hover)]">
          {error}
        </div>
      ) : uniqueStaff.length ? (
        <div className="max-h-[520px] overflow-auto">
          <table className="min-w-max border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky start-0 z-30 min-w-52 border-b border-e border-[var(--theme-border)] bg-[var(--theme-table-header)] text-start">
                  <span className="inline-flex items-center gap-2">
                    <UsersRound className="h-3.5 w-3.5 text-[var(--theme-primary)]" aria-hidden="true" />
                    {t("staff_name")}
                  </span>
                </th>
                {monthDates.map((date) => {
                  const dateValue = new Date(`${date}T12:00:00`);
                  const isToday = date === todayKey;
                  return (
                    <th
                      key={date}
                      className={`w-11 min-w-11 border-b border-e border-[var(--theme-border)] px-1 text-center ${
                        isToday
                          ? "bg-[var(--theme-primary-soft)] text-[var(--theme-primary-hover)]"
                          : "bg-[var(--theme-table-header)]"
                      }`}
                    >
                      <span className="block text-[9px] font-bold uppercase leading-none opacity-70">
                        {dateValue.toLocaleDateString(locale, { weekday: "narrow" })}
                      </span>
                      <span className="mt-1 block text-xs font-bold leading-none">
                        {new Intl.NumberFormat(locale).format(dateValue.getDate())}
                      </span>
                    </th>
                  );
                })}
                <th className="sticky end-0 z-30 min-w-20 border-b border-s border-[var(--theme-border)] bg-[var(--theme-table-header)] text-center">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {uniqueStaff.map((staff) => {
                const totals = staffRates.get(staff.id) || { present: 0, total: 0 };
                const rate = totals.total ? Math.round((totals.present / totals.total) * 100) : 0;
                return (
                  <tr key={staff.id} className="group">
                    <td className="sticky start-0 z-10 border-b border-e border-[var(--theme-border)] bg-[var(--theme-surface)] group-hover:bg-[var(--theme-table-row-hover)]">
                      <div className="flex min-w-0 items-center gap-2">
                        <StaffAvatar member={staff} size="sm" />
                        <div className="min-w-0">
                          <p className="max-w-36 truncate font-semibold text-[var(--theme-text-primary)]">
                            {staff.name}
                          </p>
                          <p className="max-w-36 truncate text-[10px] capitalize text-[var(--theme-text-muted)]">
                            {String(staff.custom_role || staff.role || "").replaceAll("_", " ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    {monthDates.map((date) => {
                      const record = recordMap.get(`${staff.id}:${date}`);
                      const isToday = date === todayKey;
                      return (
                        <td
                          key={date}
                          className={`w-11 min-w-11 border-b border-e border-[var(--theme-border)] px-1 text-center ${
                            isToday ? "bg-[rgb(var(--theme-primary-rgb)/0.045)]" : ""
                          }`}
                        >
                          <AttendanceMark status={record?.status} labels={labels} />
                        </td>
                      );
                    })}
                    <td className="sticky end-0 z-10 border-b border-s border-[var(--theme-border)] bg-[var(--theme-surface)] text-center group-hover:bg-[var(--theme-table-row-hover)]">
                      <span
                        className={`inline-flex min-w-12 justify-center rounded-lg px-2 py-1 text-xs font-bold tabular-nums ${
                          rate >= 80
                            ? "bg-[var(--theme-success-soft)] text-[var(--theme-success-hover)]"
                            : rate >= 60
                              ? "bg-[var(--theme-warning-soft)] text-[var(--theme-warning-hover)]"
                              : "bg-[var(--theme-danger-soft)] text-[var(--theme-danger-hover)]"
                        }`}
                      >
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-14 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[var(--theme-muted)] text-[var(--theme-text-muted)]">
            <CalendarRange className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-semibold text-[var(--theme-text-primary)]">
            {t("monthly_attendance")}
          </p>
          <p className="mt-1 text-xs text-[var(--theme-text-muted)]">{t("no_staff")}</p>
        </div>
      )}
    </section>
  );
}
