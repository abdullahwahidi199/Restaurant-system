import { useContext, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  ClipboardCheck,
  CookingPot,
  Package,
  Search,
  ScrollText,
  Soup,
  Utensils,
} from "lucide-react";
import { AuthContext } from "../../api/authforRBC";

export default function KitchenRootLayout() {
  const { auth } = useContext(AuthContext);
  const [orderSearch, setOrderSearch] = useState("");

  const stationNames = auth?.user?.staff_profile?.station_names || [];
  const tabs = [
    { to: "/kitchen", label: "Orders", icon: CookingPot, end: true },
    { to: "/kitchen/ready-orders", label: "Ready", icon: ClipboardCheck },
    { to: "/kitchen/daily-production", label: "Production", icon: Soup },
    { to: "/kitchen/stock", label: "Stock", icon: Package },
    { to: "/kitchen/menu", label: "Menu", icon: ScrollText },
  ];

  return (
    <div className="kitchen-light-theme min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex min-h-12 items-center gap-2 px-2 py-1.5 sm:px-3 lg:px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
            <Utensils size={17} />
          </div>

          <div className="relative min-w-[150px] flex-1 sm:mx-auto sm:max-w-md lg:max-w-xl">
            <Search
              size={15}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={orderSearch}
              onChange={(event) => setOrderSearch(event.target.value)}
              placeholder="Search orders..."
              className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-2 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="hidden min-w-0 items-center justify-end gap-1 xl:flex">
            {stationNames.length > 0 ? (
              stationNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex h-7 max-w-32 items-center truncate rounded-md border border-blue-100 bg-blue-50 px-2 text-xs font-semibold text-blue-700"
                  title={`Station: ${name}`}
                >
                  {name}
                </span>
              ))
            ) : (
              <span className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-500">
                All stations
              </span>
            )}
          </div>

          <nav
            aria-label="Kitchen sections"
            className="flex shrink-0 gap-1 overflow-x-auto rounded-md border border-slate-200 bg-slate-100 p-0.5"
          >
            {tabs.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={label}
                className={({ isActive }) =>
                  [
                    "flex h-8 min-w-8 items-center justify-center gap-1.5 rounded px-2 text-xs font-semibold transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
                    isActive
                      ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-950",
                  ].join(" ")
                }
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center justify-end gap-1 overflow-x-auto border-t border-slate-100 px-2 py-1 xl:hidden">
          {stationNames.length > 0 ? (
            stationNames.map((name) => (
              <span
                key={name}
                className="inline-flex h-6 max-w-36 shrink-0 items-center truncate rounded-md border border-blue-100 bg-blue-50 px-2 text-xs font-semibold text-blue-700"
                title={`Station: ${name}`}
              >
                {name}
              </span>
            ))
          ) : (
            <span className="inline-flex h-6 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-500">
              All stations
            </span>
          )}
        </div>
      </header>

      <main className="bg-slate-50">
        <Outlet context={{ orderSearch }} />
      </main>
    </div>
  );
}
