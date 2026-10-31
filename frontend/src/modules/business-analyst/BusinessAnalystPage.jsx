import { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../api/authforRBC";
import { getStaffHomePath } from "../../config/staffRoutes";
import { getStaffLoginPath } from "../../config/appEnvironment";
import { assistantContextKey } from "../ai/access";
import useAIChat from "../ai/hooks/useAIChat";
import ChatWorkspace from "../ai/ChatWorkspace";
import { businessAnalystApi } from "./businessAnalystApi";
import "./business-analyst.css";

const SUGGESTIONS = ["contractors", "expenses", "financialMeaning", "expenseCurrency"];

function AnalystSession({ homePath }) {
  const { i18n } = useTranslation();
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const owner = auth.user?.staff_id ?? auth.user?.id;
  const preferences = owner ? `business-analyst.${auth.user?.restaurant_id}.${owner}` : null;
  const chat = useAIChat((i18n.resolvedLanguage || "en").split("-")[0], preferences, businessAnalystApi);
  return <ChatWorkspace chat={chat} homePath={homePath} translationKeyPrefix="businessAnalyst" sidebar
    suggestionKeys={SUGGESTIONS} onLogout={() => { logout(); navigate(getStaffLoginPath(), { replace: true }); }} />;
}

export default function BusinessAnalystPage() {
  const { auth, activeBranch } = useContext(AuthContext);
  const branch = activeBranch?.id ?? auth.user?.active_branch?.id ?? auth.user?.active_branch_id;
  if (!branch) return <Navigate to="/select-branch" replace />;
  return <AnalystSession key={assistantContextKey(auth, activeBranch)} homePath={getStaffHomePath(auth.user?.role)} />;
}
