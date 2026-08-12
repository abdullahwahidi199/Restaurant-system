import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Copy,
  Download,
  ExternalLink,
  Link as LinkIcon,
  QrCode,
} from "lucide-react";
import { getMediaUrl } from "../../../../api/publicOrdering";
import { useSettings } from "../SettingsContext";
import { SettingsSection } from "./SettingsPrimitives";

export default function PublicLinksSettings() {
  const { t } = useTranslation();
  const settings = useSettings();
  const { fetchBranchOverview } = settings;

  useEffect(() => {
    fetchBranchOverview();
  }, [fetchBranchOverview]);

  return (
    <SettingsSection
      title={t("settings_center.public_links.title")}
      description={t("settings_center.public_links.description")}
    >
      <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <LinkIcon className="h-4 w-4" />
            {t("settings_center.public_links.brand_url")}
          </div>
          <p className="break-all text-sm text-slate-600">
            {settings.brandUrl}
          </p>
          <div className="mt-5 flex h-44 items-center justify-center rounded-lg border border-slate-200 bg-white">
            {settings.qrCode ? (
              <img
                src={settings.qrCode}
                alt={t("settings_center.public_links.brand_qr_alt")}
                className="h-40 w-40 object-contain p-2"
              />
            ) : (
              <QrCode className="h-12 w-12 text-slate-300" />
            )}
          </div>
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => settings.copyLink(settings.brandUrl)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Copy className="h-4 w-4" />
              {t("settings_center.actions.copy_brand_link")}
            </button>
            <a
              href={settings.brandUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <ExternalLink className="h-4 w-4" />
              {t("settings_center.actions.open_website")}
            </a>
            <button
              type="button"
              onClick={() =>
                settings.downloadQR(
                  settings.qrCode,
                  `${settings.restaurant?.slug || "restaurant"}_brand_qr.png`,
                )
              }
              disabled={!settings.qrCode}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              {t("settings_center.actions.download_brand_qr")}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-900">
              {t("settings_center.public_links.branch_overview")}
            </h3>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
              {t("settings_center.public_links.branch_count", {
                count: settings.branchOverview.length,
              })}
            </span>
          </div>

          {settings.branchOverviewLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-lg bg-white"
                />
              ))}
            </div>
          ) : settings.branchOverview.length ? (
            <div className="grid gap-3">
              {settings.branchOverview.map((branch) => {
                const branchQr = getMediaUrl(branch.qr_code);
                return (
                  <div
                    key={branch.id}
                    className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[64px_1fr]"
                  >
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      {branchQr ? (
                        <img
                          src={branchQr}
                          alt={t("settings_center.public_links.branch_qr_alt", {
                            branch: branch.name,
                          })}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <QrCode className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-slate-900">
                          {branch.name}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            branch.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {branch.is_active
                            ? t("settings_center.fields.active")
                            : t("settings_center.fields.inactive")}
                        </span>
                      </div>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        {branch.public_url}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => settings.copyLink(branch.public_url)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {t("settings_center.actions.copy_link")}
                        </button>
                        <a
                          href={branch.public_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {t("settings_center.actions.open_menu")}
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            settings.downloadQR(
                              branchQr,
                              `${branch.slug || branch.code}_menu_qr.png`,
                            )
                          }
                          disabled={!branchQr}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {t("settings_center.actions.download_qr")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              {t("settings_center.public_links.no_branches")}
            </div>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}
