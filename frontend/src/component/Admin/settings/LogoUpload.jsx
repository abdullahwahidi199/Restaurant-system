import React from "react";

import { useTranslation } from "react-i18next";
export default function LogoUpload({ logo, onChange }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onChange(file);
  };
  const { t } = useTranslation();

  return (
    <div>
      <label className="block mb-1 font-medium">{t("logo")}</label>
      {logo && (
        <img src={logo} alt="Logo" className="w-32 h-32 object-cover rounded-xl mb-2" />
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
}
