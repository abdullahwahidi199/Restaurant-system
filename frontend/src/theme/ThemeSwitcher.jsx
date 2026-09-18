import React from "react";
import { Check } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ThemeSwitcher() {
  const { t: autoT } = useAutoTranslation();
  const { theme, setTheme, themes } = useTheme();

  return (
    <section className="theme-card p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold theme-text-primary">
          {autoT("legacy.theme_a797e309")}
        </h2>
        <p className="mt-1 text-sm theme-text-secondary">
          {autoT(
            "legacy.choose_the_visual_style_used_across_the_application_ad5d4788",
          )}
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
              className={`theme-switcher-option flex items-start justify-between gap-4 rounded-lg border p-4 text-left transition ${
                selected
                  ? "border-[var(--theme-primary)] bg-[var(--theme-primary-subtle)] shadow-[var(--theme-shadow-xs)]"
                  : "border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-[var(--theme-shadow-xs)] hover:border-[var(--theme-border-strong)] hover:bg-[var(--theme-hover)]"
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
                    ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white"
                    : "border-[var(--theme-border-strong)] text-transparent"
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
