import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "../src/forTailwind.css";
import "../src/i18n";
import { AuthContext } from "../src/api/authforRBC";
import RequireAuth from "../src/api/ReauireAuth";
import AIConversationAudit from "../src/superAdmin/AIConversationAudit";
import instance from "../src/api/axiosInstance";
// Local fixture only. Browser regressions intercept every request.
instance.defaults.baseURL = "/api";
const role = new URLSearchParams(location.search).get("role") || "SuperAdmin";
const auth = { tokens:{access:"synthetic-ui-only-access"}, user:{role} };
localStorage.setItem("authTokens",JSON.stringify(auth.tokens));
createRoot(document.getElementById("root")).render(<MemoryRouter initialEntries={["/super-admin/ai-audit"]}>
  <AuthContext.Provider value={{auth}}><Routes>
    <Route path="/super-admin/ai-audit" element={<RequireAuth allowedRoles={["SuperAdmin"]} showPortalLogout={false}><AIConversationAudit /></RequireAuth>} />
    <Route path="/staff-login" element={<p>Sign in required</p>} />
  </Routes></AuthContext.Provider>
</MemoryRouter>);
