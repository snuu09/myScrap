import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Lang } from "../i18n";

export type ThemeChoice = "light" | "dark" | "system";
export type Palette = "kitchen" | "basalt";

type Prefs = {
  lang: Lang;
  theme: ThemeChoice;
  palette: Palette;
  setLang: (lang: Lang) => void;
  setTheme: (theme: ThemeChoice) => void;
  setPalette: (palette: Palette) => void;
};

const PrefsContext = createContext<Prefs | null>(null);

function readLang(): Lang {
  try {
    const stored = localStorage.getItem("mybrary.lang");
    if (stored === "en" || stored === "ko") return stored;
  } catch {
    /* ignore */
  }
  return (navigator.language || "").toLowerCase().startsWith("en") ? "en" : "ko";
}

function readTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem("mybrary.theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return "system";
}

function readPalette(): Palette {
  try {
    if (localStorage.getItem("mybrary.palette") === "basalt") return "basalt";
  } catch {
    /* ignore */
  }
  return "kitchen";
}

function applyChrome(theme: ThemeChoice, palette: Palette, lang: Lang) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  document.documentElement.setAttribute("data-palette", palette);
  document.documentElement.lang = lang;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#2a2420" : "#fff7f2");
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);
  const [theme, setThemeState] = useState<ThemeChoice>(readTheme);
  const [palette, setPaletteState] = useState<Palette>(readPalette);

  useEffect(() => {
    applyChrome(theme, palette, lang);
  }, [theme, palette, lang]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyChrome(theme, palette, lang);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme, palette, lang]);

  const value = useMemo<Prefs>(
    () => ({
      lang,
      theme,
      palette,
      setLang(next) {
        localStorage.setItem("mybrary.lang", next);
        setLangState(next);
      },
      setTheme(next) {
        if (next === "light" || next === "dark") localStorage.setItem("mybrary.theme", next);
        else localStorage.removeItem("mybrary.theme");
        setThemeState(next);
      },
      setPalette(next) {
        if (next === "basalt") localStorage.setItem("mybrary.palette", next);
        else localStorage.removeItem("mybrary.palette");
        setPaletteState(next);
      },
    }),
    [lang, theme, palette],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs");
  return ctx;
}
