import { useContext } from "react";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../api/authforRBC";
import { getStaffLoginPath } from "../../config/appEnvironment";

export default function PortalLogoutButton() {
  const { t } = useTranslation();
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const label = t("auth.logout", { defaultValue: "Logout" });

  const handleLogout = () => {
    logout();
    navigate(getStaffLoginPath(), { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="theme-btn theme-btn-danger fixed bottom-4 end-4 z-[45] h-10 gap-2 rounded-xl px-3 shadow-lg"
      title={label}
      aria-label={label}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
