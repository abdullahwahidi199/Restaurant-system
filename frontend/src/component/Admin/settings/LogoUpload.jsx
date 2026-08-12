import React from "react";

import { useTranslation } from "react-i18next";
export default function LogoUpload({
  logo,
  onChange,
  label,
  imageClassName = "w-32 h-32 object-cover rounded-xl mb-2",
}) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onChange(file);
  };
  const { t } = useTranslation();

  return (
    <div>
      <label className="block mb-1 font-medium">{label || t("logo")}</label>
      {logo && (
        <img src={logo} alt={label || "Logo"} className={imageClassName} />
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
}
