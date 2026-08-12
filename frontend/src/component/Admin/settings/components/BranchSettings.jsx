import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../FormInput";
import { useSettings } from "../SettingsContext";
import {
  FieldGrid,
  SettingsSaveButton,
  SettingsSection,
} from "./SettingsPrimitives";

const fields = [
  "latitude",
  "longitude",
  "opening_hours",
  "delivery_available",
  "delivery_radius_km",
  "base_delivery_fee",
  "price_per_km",
  "min_order_amount",
];

export default function BranchSettings() {
  const { t } = useTranslation();
  const settings = useSettings();
  const { ensureBranchSettings } = settings;
  const saving = settings.savingKey === "branch";

  useEffect(() => {
    ensureBranchSettings();
  }, [ensureBranchSettings]);

  return (
    <SettingsSection
      title={t("settings_center.branch.title")}
      description={t("settings_center.branch.description", {
        branch: settings.activeBranch?.name || "",
      })}
      actions={
        <SettingsSaveButton
          loading={saving}
          disabled={!settings.branchSettingsLoaded}
          onClick={() =>
            settings.saveBranchSettings(
              "branch",
              fields,
              t("settings_center.messages.branch_saved"),
            )
          }
        >
          {saving ? t("saving") : t("save_changes")}
        </SettingsSaveButton>
      }
    >
      {!settings.activeBranch ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          {t("settings_center.branch.no_active_branch")}
        </div>
      ) : settings.branchSettingsLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
              <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <FieldGrid>
            <FormInput
              label={t("settings_center.fields.branch_latitude")}
              name="latitude"
              value={settings.branchSettings.latitude ?? ""}
              onChange={settings.handleBranchSettingsChange}
              type="number"
              step="any"
              placeholder="34.5553"
              className="rounded-lg"
            />
            <FormInput
              label={t("settings_center.fields.branch_longitude")}
              name="longitude"
              value={settings.branchSettings.longitude ?? ""}
              onChange={settings.handleBranchSettingsChange}
              type="number"
              step="any"
              placeholder="69.2075"
              className="rounded-lg"
            />
            <FormInput
              label={t("opening_hours")}
              name="opening_hours"
              value={settings.branchSettings.opening_hours ?? ""}
              onChange={settings.handleBranchSettingsChange}
              className="rounded-lg"
            />
            <label className="space-y-1.5 text-sm font-medium text-slate-700">
              {t("settings_center.fields.branch_delivery")}
              <select
                name="delivery_available"
                value={
                  settings.branchSettings.delivery_available === null ||
                  settings.branchSettings.delivery_available === ""
                    ? ""
                    : String(settings.branchSettings.delivery_available)
                }
                onChange={settings.handleBranchSettingsChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">
                  {t("settings_center.fields.use_restaurant_default")}
                </option>
                <option value="true">{t("settings_center.fields.enabled")}</option>
                <option value="false">
                  {t("settings_center.fields.disabled")}
                </option>
              </select>
            </label>
          </FieldGrid>

          <FieldGrid>
            <FormInput
              label={t("settings_center.fields.delivery_radius")}
              name="delivery_radius_km"
              value={settings.branchSettings.delivery_radius_km ?? ""}
              onChange={settings.handleBranchSettingsChange}
              type="number"
              step="0.1"
              className="rounded-lg"
            />
            <FormInput
              label={t("settings_center.fields.base_delivery_fee")}
              name="base_delivery_fee"
              value={settings.branchSettings.base_delivery_fee ?? ""}
              onChange={settings.handleBranchSettingsChange}
              type="number"
              step="0.01"
              className="rounded-lg"
            />
            <FormInput
              label={t("settings_center.fields.price_per_km")}
              name="price_per_km"
              value={settings.branchSettings.price_per_km ?? ""}
              onChange={settings.handleBranchSettingsChange}
              type="number"
              step="0.01"
              className="rounded-lg"
            />
            <FormInput
              label={t("settings_center.fields.minimum_order")}
              name="min_order_amount"
              value={settings.branchSettings.min_order_amount ?? ""}
              onChange={settings.handleBranchSettingsChange}
              type="number"
              step="0.01"
              className="rounded-lg"
            />
          </FieldGrid>
        </div>
      )}
    </SettingsSection>
  );
}
