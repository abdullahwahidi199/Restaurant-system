import React, { useState, useEffect } from "react";
import { X, Utensils, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function StationFormModal({
  open,
  closeModal,
  onSave,
  editingStation,
  branches = [],
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  const [formData, setFormData] = useState({
    name: "",
    name_dari: "",
    name_pashto: "",
    description: "",
    branch: "",
    is_default: false,
    is_active: true,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingStation) {
      setFormData({
        name: editingStation.name || "",
        name_dari: editingStation.name_dari || "",
        name_pashto: editingStation.name_pashto || "",
        description: editingStation.description || "",
        branch: editingStation.branch || "",
        is_default: editingStation.is_default || false,
        is_active: editingStation.is_active !== false,
      });
    } else {
      setFormData({
        name: "",
        name_dari: "",
        name_pashto: "",
        description: "",
        branch: "",
        is_default: false,
        is_active: true,
      });
    }
    setError("");
  }, [editingStation, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError(t("legacy.station_name_is_required_8bc791a9"));
      return;
    }

    try {
      setLoading(true);
      setError("");
      const payload = {
        name: formData.name.trim(),
        name_dari: formData.name_dari.trim() || null,
        name_pashto: formData.name_pashto.trim() || null,
        description: formData.description.trim() || null,
        branch: formData.branch ? Number(formData.branch) : null,
        is_default: formData.is_default,
        is_active: formData.is_active,
      };

      await onSave(payload, editingStation?.id);
      closeModal();
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.name?.[0] ||
          "Failed to save station.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[var(--theme-border)] pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
              <Utensils className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--theme-text-primary)]">
              {editingStation ? t("legacy.edit_kitchen_station_cc163df3") : t("legacy.create_new_station_ecd5e292")}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg p-2 text-[var(--theme-text-muted)] hover:bg-[var(--theme-hover)] hover:text-[var(--theme-text-primary)] transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Station Name (English) */}
          <div>
            <label className="block text-sm font-semibold text-[var(--theme-text-primary)] mb-1">
              {t("legacy.station_name_english_b05d5343")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder={t("legacy.e_g_juice_bar_dessert_station_grill_8f3e3481")}
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--theme-input-border)] bg-[var(--theme-input-bg)] px-3.5 py-2.5 text-[var(--theme-text-primary)] focus:border-[var(--theme-input-focus)] focus:ring-2 focus:ring-[var(--theme-input-ring)] outline-none transition"
              required
            />
          </div>

          {/* Station Name (Dari) */}
          <div>
            <label className="block text-sm font-semibold text-[var(--theme-text-primary)] mb-1">
              نام استیشن (دری)
            </label>
            <input
              type="text"
              name="name_dari"
              placeholder="مثلاً: بخش آبمیوه، آشپزخانه عمومی"
              value={formData.name_dari}
              onChange={handleChange}
              dir="rtl"
              className="w-full rounded-lg border border-[var(--theme-input-border)] bg-[var(--theme-input-bg)] px-3.5 py-2.5 text-[var(--theme-text-primary)] focus:border-[var(--theme-input-focus)] focus:ring-2 focus:ring-[var(--theme-input-ring)] outline-none transition"
            />
          </div>

          {/* Station Name (Pashto) */}
          <div>
            <label className="block text-sm font-semibold text-[var(--theme-text-primary)] mb-1">
              د سټېشن نوم (پښتو)
            </label>
            <input
              type="text"
              name="name_pashto"
              placeholder="مثلاً: د شربتونو برخه، عمومي پخلنځی"
              value={formData.name_pashto}
              onChange={handleChange}
              dir="rtl"
              className="w-full rounded-lg border border-[var(--theme-input-border)] bg-[var(--theme-input-bg)] px-3.5 py-2.5 text-[var(--theme-text-primary)] focus:border-[var(--theme-input-focus)] focus:ring-2 focus:ring-[var(--theme-input-ring)] outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[var(--theme-text-primary)] mb-1">
              {t("legacy.description_notes_60cdf079")}
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder={t("legacy.optional_notes_about_what_is_prepared_here_1ed9ef1f")}
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--theme-input-border)] bg-[var(--theme-input-bg)] px-3.5 py-2 text-sm text-[var(--theme-text-primary)] focus:border-[var(--theme-input-focus)] focus:ring-2 focus:ring-[var(--theme-input-ring)] outline-none transition"
            />
          </div>

          {/* Branch Override (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-[var(--theme-text-primary)] mb-1">
              {t("legacy.assigned_branch_fa5d2147")}
            </label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--theme-input-border)] bg-[var(--theme-input-bg)] px-3.5 py-2.5 text-sm text-[var(--theme-text-primary)] focus:border-[var(--theme-input-focus)] focus:ring-2 focus:ring-[var(--theme-input-ring)] outline-none transition"
            >
              <option value="">{t("legacy.all_branches_restaurant_wide_c52b353b")}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1">
              {t("legacy.leave_blank_if_this_station_is_available_across_all_br_ce426d99")}
            </p>
          </div>

          {/* Toggles: is_default & is_active */}
          <div className="space-y-3 pt-2 border-t border-[var(--theme-border)]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_default"
                checked={formData.is_default}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-[var(--theme-border-strong)] text-[var(--theme-primary)] focus:ring-[var(--theme-input-ring)]"
              />
              <div>
                <span className="block text-sm font-semibold text-[var(--theme-text-primary)]">
                  {t("legacy.default_station_main_kitchen_05a7da5e")}
                </span>
                <span className="block text-xs text-[var(--theme-text-secondary)]">
                  {t("legacy.new_menu_items_and_platters_without_an_assigned_statio_a0ca7a20")}
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-[var(--theme-border-strong)] text-[var(--theme-primary)] focus:ring-[var(--theme-input-ring)]"
              />
              <div>
                <span className="block text-sm font-semibold text-[var(--theme-text-primary)]">
                  {t("legacy.active_station_c671415f")}
                </span>
                <span className="block text-xs text-[var(--theme-text-secondary)]">
                  {t("legacy.inactive_stations_cannot_be_selected_for_new_items_or__1224cbcb")}
                </span>
              </div>
            </label>
          </div>

          {formData.is_default && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--theme-primary-subtle)] border border-[var(--theme-primary-soft)] text-xs text-[var(--theme-primary)]">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>
                {t("legacy.setting_this_as_default_will_unmark_any_previously_sel_a15a5405")}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--theme-border)]">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-hover)] text-[var(--theme-text-primary)] font-medium text-sm transition"
            >
              {t("staff.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-text-inverse)] font-bold text-sm shadow-sm transition disabled:opacity-50"
            >
              {loading
                ? t("saving")
                : editingStation
                  ? t("legacy.update_station_4b816b2f")
                  : t("legacy.create_station_f70532c4")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
