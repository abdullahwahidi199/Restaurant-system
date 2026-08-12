import React from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../FormInput";
import { useSettings } from "../SettingsContext";
import {
  FieldGrid,
  SettingsSaveButton,
  SettingsSection,
} from "./SettingsPrimitives";

const fields = ["facebook", "instagram", "x"];

export default function SocialMediaSettings() {
  const { t } = useTranslation();
  const settings = useSettings();
  const saving = settings.savingKey === "social";

  return (
    <SettingsSection
      title={t("settings_center.social.title")}
      description={t("settings_center.social.description")}
      actions={
        <SettingsSaveButton
          loading={saving}
          onClick={() =>
            settings.saveRestaurantSettings(
              "social",
              fields,
              t("settings_center.messages.social_saved"),
            )
          }
        >
          {saving ? t("saving") : t("save_changes")}
        </SettingsSaveButton>
      }
    >
      <FieldGrid>
        <FormInput
          label={t("facebook")}
          name="facebook"
          value={settings.formData.facebook}
          onChange={settings.handleRestaurantChange}
          placeholder="https://facebook.com/..."
          className="rounded-lg"
        />
        <FormInput
          label={t("instagram")}
          name="instagram"
          value={settings.formData.instagram}
          onChange={settings.handleRestaurantChange}
          placeholder="https://instagram.com/..."
          className="rounded-lg"
        />
        <FormInput
          label={t("settings_center.fields.x_twitter")}
          name="x"
          value={settings.formData.x}
          onChange={settings.handleRestaurantChange}
          placeholder="https://x.com/..."
          className="rounded-lg"
        />
      </FieldGrid>
    </SettingsSection>
  );
}
