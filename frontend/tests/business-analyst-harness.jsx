// Local isolated test entry only; excluded from the production build. HTTP is
// real, authenticated Django. Only the synthetic session bootstrap is test-only.
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
  const params = new URLSearchParams(location.search);
  const response = await fetch(`/api/__fixture__/session/?role=${encodeURIComponent(params.get("role") || "admin")}`);
  if (!response.ok) throw new Error("Start the isolated synthetic Django server first.");
  const session = await response.json();
  localStorage.setItem("authTokens", JSON.stringify(session.tokens));
  localStorage.setItem("user", JSON.stringify(session.user));
  localStorage.setItem("activeBranch", JSON.stringify(session.active_branch));
  localStorage.setItem("i18nextLng", "en");
  history.replaceState({}, "", params.get("mentor") ? "/assistant" : "/business-analyst");
  const auth = { tokens: session.tokens, user: session.user };
  createRoot(document.getElementById("root")).render(<AuthContext.Provider value={{ auth, activeBranch: session.active_branch,
    logout: () => { localStorage.removeItem("authTokens"); location.href = "/staff-login"; } }}>
    <Suspense fallback={<p>Loading chat…</p>}><App /></Suspense>
  </AuthContext.Provider>);
}
start().catch(() => { document.getElementById("root").textContent = "The isolated test server is not available."; });
