                                                                                                                                                                                                                                                                                                                                                                                                                                          import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const basePath = "/admin/dashboard/settings";

export default function SettingsSidebar({ sections, activeSection }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <aside className="hidden lg:block">
        <nav
          aria-label={t("settings_center.nav_label")}
          className="sticky top-4 rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
        >
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <NavLink
                key={section.id}
                to={`${basePath}/${section.id}`}
                className={({ isActive }) =>
                  `group mb-1 flex items-start gap-3 rounded-lg px-3 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                    isActive
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`
                }
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block font-semibold">
                    {t(section.labelKey)}
                  </span>
                  <span className="mt-0.5 block text-xs opacity-75">
                    {t(section.descriptionKey)}
                  </span>
                </span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="lg:hidden">
        <label className="sr-only" htmlFor="settings-section-select">
          {t("settings_center.nav_label")}
        </label>
        <select
          id="settings-section-select"
          value={activeSection.id}
          onChange={(event) => navigate(`${basePath}/${event.target.value}`)}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
        >
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {t(section.labelKey)}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
