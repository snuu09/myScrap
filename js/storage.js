(function (global) {
  const KEYS = {
    lang: "myscrap.lang",
    theme: "myscrap.theme",
    session: "myscrap.session",
    scraps: "myscrap.scraps",
  };
  const BUDGET = 4.2 * 1024 * 1024;

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

  function loadScraps() {
    const list = safeParse(localStorage.getItem(KEYS.scraps), []);
    return Array.isArray(list) ? list : [];
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
          delete next.dataUrl;
          next.storedMedia = false;
          return next;
        }
        return item;
      });
    }
    try {
      localStorage.setItem(KEYS.scraps, JSON.stringify(payload));
      return { ok: true, quota: estimate(payload) > BUDGET };
    } catch {
      try {
        const slim = payload.map((item) => {
          const next = { ...item };
          delete next.dataUrl;
          delete next.posterUrl;
          delete next.og;
          next.storedMedia = false;
          return next;
        });
        localStorage.setItem(KEYS.scraps, JSON.stringify(slim));
        return { ok: true, quota: true };
      } catch {
        return { ok: false, error: "quota" };
      }
    }
  }

  global.MyScrapStorage = {
    KEYS,
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
