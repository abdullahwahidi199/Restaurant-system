import { Outlet, NavLink } from "react-router-dom";

export default function KitchenRootLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r p-4">
        <h1 className="text-2xl font-bold mb-6">Kitchen Panel</h1>

        <nav className="space-y-2">
          <NavLink
            to="/kitchen"
            end
            className={({ isActive }) =>
              isActive
                ? "block bg-blue-500 text-white p-3 rounded"
                : "block p-3 rounded hover:bg-gray-100"
            }
          >
            Orders
          </NavLink>

          <NavLink
            to="/kitchen/stock"
            className={({ isActive }) =>
              isActive
                ? "block bg-blue-500 text-white p-3 rounded"
                : "block p-3 rounded hover:bg-gray-100"
            }
          >
            Stock
          </NavLink>

          <NavLink
            to="/kitchen/menu"
            className={({ isActive }) =>
              isActive
                ? "block bg-blue-500 text-white p-3 rounded"
                : "block p-3 rounded hover:bg-gray-100"
            }
          >
            Menu
          </NavLink>
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
