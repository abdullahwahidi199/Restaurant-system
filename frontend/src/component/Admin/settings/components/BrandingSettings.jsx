import React from "react";
import { useTranslation } from "react-i18next";
import LogoUpload from "../LogoUpload";
import { useSettings } from "../SettingsContext";
import { SettingsSaveButton, SettingsSection } from "./SettingsPrimitives";

const fields = ["logo", "cover_image"];

export default function BrandingSettings() {
  const { t } = useTranslation();
  const settings = useSettings();
  const saving = settings.savingKey === "branding";

  return (
    <SettingsSection
      title={t("settings_center.branding.title")}
      description={t("settings_center.branding.description")}
      actions={
        <SettingsSaveButton
          loading={saving}
          onClick={() =>
            settings.saveRestaurantSettings(
              "branding",
              fields,
              t("settings_center.messages.branding_saved"),
            )
          }
        >
          {saving ? t("saving") : t("save_changes")}
        </SettingsSaveButton>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <LogoUpload
            logo={settings.previewLogo}
            onChange={settings.handleLogoChange}
          />
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <LogoUpload
            logo={settings.previewCoverImage}
            onChange={settings.handleCoverImageChange}
            label={t("settings_center.branding.cover_image")}
            imageClassName="mb-2 h-48 w-full rounded-lg border border-slate-200 object-cover"
          />
        </div>
      </div>
    </SettingsSection>
  );
}
