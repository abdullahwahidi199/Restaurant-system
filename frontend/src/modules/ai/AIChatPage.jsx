import { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../api/authforRBC";
import { getStaffHomePath } from "../../config/staffRoutes";
import { getStaffLoginPath } from "../../config/appEnvironment";
import { assistantContextKey } from "./access";
import useAIChat from "./hooks/useAIChat";
import ChatWorkspace from "./ChatWorkspace";

function ChatSession({ homePath }) {
  const { i18n } = useTranslation();
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const chat = useAIChat((i18n.resolvedLanguage || "en").split("-")[0]);
  return <ChatWorkspace chat={chat} homePath={homePath} onLogout={() => { logout(); navigate(getStaffLoginPath(), { replace: true }); }} />;
}

export default function AIChatPage() {
  const { auth, activeBranch } = useContext(AuthContext);
  const branch = activeBranch?.id ?? auth.user?.active_branch?.id ?? auth.user?.active_branch_id;
  if (!branch) return <Navigate to="/select-branch" replace />;
  // A changed account, session, role, branch or known permission remounts the
  // session, clearing local evidence and aborting stale responses synchronously.
  return <ChatSession key={assistantContextKey(auth, activeBranch)} homePath={getStaffHomePath(auth.user?.role)} />;
}
