export const setDirection = (lang) => {
  const rtlLanguages = ["fa", "ps", "ar"];

  const isRTL = rtlLanguages.includes(lang);

  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.documentElement.lang = lang;
};
