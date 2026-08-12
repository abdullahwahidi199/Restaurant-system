import React from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../FormInput";
import { useSettings } from "../SettingsContext";
import {
  FieldGrid,
  SettingsSaveButton,
  SettingsSection,
} from "./SettingsPrimitives";

const fields = ["name", "slogan", "phone", "email", "website", "address"];

export default function GeneralSettings() {
  const { t } = useTranslation();
  const settings = useSettings();
  const saving = settings.savingKey === "general";

  return (
    <SettingsSection
      title={t("settings_center.general.title")}
      description={t("settings_center.general.description")}
      actions={
        <SettingsSaveButton
          loading={saving}
          onClick={() =>
            settings.saveRestaurantSettings(
              "general",
              fields,
              t("settings_center.messages.general_saved"),
            )
          }
        >
          {saving ? t("saving") : t("save_changes")}
        </SettingsSaveButton>
      }
    >
      <FieldGrid>
        <FormInput
          label={t("name")}
          name="name"
          value={settings.formData.name}
          onChange={settings.handleRestaurantChange}
          required
          className="rounded-lg"
        />
        <FormInput
          label={t("slogan")}
          name="slogan"
          value={settings.formData.slogan}
          onChange={settings.handleRestaurantChange}
          className="rounded-lg"
        />
        <FormInput
          label={t("phone")}
          name="phone"
          value={settings.formData.phone}
          onChange={settings.handleRestaurantChange}
          type="tel"
          className="rounded-lg"
        />
        <FormInput
          label={t("email")}
          name="email"
          value={settings.formData.email}
          onChange={settings.handleRestaurantChange}
          type="email"
          className="rounded-lg"
        />
        <FormInput
          label={t("website")}
          name="website"
          value={settings.formData.website}
          onChange={settings.handleRestaurantChange}
          placeholder="https://example.com"
          className="rounded-lg"
        />
        <FormInput
          label={t("address")}
          name="address"
          value={settings.formData.address}
          onChange={settings.handleRestaurantChange}
          required
          className="rounded-lg"
        />
      </FieldGrid>
    </SettingsSection>
  );
}
