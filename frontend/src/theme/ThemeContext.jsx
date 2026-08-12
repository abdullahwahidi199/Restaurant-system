import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export const THEMES = [
  {
    id: "modern",
    name: "Modern Premium",
    description: "Clean operational UI with emerald accents.",
  },
  {
    id: "restaurant",
    name: "Elegant Restaurant",
    description: "Warm dining-inspired palette with gold highlights.",
  },
  {
    id: "dark",
    name: "Dark Enterprise",
    description: "Low-light operations theme with crisp contrast.",
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
