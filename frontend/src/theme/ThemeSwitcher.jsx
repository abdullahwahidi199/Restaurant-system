import React from "react";
import { Check } from "lucide-react";
import { useTheme } from "./ThemeContext";

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <section className="theme-card p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold theme-text-primary">Theme</h2>
        <p className="mt-1 text-sm theme-text-secondary">
          Choose the visual style used across the application.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {themes.map((item) => {
          const selected = item.id === theme;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTheme(item.id)}
              className={`flex items-start justify-between gap-4 rounded-lg border p-4 text-left transition ${
                selected
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
              aria-pressed={selected}
            >
              <span>
                <span className="block font-semibold theme-text-primary">
                  {item.name}
                </span>
                <span className="mt-1 block text-sm theme-text-secondary">
                  {item.description}
                </span>
              </span>
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  selected
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 text-transparent"
                }`}
              >
                <Check className="h-4 w-4" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
