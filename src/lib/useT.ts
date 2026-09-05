import { useCallback } from "react";
import { usePrefs } from "../context/Prefs";
import { t } from "../i18n";

/** Look-aware copy: library swaps scrap→page unit nouns. */
export function useT() {
  const { lang, look } = usePrefs();
  return useCallback(
    (key: string, vars?: Record<string, string | number>) => t(lang, key, vars, look),
    [lang, look],
  );
}
