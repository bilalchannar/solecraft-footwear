import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: ResolvedTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const storageKey = "solecraft-theme";

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function initialThemeMode(defaultTheme: ThemeMode): ThemeMode {
  const requested = new URLSearchParams(window.location.search).get("theme");
  if (requested === "light" || requested === "dark" || requested === "system") return requested;
  const stored = localStorage.getItem(storageKey);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : defaultTheme;
}

export function ThemeProvider({ children, defaultTheme = "system", switchable = true }: { children: React.ReactNode; defaultTheme?: ThemeMode; switchable?: boolean }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => initialThemeMode(defaultTheme));
  const [theme, setTheme] = useState<ResolvedTheme>(() => themeMode === "system" ? systemTheme() : themeMode);

  useEffect(() => {
    const resolve = () => setTheme(themeMode === "system" ? systemTheme() : themeMode);
    resolve();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", resolve);
    return () => media.removeEventListener("change", resolve);
  }, [themeMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    localStorage.setItem(storageKey, themeMode);
  }, [theme, themeMode]);

  const value = useMemo(() => ({
    theme,
    themeMode,
    setThemeMode,
    toggleTheme: () => setThemeMode(current => current === "light" ? "dark" : current === "dark" ? "system" : "light"),
    switchable,
  }), [theme, themeMode, switchable]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
