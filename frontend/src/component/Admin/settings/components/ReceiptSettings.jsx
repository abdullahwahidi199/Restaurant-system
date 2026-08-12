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
  "receipt_header",
  "receipt_footer",
  "receipt_template",
  "kitchen_printer",
  "tax_rate",
  "service_charge_rate",
  "cash_drawer_enabled",
  "cash_drawer_name",
];

export default function ReceiptSettings() {
  const { t } = useTranslation();
  const settings = useSettings();
  const { ensureBranchSettings } = settings;
  const saving = settings.savingKey === "receipt";

  useEffect(() => {
    ensureBranchSettings();
  }, [ensureBranchSettings]);

  return (
    <SettingsSection
      title={t("settings_center.receipt.title")}
      description={t("settings_center.receipt.description")}
      actions={
        <SettingsSaveButton
          loading={saving}
          disabled={!settings.branchSettingsLoaded}
          onClick={() =>
            settings.saveBranchSettings(
              "receipt",
              fields,
              t("settings_center.messages.receipt_saved"),
            )
          }
        >
          {saving ? t("saving") : t("save_changes")}
        </SettingsSaveButton>
      }
    >
      {settings.branchSettingsLoading ? (
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
            label={t("settings_center.fields.receipt_header")}
            name="receipt_header"
            value={settings.branchSettings.receipt_header ?? ""}
            onChange={settings.handleBranchSettingsChange}
            className="rounded-lg"
          />
          <FormInput
            label={t("settings_center.fields.kitchen_printer")}
            name="kitchen_printer"
            value={settings.branchSettings.kitchen_printer ?? ""}
            onChange={settings.handleBranchSettingsChange}
            className="rounded-lg"
          />
          <FormInput
            label={t("settings_center.fields.tax_rate")}
            name="tax_rate"
            value={settings.branchSettings.tax_rate ?? ""}
            onChange={settings.handleBranchSettingsChange}
            type="number"
            step="0.001"
            className="rounded-lg"
          />
          <FormInput
            label={t("settings_center.fields.service_charge")}
            name="service_charge_rate"
            value={settings.branchSettings.service_charge_rate ?? ""}
            onChange={settings.handleBranchSettingsChange}
            type="number"
            step="0.001"
            className="rounded-lg"
          />
          <FormInput
            label={t("settings_center.fields.cash_drawer_name")}
            name="cash_drawer_name"
            value={settings.branchSettings.cash_drawer_name ?? ""}
            onChange={settings.handleBranchSettingsChange}
            className="rounded-lg"
          />
          <label className="flex items-center gap-3 self-end rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input
              name="cash_drawer_enabled"
              type="checkbox"
              checked={Boolean(settings.branchSettings.cash_drawer_enabled)}
              onChange={settings.handleBranchSettingsChange}
              className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            {t("settings_center.fields.cash_drawer_enabled")}
          </label>
        </FieldGrid>

        <FieldGrid>
          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            {t("settings_center.fields.receipt_footer")}
            <textarea
              name="receipt_footer"
              value={settings.branchSettings.receipt_footer ?? ""}
              onChange={settings.handleBranchSettingsChange}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            {t("settings_center.fields.receipt_template")}
            <textarea
              name="receipt_template"
              value={settings.branchSettings.receipt_template ?? ""}
              onChange={settings.handleBranchSettingsChange}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </FieldGrid>
      </div>
      )}
    </SettingsSection>
  );
}
