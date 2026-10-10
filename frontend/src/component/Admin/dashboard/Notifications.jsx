import { useCallback, useEffect, useState } from "react";
import { Bell, Check, Clock3 } from "lucide-react";
import instance from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";

export default function Notifications({ limit = 4 }) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await instance.get("/reports/notifications/");
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markReadNotification = async (id) => {
    try {
      await instance.post(`/reports/notifications/${id}/read/`);
      setNotifications((items) => items.filter((item) => item.id !== id));
    } catch {
      // Keep the notification visible when the server could not update it.
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold theme-text-primary">
            {t("notifications.title")}
          </h3>
          <p className="mt-0.5 text-[11px] theme-text-muted">
            {t("dashboard.recent_activity", { defaultValue: "Recent activity" })}
          </p>
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--theme-info-soft)] text-[var(--theme-info)]">
          <Bell className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      {loading ? (
        <div className="space-y-2" aria-label={t("dashboard.loading")}>
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-12 animate-pulse rounded-lg bg-[var(--theme-muted)]" />
          ))}
        </div>
      ) : notifications.length ? (
        <ul className="space-y-1">
          {notifications.slice(0, limit).map((note, index) => (
            <li
              key={note.id}
              className="group flex gap-2.5 border-b border-[var(--theme-border)] py-2.5 last:border-b-0"
            >
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                style={{
                  background:
                    index % 3 === 0
                      ? "var(--theme-info)"
                      : index % 3 === 1
                        ? "var(--theme-success)"
                        : "var(--theme-warning)",
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[11px] leading-4 theme-text-secondary">
                  {note.type && (
                    <span className="font-semibold theme-text-primary">{note.type}: </span>
                  )}
                  {note.message}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[10px] theme-text-muted">
                  <Clock3 className="h-3 w-3" aria-hidden="true" />
                  {new Date(note.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => markReadNotification(note.id)}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[var(--theme-primary)] opacity-70 transition hover:bg-[var(--theme-primary-soft)] hover:opacity-100"
                title={t("notifications.markRead")}
                aria-label={t("notifications.markRead")}
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid min-h-28 place-items-center rounded-lg bg-[var(--theme-muted)] px-3 text-center">
          <div>
            <Check className="mx-auto h-6 w-6 text-[var(--theme-success)]" aria-hidden="true" />
            <p className="mt-1.5 text-[11px] theme-text-muted">{t("notifications.empty")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
