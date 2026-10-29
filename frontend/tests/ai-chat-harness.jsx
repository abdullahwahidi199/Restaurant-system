/* eslint-disable react-refresh/only-export-components -- isolated browser fixture, never in the production entry */
import { lazy, StrictMode, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import "../src/i18n";
import ChatWorkspace from "../src/modules/ai/ChatWorkspace";
import AIChatPage from "../src/modules/ai/AIChatPage";
import AIChatEntry from "../src/modules/ai/AIChatEntry";
import RequireAuth from "../src/api/ReauireAuth";
import { AuthContext } from "../src/api/authforRBC";
import instance from "../src/api/axiosInstance";
import { AI_CHAT_ROLES } from "../src/modules/ai/access";
import { getStaffHomePath } from "../src/config/staffRoutes";

// Test fixture only. All calls are intercepted by the headless test; a fake
// credential is never sent to a real backend, and no production mock mode exists.
instance.defaults.baseURL = "/api";
const fixture = { tokens: { access: "synthetic-test-access", refresh: "synthetic-test-refresh" },
  user: { staff_id: 1, username: "synthetic-test-staff", role: "Admin", restaurant_id: 1, active_branch: { id: 1 }, session_id: "fixture-session" } };
localStorage.setItem("authTokens", JSON.stringify(fixture.tokens));
localStorage.setItem("user", JSON.stringify(fixture.user));
localStorage.setItem("activeBranch", JSON.stringify({ id: 1 }));

const FullApp = lazy(() => import("../src/App"));

function IntegrationFixture({ fullApp = false, navigationOnly = false }) {
  const [auth, setAuth] = useState(fixture);
  const [branch, setBranch] = useState({ id: 1 });
  useEffect(() => { window.aiFixtureReady = true; return () => { window.aiFixtureReady = false; }; }, []);
  // Explicit test controls allow real React context changes while POST is in flight.
  window.aiTestSetContext = (changes) => {
    if (changes.branch) { setBranch({ id: changes.branch }); localStorage.setItem("activeBranch", JSON.stringify({ id: changes.branch })); }
    if (changes.role) setAuth((value) => ({ ...value, user: { ...value.user, role: changes.role } }));
    if (changes.logout) setAuth({ tokens: null, user: null });
  };
  return <AuthContext.Provider value={{ auth, activeBranch: branch, logout: () => setAuth({ tokens: null }) }}>
    {navigationOnly ? <AIChatEntry /> : fullApp ? <Suspense fallback={<p>Loading real app routes…</p>}><FullApp /></Suspense> : <>
      <RequireAuth allowedRoles={AI_CHAT_ROLES} showPortalLogout={false}><AIChatPage /></RequireAuth><AIChatEntry />
    </>}
  </AuthContext.Provider>;
}

function ConversionFixture() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [animatingId, setAnimatingId] = useState(null);
  const finishAnimation = () => setAnimatingId(null);
  const chat = { draft, setDraft, messages, animatingId, finishAnimation, conversations: [], listNext: null, historyNext: null,
    startNew: () => { setMessages([]); setAnimatingId(null); },
    send: () => {
      if (!draft.trim() || animatingId) return;
      const stamp = new Date().toISOString();
      setMessages((current) => [...current, { id: `u${current.length}`, role: "user", content: draft, state: "complete", created_at: stamp },
        { id: `a${current.length}`, role: "assistant", state: "complete", created_at: stamp, content: "Open **Orders**.\n\n1. Choose a table.\n2. Use `Add Order`.\n\n| Field | Required |\n| --- | --- |\n| Table | Yes |", sources: [] }]);
      setAnimatingId(`a${messages.length}`); setDraft("");
    } };
  return <ChatWorkspace chat={chat} homePath="/" />;
}

const conversion = new URLSearchParams(location.search).get("stage") === "conversion";
const fullApp = new URLSearchParams(location.search).get("stage") === "app";
const navigationOnly = new URLSearchParams(location.search).get("stage") === "navigation";
const role = new URLSearchParams(location.search).get("role");
if (navigationOnly && role) fixture.user = { ...fixture.user, role };
if (fullApp) window.history.replaceState({}, "", "/assistant");
createRoot(document.getElementById("root")).render(<StrictMode>{fullApp ? <IntegrationFixture fullApp /> : <MemoryRouter initialEntries={[navigationOnly ? getStaffHomePath(role) : "/assistant"]}>
  {conversion ? <ConversionFixture /> : <IntegrationFixture navigationOnly={navigationOnly} />}
</MemoryRouter>}</StrictMode>);
