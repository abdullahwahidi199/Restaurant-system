import React from "react";
import { useTranslation } from "react-i18next";
import { Languages, Check } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLang = i18n.language;

  const languages = [
    { code: "ps", label: "پښتو" },
    { code: "fa", label: "دری" },
    { code: "en", label: "English" },
  ];

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 shadow-md hover:border-red-500 transition w-fit">
        <Languages size={18} className="text-red-500" />

        <select
          value={currentLang}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-gray-900 text-white outline-none cursor-pointer px-2 py-1 rounded-md"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        <Check size={16} className="text-green-400 absolute right-3" />
      </div>
    </div>
  );
}
