import { Download, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAndroidRelease } from "./useAndroidRelease";

export default function DownloadAppButton({ className = "", onClick, direct = false }) {
  const { t } = useTranslation();
  const { data: release } = useAndroidRelease();
  const content = <>
    <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
    <span>{t("landing.marketplace.appDownload.button")}</span>
  </>;
  if (direct && !release) {
    return <button className={`marketplace-app-download ${className}`} type="button" disabled>
      {content}
    </button>;
  }
  return <a
    href={release?.url || "#download-app"}
    download={release?.filename}
    className={`marketplace-app-download ${className}`}
    aria-label={t("landing.marketplace.appDownload.androidLabel")}
    onClick={onClick}
  >{content}</a>;
}

export function AppDownloadDetails() {
  const { t } = useTranslation();
  const { data: release, isPending, refetch } = useAndroidRelease();
  return <div id="download-app" className="marketplace-app-download-panel">
    <div className="marketplace-app-download-copy">
      <Smartphone className="h-5 w-5 shrink-0 text-orange-600" aria-hidden="true" />
      <div>
        <strong>{t("landing.marketplace.appDownload.title")}</strong>
        <small>{release
          ? t("landing.marketplace.appDownload.release", {
              version: release.version,
              size: (release.sizeBytes / 1024 / 1024).toFixed(1),
            })
          : t(isPending ? "landing.marketplace.appDownload.loading" : "landing.marketplace.appDownload.unavailable")}
        </small>
      </div>
    </div>
    <DownloadAppButton direct />
    <small className="marketplace-app-install-help">
      {t("landing.marketplace.appDownload.installHelp")}
      {!release && !isPending ? <button type="button" onClick={() => refetch()}>
        {t("landing.marketplace.appDownload.retry")}
      </button> : null}
    </small>
  </div>;
}
