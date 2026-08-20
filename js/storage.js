(function (global) {
  // Persist adapter. Call sites must use MyScrapStorage only; do not read these
  // keys from app.js. Phase 3 (Supabase) replaces this implementation.
  const KEYS = {
    lang: "myscrap.lang",
    theme: "myscrap.theme",
    session: "myscrap.session",
    scraps: "myscrap.scraps",
  };
  const BUDGET = 4.2 * 1024 * 1024;
  const MEDIA_TYPES = { image: 1, video: 1, audio: 1 };

  function safeParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function getLang() {
    const stored = localStorage.getItem(KEYS.lang);
    if (stored === "en" || stored === "ko") return stored;
    const nav = (navigator.language || "").toLowerCase();
    return nav.startsWith("en") ? "en" : "ko";
  }

  function setLang(lang) {
    localStorage.setItem(KEYS.lang, lang === "en" ? "en" : "ko");
  }

  function getTheme() {
    const stored = localStorage.getItem(KEYS.theme);
    if (stored === "light" || stored === "dark") return stored;
    return "system";
  }

  function setTheme(theme) {
    if (theme === "light" || theme === "dark") {
      localStorage.setItem(KEYS.theme, theme);
      return;
    }
    localStorage.removeItem(KEYS.theme);
  }

  function getSession() {
    return safeParse(localStorage.getItem(KEYS.session), null);
  }

  function setSession(session) {
    localStorage.setItem(KEYS.session, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(KEYS.session);
  }

  function normalizeLoaded(item) {
    const next = { ...item };
    if (next.ephemeral) next.storedMedia = false;
    if (MEDIA_TYPES[next.type] && !next.dataUrl) next.storedMedia = false;
    return next;
  }

  function loadScraps() {
    const list = safeParse(localStorage.getItem(KEYS.scraps), []);
    if (!Array.isArray(list)) return [];
    return list.map(normalizeLoaded);
  }

  function stripForPersist(scrap) {
    const copy = { ...scrap };
    if (copy.ephemeral) {
      delete copy.dataUrl;
      copy.storedMedia = false;
    }
    return copy;
  }

  function estimate(list) {
    return JSON.stringify(list).length;
  }

  function saveScraps(scraps) {
    let payload = scraps.map(stripForPersist);
    if (estimate(payload) > BUDGET) {
      payload = payload.map((item) => {
        if (item.dataUrl && item.dataUrl.length > 120000) {
          const next = { ...item };
          next.dataUrl = "";
          next.storedMedia = false;
          return next;
        }
        return item;
      });
    }
    try {
      localStorage.setItem(KEYS.scraps, JSON.stringify(payload));
      return { ok: true, quota: estimate(payload) > BUDGET, scraps: payload };
    } catch {
      try {
        const slim = payload.map((item) => {
          const next = { ...item };
          next.dataUrl = "";
          next.posterUrl = "";
          next.og = null;
          next.storedMedia = false;
          return next;
        });
        localStorage.setItem(KEYS.scraps, JSON.stringify(slim));
        return { ok: true, quota: true, scraps: slim };
      } catch {
        return { ok: false, error: "quota", scraps: null };
      }
    }
  }

  global.MyScrapStorage = {
    getLang,
    setLang,
    getTheme,
    setTheme,
    getSession,
    setSession,
    clearSession,
    loadScraps,
    saveScraps,
  };
})(window);
