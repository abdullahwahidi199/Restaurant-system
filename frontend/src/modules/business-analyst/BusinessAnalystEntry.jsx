import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChartNoAxesCombined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../api/authforRBC";
import { isStaffManagementPath } from "../../config/staffRoutes";
import { BUSINESS_ANALYST_PATH, BUSINESS_ANALYST_ROLES } from "./access";

export default function BusinessAnalystEntry() {
  const { auth } = useContext(AuthContext);
  const { pathname } = useLocation();
  const { t } = useTranslation();
  if (!auth?.tokens?.access || !BUSINESS_ANALYST_ROLES.includes(auth.user?.role) || pathname === BUSINESS_ANALYST_PATH
      || !isStaffManagementPath(pathname) || ["/select-branch", "/subscription-inactive"].includes(pathname)) return null;
  return <nav aria-label={t("businessAnalyst.title")} className="fixed bottom-28 end-4 z-[44]">
    <Link to={BUSINESS_ANALYST_PATH} className="theme-btn theme-btn-primary h-10 gap-2 rounded-xl px-3 shadow-lg">
      <ChartNoAxesCombined size={17} aria-hidden="true" /><span>{t("businessAnalyst.title")}</span>
    </Link>
  </nav>;
}
