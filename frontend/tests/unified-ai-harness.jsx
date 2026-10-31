// Test-only bootstrap into the existing production router and chat/admin pages.
// No mocked HTTP and no provider credential is sent to this entry.
import { createRoot } from "react-dom/client";
import { Suspense, lazy } from "react";
import { AuthContext } from "../src/api/authforRBC";
import instance from "../src/api/axiosInstance";
import "../src/i18n";
import "../src/index.css";
import "../src/styles/theme.css";

instance.defaults.baseURL = "/api";
const App = lazy(() => import("../src/App"));
async function start() {
  const page = new URLSearchParams(location.search).get("page") || "business-analyst";
  const target = page === "audit" ? "/super-admin/ai-audit" : page === "mentor" ? "/assistant" : "/business-analyst";
  const response = await fetch(`/api/__fixture__/session/?role=${page === "audit" ? "superadmin" : "admin"}`);
  if (!response.ok) throw new Error("Synthetic server unavailable");
  const session = await response.json();
  localStorage.setItem("authTokens", JSON.stringify(session.tokens));
  localStorage.setItem("user", JSON.stringify(session.user));
  localStorage.setItem("activeBranch", JSON.stringify(session.active_branch));
  history.replaceState({}, "", target);
  createRoot(document.getElementById("root")).render(<AuthContext.Provider value={{ auth: {tokens:session.tokens,user:session.user},
    activeBranch:session.active_branch, logout:() => { localStorage.removeItem("authTokens"); location.href="/staff-login"; } }}>
    <Suspense fallback={<p>Loading existing interface…</p>}><App /></Suspense>
  </AuthContext.Provider>);
}
start().catch(() => { document.getElementById("root").textContent="Start the isolated synthetic backend first."; });
