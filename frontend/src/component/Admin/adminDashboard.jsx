import { Outlet } from "react-router-dom";
import Navbar from "./navbar";

import { useTranslation } from "react-i18next";
export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";
  return (
    <div className="flex h-screen overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <main className="flex-1  p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
