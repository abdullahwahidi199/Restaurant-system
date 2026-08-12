import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locals/en.json";
import fa from "./locals/fa.json";
import ps from "./locals/ps.json";
import landingEn from "./locals/landing/en.json";
import landingFa from "./locals/landing/fa.json";
import landingPs from "./locals/landing/ps.json";

const withLandingTranslations = (baseTranslations, landingTranslations) => ({
  ...baseTranslations,
  landing: landingTranslations,
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: withLandingTranslations(en, landingEn) },
      fa: { translation: withLandingTranslations(fa, landingFa) },
      ps: { translation: withLandingTranslations(ps, landingPs) },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
