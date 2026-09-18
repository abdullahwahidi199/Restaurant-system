import i18n from "i18next";
import { useTranslation as useAutoTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { t: autoT } = useAutoTranslation();
  const handleChange = (e) => {
    i18n.changeLanguage(e.target.value).then(() => {
      window.location.reload();
    });
  };

  return (
    <select onChange={handleChange} defaultValue={i18n.language}>
      <option value="en">{autoT("inventory_manager.languages.english")}</option>
      <option value="fa">دری</option>
      <option value="ps">پښتو</option>
    </select>
  );
}

export default LanguageSwitcher;
