import React from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../FormInput";
import { useSettings } from "../SettingsContext";
import {
  FieldGrid,
  SettingsSaveButton,
  SettingsSection,
} from "./SettingsPrimitives";

const fields = [
  "delivery_available",
  "delivery_radius_km",
  "base_delivery_fee",
  "price_per_km",
  "min_order_amount",
];

export default function DeliverySettings() {
  const { t } = useTranslation();
  const settings = useSettings();
  const saving = settings.savingKey === "delivery";

  return (
    <SettingsSection
      title={t("settings_center.delivery.title")}
      description={t("settings_center.delivery.description")}
      actions={
        <SettingsSaveButton
          loading={saving}
          onClick={() =>
            settings.saveRestaurantSettings(
              "delivery",
              fields,
              t("settings_center.messages.delivery_saved"),
            )
          }
        >
          {saving ? t("saving") : t("save_changes")}
        </SettingsSaveButton>
      }
    >
      <FieldGrid>
        <FormInput
          label={t("settings_center.fields.delivery_radius")}
          name="delivery_radius_km"
          value={settings.formData.delivery_radius_km}
          onChange={settings.handleRestaurantChange}
          type="number"
          step="0.1"
          className="rounded-lg"
        />
        <FormInput
          label={t("settings_center.fields.base_delivery_fee")}
          name="base_delivery_fee"
          value={settings.formData.base_delivery_fee}
          onChange={settings.handleRestaurantChange}
          type="number"
          step="0.01"
          className="rounded-lg"
        />
        <FormInput
          label={t("settings_center.fields.price_per_km")}
          name="price_per_km"
          value={settings.formData.price_per_km}
          onChange={settings.handleRestaurantChange}
          type="number"
          step="0.01"
          className="rounded-lg"
        />
        <FormInput
          label={t("settings_center.fields.minimum_order")}
          name="min_order_amount"
          value={settings.formData.min_order_amount}
          onChange={settings.handleRestaurantChange}
          type="number"
          step="0.01"
          className="rounded-lg"
        />
      </FieldGrid>

      <label className="mt-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          id="delivery_available"
          name="delivery_available"
          checked={Boolean(settings.formData.delivery_available)}
          onChange={settings.handleRestaurantChange}
          className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
        />
        {t("delivery_available")}
      </label>
    </SettingsSection>
  );
}
