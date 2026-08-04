import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import BranchSwitcher from "../branch/BranchSwitcher";

export default function KitchenRootLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r p-4 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {!collapsed && <h1 className="text-2xl font-bold">Kitchen Panel</h1>}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded hover:bg-gray-100"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="space-y-2">
          <NavLink
            to="/kitchen"
            end
            className={({ isActive }) =>
              isActive
                ? "flex items-center gap-2 bg-blue-500 text-white p-3 rounded"
                : "flex items-center gap-2 p-3 rounded hover:bg-gray-100"
            }
          >
            🍽️ {!collapsed && "Orders"}
          </NavLink>

          <NavLink
            to="/kitchen/stock"
            className={({ isActive }) =>
              isActive
                ? "flex items-center gap-2 bg-blue-500 text-white p-3 rounded"
                : "flex items-center gap-2 p-3 rounded hover:bg-gray-100"
            }
          >
            📦 {!collapsed && "Stock"}
          </NavLink>

          <NavLink
            to="/kitchen/menu"
            className={({ isActive }) =>
              isActive
                ? "flex items-center gap-2 bg-blue-500 text-white p-3 rounded"
                : "flex items-center gap-2 p-3 rounded hover:bg-gray-100"
            }
          >
            🍴 {!collapsed && "Menu"}
          </NavLink>
          <NavLink
            to="/kitchen/ready-orders"
            className={({ isActive }) =>
              isActive
                ? "flex items-center gap-2 bg-blue-500 text-white p-3 rounded"
                : "flex items-center gap-2 p-3 rounded hover:bg-gray-100"
            }
          >
            ✅ {!collapsed && "Ready Orders"}
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 bg-gray-50">
        <div className="mb-4 flex justify-end">
          <BranchSwitcher />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
