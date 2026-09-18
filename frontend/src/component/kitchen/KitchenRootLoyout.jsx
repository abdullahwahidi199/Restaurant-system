import { createElement, useContext, useState } from "react";
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
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function KitchenRootLayout() {
                 const { t: autoT } = useAutoTranslation();
  const { auth } = useContext(AuthContext);
  const [orderSearch, setOrderSearch] = useState("");

  const stationNames = auth?.user?.staff_profile?.station_names || [];
  const tabs = [
    { to: "/kitchen", label: autoT("nav.orders"), icon: CookingPot, end: true },
    { to: "/kitchen/ready-orders", label: autoT("status.ready"), icon: ClipboardCheck },
    { to: "/kitchen/daily-production", label: autoT("landing.mockups.kitchen.stats.production"), icon: Soup },
    { to: "/kitchen/stock", label: autoT("landing.mockups.inventory.panels.stock"), icon: Package },
    { to: "/kitchen/menu", label: autoT("nav.menu"), icon: ScrollText },
  ];

  return (
    <div className="kitchen-light-theme min-h-screen bg-[var(--theme-background)]">
      <header className="sticky top-0 z-30 border-b border-[var(--theme-border)] bg-[rgb(var(--theme-surface-rgb)/0.96)] shadow-[var(--theme-shadow-xs)] backdrop-blur">
        <div className="flex min-h-12 items-center gap-2 px-2 py-1.5 sm:px-3 lg:px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--theme-primary)] text-white shadow-sm">
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
              placeholder={autoT("legacy.search_orders_3c150351")}
              className="h-8 w-full rounded-md border border-[var(--theme-input-border)] bg-[var(--theme-input-bg)] pl-8 pr-2 text-[13px] font-medium text-[var(--theme-text-primary)] outline-none transition placeholder:text-[var(--theme-text-muted)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-input-ring)]"
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
                {autoT("legacy.all_stations_19238dd3")}
              </span>
            )}
          </div>

          <nav
            aria-label={autoT("legacy.kitchen_sections_bbe5db77")}
            className="flex shrink-0 gap-1 overflow-x-auto rounded-md border border-slate-200 bg-slate-100 p-0.5"
          >
            {tabs.map(({ to, label, icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={label}
                className={({ isActive }) =>
                  [
                    "flex h-8 min-w-8 items-center justify-center gap-1.5 rounded px-2 text-xs font-semibold transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-1",
                    isActive
                      ? "bg-[var(--theme-primary-soft)] text-[var(--theme-sidebar-active-text)] shadow-sm ring-1 ring-[var(--theme-border)]"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-950",
                  ].join(" ")
                }
              >
                {createElement(icon, { size: 15 })}
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
              {autoT("legacy.all_stations_19238dd3")}
            </span>
          )}
        </div>
      </header>

      <main className="bg-[var(--theme-background)]">
        <Outlet context={{ orderSearch }} />
      </main>
    </div>
  );
}
