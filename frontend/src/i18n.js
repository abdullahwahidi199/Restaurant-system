import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locals/en.json";
import fa from "./locals/fa.json";
import ps from "./locals/ps.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fa: { translation: fa },
      ps: { translation: ps },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
