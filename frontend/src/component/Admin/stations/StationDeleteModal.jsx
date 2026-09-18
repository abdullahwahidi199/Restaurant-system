import React, { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function StationDeleteModal({
  open,
  closeModal,
  onConfirmDelete,
  station,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !station) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");
      await onConfirmDelete(station.id);
      closeModal();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to delete station.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--theme-text-primary)]">
                {t("legacy.delete_kitchen_station_84224032")}
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)]">
                {t("legacy.confirmation_required_416b7875")}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="rounded-lg p-1.5 text-[var(--theme-text-muted)] hover:bg-[var(--theme-hover)] hover:text-[var(--theme-text-primary)] transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-3 text-sm text-[var(--theme-text-secondary)]">
          <p>
            {t("legacy.are_you_sure_you_want_to_delete_the_station_12153580")}{" "}
            <strong className="text-[var(--theme-text-primary)]">
              "{station.name}"
            </strong>
            ?
          </p>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
            <p className="font-bold">{t("legacy.automatic_routing_fallback_b90ae113")}</p>
            <p>
              {t("legacy.any_menu_items_or_platters_assigned_to_this_station_wi_5bd9db39")}{" "}
              <strong>{t("landing.showcase.kitchen.items.mainKitchen")}</strong> {t("legacy.station_so_orders_are_not_lost_e59824e4")}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-[var(--theme-border)] pt-4">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-hover)] text-[var(--theme-text-primary)] font-medium text-sm transition"
          >
            {t("staff.cancel")}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || station.is_default}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {loading ? t("legacy.deleting_e16cac65") : t("legacy.delete_station_a59e5f4f")}
          </button>
        </div>
      </div>
    </div>
  );
}
