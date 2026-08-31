import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}
const ThemeContext = createContext<ThemeContextValue | null>(null);
const KEY = "taskboard.theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY) as Theme | null;
      const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      const initial = saved ?? prefers;
      setThemeState(initial);
      document.documentElement.classList.toggle("dark", initial === "dark");
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    window.localStorage.setItem(KEY, t);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
