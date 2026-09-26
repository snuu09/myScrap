import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Lang } from "../i18n";

export type ThemeChoice = "light" | "dark" | "system";
/** editorial = Minimal Editorial; deckle = Soft Deckle Archival (default). Legacy warm/basalt/kitchen migrate to deckle. */
export type Palette = "editorial" | "deckle";
export type Look = "glass" | "library";
/** micro = horizontal media rows; gallery = 4:3 visual poster grid. Legacy list→micro; accordion removed. */
export type ShelfLayout = "micro" | "gallery";

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
    const stored = localStorage.getItem("mybrary.palette");
    if (stored === "editorial") return "editorial";
    if (stored === "deckle") return "deckle";
    // Legacy warm / kitchen / basalt / missing → Soft Deckle
    if (stored === "warm" || stored === "kitchen" || stored === "basalt" || !stored) {
      localStorage.setItem("mybrary.palette", "deckle");
      return "deckle";
    }
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem("mybrary.palette", "deckle");
  } catch {
    /* ignore */
  }
  return "deckle";
}

function readLook(): Look {
  try {
    const stored = localStorage.getItem("mybrary.look");
    if (stored === "library") return "library";
    if (stored === "fridge") localStorage.removeItem("mybrary.look");
  } catch {
    /* ignore */
  }
  return "glass";
}

function readShelfLayout(): ShelfLayout {
  try {
    if (localStorage.getItem("mybrary.shelfLayoutDefault") !== "gallery-v2") {
      localStorage.removeItem("mybrary.shelfLayout");
      localStorage.setItem("mybrary.shelfLayoutDefault", "gallery-v2");
    }
    const stored = localStorage.getItem("mybrary.shelfLayout");
    if (stored === "micro") return "micro";
    if (stored === "list") {
      localStorage.setItem("mybrary.shelfLayout", "micro");
      return "micro";
    }
    if (stored === "accordion") {
      localStorage.removeItem("mybrary.shelfLayout");
      return "gallery";
    }
  } catch {
    /* ignore */
  }
  return "gallery";
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
    if (dark && palette === "editorial") meta.setAttribute("content", "#09090b");
    else if (dark && palette === "deckle") meta.setAttribute("content", "#121214");
    else if (palette === "editorial") meta.setAttribute("content", "#ffffff");
    else meta.setAttribute("content", "#faf9f6");
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
        localStorage.setItem("mybrary.palette", next);
        setPaletteState(next);
      },
      setLook(next) {
        if (next === "library") localStorage.setItem("mybrary.look", next);
        else localStorage.removeItem("mybrary.look");
        setLookState(next);
      },
      setShelfLayout(next) {
        if (next === "gallery") localStorage.removeItem("mybrary.shelfLayout");
        else localStorage.setItem("mybrary.shelfLayout", next === "micro" ? "micro" : next);
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
