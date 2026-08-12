import React from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../FormInput";
import { useSettings } from "../SettingsContext";
import {
  FieldGrid,
  SettingsSaveButton,
  SettingsSection,
} from "./SettingsPrimitives";

const fields = ["latitude", "longitude"];

export default function LocationSettings() {
  const { t } = useTranslation();
  const settings = useSettings();
  const saving = settings.savingKey === "location";

  return (
    <SettingsSection
      title={t("settings_center.location.title")}
      description={t("settings_center.location.description")}
      actions={
        <SettingsSaveButton
          loading={saving}
          onClick={() =>
            settings.saveRestaurantSettings(
              "location",
              fields,
              t("settings_center.messages.location_saved"),
            )
          }
        >
          {saving ? t("saving") : t("save_changes")}
        </SettingsSaveButton>
      }
    >
      <FieldGrid>
        <FormInput
          label={t("settings_center.fields.latitude")}
          name="latitude"
          value={settings.formData.latitude}
          onChange={settings.handleRestaurantChange}
          type="number"
          step="any"
          placeholder="33.9391"
          className="rounded-lg"
        />
        <FormInput
          label={t("settings_center.fields.longitude")}
          name="longitude"
          value={settings.formData.longitude}
          onChange={settings.handleRestaurantChange}
          type="number"
          step="any"
          placeholder="67.7097"
          className="rounded-lg"
        />
      </FieldGrid>
    </SettingsSection>
  );
}
