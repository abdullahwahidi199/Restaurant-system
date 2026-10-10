import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import i18n from "../i18n";

export const THEMES = [
  {
    id: "modern",
    name: "Modern Premium",
    description: i18n.t(
      "legacy.clean_operational_ui_with_emerald_accents_ffe28ba0",
    ),
  },
  {
    id: "restaurant",
    name: "Elegant Restaurant",
    description: i18n.t(
      "legacy.warm_dining_inspired_palette_with_gold_highlights_dcab5d56",
    ),
  },
  {
    id: "dark",
    name: "Dark Enterprise",
    description: i18n.t(
      "legacy.low_light_operations_theme_with_crisp_contrast_dda94b52",
    ),
  },
  {
    id: "neumorphism",
    name: "Soft Neutral",
    description: i18n.t("theme.softNeumorphismDescription", {
      defaultValue:
        "A low-contrast light palette with flat operational surfaces.",
    }),
  },
  {
    id: "glass",
    name: "Slate Night",
    description: i18n.t("theme.glassmorphismDescription", {
      defaultValue: "A focused dark palette for low-light operations.",
    }),
  },
];

const THEME_STORAGE_KEY = "pakhlai-theme";
const DEFAULT_THEME = "modern";
const validThemeIds = new Set(THEMES.map((theme) => theme.id));

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  themes: THEMES,
});

const getInitialTheme = () => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return validThemeIds.has(savedTheme) ? savedTheme : DEFAULT_THEME;
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (nextTheme) => {
    if (!validThemeIds.has(nextTheme)) return;
    setThemeState(nextTheme);
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: THEMES,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
