import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../api/authforRBC";
import { isStaffManagementPath } from "../../config/staffRoutes";
import { AI_CHAT_PATH, AI_CHAT_ROLES } from "./access";

export default function AIChatEntry() {
  const { auth } = useContext(AuthContext);
  const { pathname } = useLocation();
  const { t } = useTranslation();
  if (!auth?.tokens?.access || !AI_CHAT_ROLES.includes(auth.user?.role) || pathname === AI_CHAT_PATH
      || !isStaffManagementPath(pathname) || ["/select-branch", "/subscription-inactive"].includes(pathname)) return null;
  return <nav aria-label={t("aiChat.title")} className="fixed bottom-16 end-4 z-[44]">
    <Link to={AI_CHAT_PATH} className="theme-btn theme-btn-primary h-10 gap-2 rounded-xl px-3 shadow-lg">
      <Sparkles size={17} aria-hidden="true" /><span>{t("aiChat.title")}</span>
    </Link>
  </nav>;
}
