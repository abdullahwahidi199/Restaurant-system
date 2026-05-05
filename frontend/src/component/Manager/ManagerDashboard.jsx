import React from "react";
import ManagerNavbar from "./ManagerNavbar";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ManagerDashboard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";
  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      das
    </div>
  );
}
