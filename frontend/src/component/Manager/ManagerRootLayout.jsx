import React from "react";
import ManagerNavbar from "./ManagerNavbar";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ManagerRootLayout() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";
  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <ManagerNavbar />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
