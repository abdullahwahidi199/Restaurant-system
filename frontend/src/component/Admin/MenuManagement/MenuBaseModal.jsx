import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import instance from "../../../api/axiosInstance";
import MenuWorkspace from "./MenuWorkspace";
import { sortMenuCategories } from "./menuOrdering";

export default function Menu({
  canManage,
  title = "Menu Management",
  description = "Manage your restaurant menu, pricing, visibility and availability.",
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { i18n } = useTranslation();

  const isManagerPanel = location.pathname.startsWith("/manager");
  const isKitchenPanel = location.pathname.startsWith("/kitchen");
  const isInventoryPanel = location.pathname.startsWith("/inventory-manager");
  const isOperationsPanel = location.pathname.startsWith("/operations-manager");
  const resolvedCanManage =
    canManage ?? (!isManagerPanel && !isKitchenPanel);

  const detailBase = isKitchenPanel
    ? "/kitchen"
    : isInventoryPanel
      ? "/inventory-manager"
      : isOperationsPanel
        ? "/operations-manager"
      : isManagerPanel
        ? null
        : "/admin/dashboard";

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await instance.get("menu/categories/");
      setCategories(sortMenuCategories(response.data));
    } catch (error) {
      console.log(
        "Could not get categories:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <MenuWorkspace
      categories={categories}
      setCategories={setCategories}
      loading={loading}
      onRefresh={fetchCategories}
      canManage={resolvedCanManage}
      detailBase={detailBase}
      title={title}
      description={description}
      showPrintActions={!isKitchenPanel}
      isRTL={i18n.language === "fa" || i18n.language === "ps"}
    />
  );
}
