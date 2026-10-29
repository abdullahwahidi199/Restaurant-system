import { Outlet } from "react-router-dom";
import Seo from "./seo/Seo";
import AIChatEntry from "./modules/ai/AIChatEntry";

function RootLayout() {
  return (
    <>
      <Seo />
      <div
        className="flex h-screen overflow-hidden theme-app-shell"
        style={{ height: "100dvh" }}
      >
        <main className="min-w-0 flex-1 overflow-auto">
          <Outlet />
          <AIChatEntry />
        </main>
      </div>
    </>
  );
}
export default RootLayout;
