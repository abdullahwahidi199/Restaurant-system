import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { logoutCustomer, getProfile } from "../../api/auth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import toast from "react-hot-toast";

export default function Header({ restaurantInfo }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams();
  const isRTL = document.documentElement.dir === "rtl";
  const BASE_URL = import.meta.env.VITE_MEDIA_URL;

  const handleLogout = () => {
    logoutCustomer();
    navigate("/");
    window.location.reload();
  };

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Section */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          {restaurantInfo?.logo && (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
              <img
                src={`${BASE_URL}${restaurantInfo.logo}`}
                alt={restaurantInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
              Pahkhlai
            </span>
            <h2 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
              {restaurantInfo?.name || "Restaurant"}
            </h2>
          </div>
        </div>

        {/* Navigation & Language */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            to={`/${slug}/info`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            {t("nav.info")}
          </Link>
        </div>
      </div>
    </header>
  );
}
