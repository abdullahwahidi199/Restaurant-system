import React from "react";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import RestrictedToast from "../../RistrictedAction";
import SettingsSidebar from "./SettingsSidebar";
import {
  SettingsErrorState,
  SettingsLoadingState,
} from "./components/SettingsPrimitives";

export default function RestaurantSettingsLayout({
  settings,
  sections,
  activeSection,
  children,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  if (settings.initialLoading) {
    return (
      <SettingsLoadingState label={t("settings_center.loading_settings")} />
    );
  }

  if (!settings.restaurant) {
    return (
      <SettingsErrorState
        title={t("restaurant_not_found")}
        message={settings.error || t("settings_center.messages.load_failed")}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Toaster position="bottom-center" />
      <header className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {settings.branchOnly
              ? t("settings_center.header.branch_eyebrow")
              : t("settings_center.header.eyebrow")}
          </p>
          <h1 className="text-2xl font-bold text-slate-950">
            {settings.branchOnly
              ? t("settings_center.header.branch_title")
              : t("settings_center.header.title")}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-500">
            {settings.branchOnly
              ? t("settings_center.header.branch_description", {
                  branch: settings.activeBranch?.name || "",
                })
              : t("settings_center.header.description")}
          </p>
        </div>
      </header>

      {settings.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {settings.error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <SettingsSidebar
          sections={sections}
          activeSection={activeSection}
        />
        <main className="min-w-0 space-y-5">{children}</main>
      </div>

      {settings.showRestriction && (
        <RestrictedToast
          actionType="update"
          onClose={() => settings.setShowRestriction(false)}
        />
      )}
    </div>
  );
}
