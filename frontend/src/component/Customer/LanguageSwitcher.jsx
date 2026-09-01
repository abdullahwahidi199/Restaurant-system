import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "ps", label: "Pashto" },
  { code: "fa", label: "Dari" },
  { code: "en", label: "English" },
];

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language?.split("-")[0] || "en";

  return (
    <label
      className="relative inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2 text-stone-600 transition hover:border-orange-300 hover:text-orange-700 sm:px-3"
      title={t("landing.marketplace.nav.language", "Language")}
    >
      <Languages className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="hidden text-xs font-black uppercase sm:inline">
        {currentLanguage}
      </span>
      <span className="sr-only">
        {t("landing.marketplace.nav.language", "Language")}
      </span>
      <select
        value={currentLanguage}
        onChange={(event) => i18n.changeLanguage(event.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label={t("landing.marketplace.nav.language", "Language")}
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
