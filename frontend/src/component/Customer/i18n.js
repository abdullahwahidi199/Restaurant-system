import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fa from "./locales/fa.json";
import ps from "./locales/ps.json";
import { setDirection } from "./utils/setDirection";

const savedLang = localStorage.getItem("lang") || "ps";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fa: { translation: fa },
    ps: { translation: ps },
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

setDirection(savedLang);

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("lang", lng);
  setDirection(lng);
});

export default i18n;
