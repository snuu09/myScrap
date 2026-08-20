(function (global) {
  // Persist adapter. Call sites must use MyScrapStorage only.
  // When js/config.js has a real URL and anon key, scraps go through MyScrapBackend (Supabase).
  // Language and theme always stay on this device.
  const KEYS = {
    lang: "myscrap.lang",
    theme: "myscrap.theme",
    session: "myscrap.session",
    scraps: "myscrap.scraps",
  };
  const BUDGET = 4.2 * 1024 * 1024;
  const MEDIA_TYPES = { image: 1, video: 1, audio: 1 };

  function backend() {
    return global.MyScrapBackend || null;
  }

  function remoteOn() {
    const b = backend();
    return !!(b && b.isActive());
  }

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
    const b = backend();
    if (b && b.isConfigured()) return b.getSession();
    return safeParse(localStorage.getItem(KEYS.session), null);
  }

  function setSession(session) {
    if (remoteOn()) return;
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

  function loadLocal() {
    const list = safeParse(localStorage.getItem(KEYS.scraps), []);
    if (!Array.isArray(list)) return [];
    return list.map(normalizeLoaded);
  }

  function stripForPersist(scrap) {
    const copy = { ...scrap };
    if (copy.ephemeral) {
      copy.dataUrl = "";
      copy.storedMedia = false;
    }
    return copy;
  }

  function estimate(list) {
    return JSON.stringify(list).length;
  }

  function saveLocal(scraps) {
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

  async function ready() {
    const b = backend();
    if (b && b.isConfigured()) await b.init();
  }

  async function loadScraps() {
    if (remoteOn()) return backend().loadScraps();
    return loadLocal();
  }

  async function saveScraps(scraps) {
    if (remoteOn()) return backend().saveScraps(scraps);
    return saveLocal(scraps);
  }

  async function signIn(method) {
    const b = backend();
    if (b && b.isConfigured()) return b.signIn(method);
    return { ok: true, redirect: false, local: true };
  }

  async function signOut() {
    const b = backend();
    if (b && b.isConfigured()) await b.signOut();
    clearSession();
  }

  async function migrateLocalIfNeeded() {
    const b = backend();
    if (b && b.isActive()) return b.migrateLocalIfNeeded();
    return { migrated: false };
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
    ready,
    signIn,
    signOut,
    migrateLocalIfNeeded,
    isConfigured() {
      const b = backend();
      return !!(b && b.isConfigured());
    },
    isRemote: remoteOn,
    onRemoteChange(fn) {
      const b = backend();
      if (b) b.onRemoteChange(fn);
    },
  };
})(window);
