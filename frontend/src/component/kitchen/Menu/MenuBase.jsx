import Menu from "../../Admin/MenuManagement/MenuBaseModal";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function KitchenManagerMenu() {
                 const { t: autoT } = useAutoTranslation();
  return (
    <Menu
      canManage={false}
      title={autoT("legacy.kitchen_menu_f9b1388f")}
      description={autoT("legacy.review_availability_production_items_and_platters_for__5bc2bda6")}
    />
  );
}
