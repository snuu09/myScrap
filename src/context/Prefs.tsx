import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Lang } from "../i18n";

export type ThemeChoice = "light" | "dark" | "system";
export type Palette = "kitchen" | "basalt";
export type Look = "fridge" | "library";
export type ShelfLayout = "list" | "gallery";

type Prefs = {
  lang: Lang;
  theme: ThemeChoice;
  palette: Palette;
  look: Look;
  shelfLayout: ShelfLayout;
  setLang: (lang: Lang) => void;
  setTheme: (theme: ThemeChoice) => void;
  setPalette: (palette: Palette) => void;
  setLook: (look: Look) => void;
  setShelfLayout: (layout: ShelfLayout) => void;
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

function readLook(): Look {
  try {
    if (localStorage.getItem("mybrary.look") === "fridge") return "fridge";
  } catch {
    /* ignore */
  }
  return "library";
}

function readShelfLayout(): ShelfLayout {
  try {
    const stored = localStorage.getItem("mybrary.shelfLayout");
    if (stored === "gallery") return "gallery";
  } catch {
    /* ignore */
  }
  return "list";
}

function applyChrome(theme: ThemeChoice, palette: Palette, look: Look, lang: Lang) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  document.documentElement.setAttribute("data-palette", palette);
  document.documentElement.setAttribute("data-look", look);
  document.documentElement.lang = lang;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    if (look === "library") meta.setAttribute("content", dark ? "#1e1c19" : "#f3ebe0");
    else meta.setAttribute("content", dark ? "#2a2420" : "#fff7f2");
  }
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);
  const [theme, setThemeState] = useState<ThemeChoice>(readTheme);
  const [palette, setPaletteState] = useState<Palette>(readPalette);
  const [look, setLookState] = useState<Look>(readLook);
  const [shelfLayout, setShelfLayoutState] = useState<ShelfLayout>(readShelfLayout);

  useEffect(() => {
    applyChrome(theme, palette, look, lang);
  }, [theme, palette, look, lang]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyChrome(theme, palette, look, lang);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme, palette, look, lang]);

  const value = useMemo<Prefs>(
    () => ({
      lang,
      theme,
      palette,
      look,
      shelfLayout,
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
      setLook(next) {
        if (next === "fridge") localStorage.setItem("mybrary.look", next);
        else localStorage.removeItem("mybrary.look");
        setLookState(next);
      },
      setShelfLayout(next) {
        if (next === "list") localStorage.removeItem("mybrary.shelfLayout");
        else localStorage.setItem("mybrary.shelfLayout", next);
        setShelfLayoutState(next);
      },
    }),
    [lang, theme, palette, look, shelfLayout],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs");
  return ctx;
}
