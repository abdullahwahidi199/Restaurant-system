import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locals/en.json";
import fa from "./locals/fa.json";
import ps from "./locals/ps.json";
import aiEn from "./locals/ai/en.json";
import aiFa from "./locals/ai/fa.json";
import aiPs from "./locals/ai/ps.json";
import analystEn from "./locals/business-analyst/en.json";
import analystFa from "./locals/business-analyst/fa.json";
import analystPs from "./locals/business-analyst/ps.json";
import landingEn from "./locals/landing/en.json";
import landingFa from "./locals/landing/fa.json";
import landingPs from "./locals/landing/ps.json";
import legacyEn from "./locals/auto/en.json";
import legacyFa from "./locals/auto/fa.json";
import legacyPs from "./locals/auto/ps.json";

const withTranslations = (
  baseTranslations,
  landingTranslations,
  legacyTranslations,
) => ({
  ...baseTranslations,
  landing: landingTranslations,
  legacy: legacyTranslations,
});

const supportedLanguages = ["en", "fa", "ps"];
const analystTranslations = (base, overrides) => ({ ...base, ...overrides, errors: { ...base.errors, ...overrides.errors } });

const syncDocumentLanguage = (language) => {
  if (typeof document === "undefined") return;

  const languageCode = language?.split("-")[0] || "en";
  document.documentElement.lang = languageCode;
  document.documentElement.dir = i18n.dir(languageCode);
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: withTranslations({ ...en, aiChat: aiEn, businessAnalyst: analystTranslations(aiEn, analystEn) }, landingEn, legacyEn) },
      fa: { translation: withTranslations({ ...fa, aiChat: aiFa, businessAnalyst: analystTranslations(aiFa, analystFa) }, landingFa, legacyFa) },
      ps: { translation: withTranslations({ ...ps, aiChat: aiPs, businessAnalyst: analystTranslations(aiPs, analystPs) }, landingPs, legacyPs) },
    },
    supportedLngs: supportedLanguages,
    load: "languageOnly",
    fallbackLng: "en",
    detection: {
      convertDetectedLanguage: (language) =>
        language.split(/[-_]/)[0].toLowerCase(),
    },
    interpolation: { escapeValue: false },
  });

syncDocumentLanguage(i18n.resolvedLanguage || i18n.language);
i18n.on("languageChanged", syncDocumentLanguage);

export default i18n;
