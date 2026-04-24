import React, { useState, useEffect } from "react";

import RestaurantForm from "./RestaurantInfoDisplay";
import instance from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
export default function RestaurantSettings() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await instance.get("/restaurant/restaurant/");
        setRestaurant(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Failed to fetch restaurant info", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, []);

  if (loading) return <p>{t("loading")}</p>;
  if (!restaurant) return <p>{t("restaurant_not_found")}</p>;

  return (
    <div
      className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("restaurant_settings")}</h1>
        <LanguageSwitcher />
      </div>

      <RestaurantForm restaurant={restaurant} />
    </div>
  );
}
