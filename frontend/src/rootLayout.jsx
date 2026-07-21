import { Outlet } from "react-router-dom";
import Seo from "./seo/Seo";

function RootLayout() {
  return (
    <>
      <Seo />
      <div className="flex h-screen overflow-hidden">
        <main className="flex-1 bg-gray-100  overflow-auto">
          <Outlet />
        </main>
      </div>
    </>
  );
}
export default RootLayout;
