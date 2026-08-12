import React from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../FormInput";
import { useSettings } from "../SettingsContext";
import {
  FieldGrid,
  SettingsSaveButton,
  SettingsSection,
} from "./SettingsPrimitives";

const fields = ["manager_discount_limit", "admin_discount_limit"];

export default function DiscountSettings() {
  const { t } = useTranslation();
  const settings = useSettings();
  const saving = settings.savingKey === "discounts";

  return (
    <SettingsSection
      title={t("settings_center.discounts.title")}
      description={t("settings_center.discounts.description")}
      actions={
        <SettingsSaveButton
          loading={saving}
          onClick={() =>
            settings.saveRestaurantSettings(
              "discounts",
              fields,
              t("settings_center.messages.discounts_saved"),
            )
          }
        >
          {saving ? t("saving") : t("save_changes")}
        </SettingsSaveButton>
      }
    >
      <FieldGrid>
        <FormInput
          label={t("settings_center.fields.manager_discount_limit")}
          name="manager_discount_limit"
          value={settings.formData.manager_discount_limit}
          onChange={settings.handleRestaurantChange}
          type="number"
          step="0.01"
          placeholder="10"
          className="rounded-lg"
        />
        <FormInput
          label={t("settings_center.fields.admin_discount_limit")}
          name="admin_discount_limit"
          value={settings.formData.admin_discount_limit}
          onChange={settings.handleRestaurantChange}
          type="number"
          step="0.01"
          placeholder="100"
          className="rounded-lg"
        />
      </FieldGrid>
      <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {t("settings_center.discounts.helper")}
      </p>
    </SettingsSection>
  );
}
