(function (global) {
  const BUCKET = "scrap-media";
  const SIGNED_TTL = 60 * 60;
  const MIGRATE_KEY = "myscrap.migratedUser";
  const LOCAL_SCRAPS = "myscrap.scraps";
  const LOCAL_SESSION = "myscrap.session";

  let client = null;
  let user = null;
  let knownIds = [];
  let fingerprints = {};
  let changeTimer = 0;
  let changeHandler = null;
  let channel = null;
  let readyPromise = null;

  function readConfig() {
    const c = global.MyScrapConfig || {};
    return {
      url: String(c.supabaseUrl || c.url || "").trim(),
      key: String(c.supabaseAnonKey || c.anonKey || "").trim(),
    };
  }

  function isConfigured() {
    const { url, key } = readConfig();
    if (!url || !key) return false;
    if (/YOUR_/i.test(url) || /YOUR_/i.test(key)) return false;
    return /^https:\/\//i.test(url) && key.length > 20;
  }

  function factory() {
    return global.supabase && typeof global.supabase.createClient === "function"
      ? global.supabase.createClient
      : null;
  }

  function isActive() {
    return !!(isConfigured() && client && user);
  }

  function methodFromUser(next) {
    if (!next) return "browse";
    if (next.is_anonymous) return "browse";
    const provider = (next.app_metadata && next.app_metadata.provider) || "";
    if (provider === "apple") return "apple";
    if (provider === "google") return "google";
    const identities = next.identities || [];
    const ident = identities.find((item) => item.provider && item.provider !== "email");
    if (ident && ident.provider === "apple") return "apple";
    if (ident && ident.provider === "google") return "google";
    return "browse";
  }

  function getSession() {
    if (!isActive()) return null;
    return {
      method: methodFromUser(user),
      userId: user.id,
      remote: true,
      enteredAt: Date.now(),
    };
  }

  function redirectTo() {
    return window.location.origin + window.location.pathname;
  }

  function dataUrlToBlob(dataUrl) {
    const parts = String(dataUrl || "").split(",");
    if (parts.length < 2) return null;
    const mime = (parts[0].match(/:(.*?);/) || [])[1] || "application/octet-stream";
    try {
      const bin = atob(parts[1]);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
      return new Blob([arr], { type: mime });
    } catch {
      return null;
    }
  }

  function isHttpUrl(value) {
    return /^https?:\/\//i.test(String(value || ""));
  }

  function isDataUrl(value) {
    return String(value || "").slice(0, 5) === "data:";
  }

  function extFor(scrap, kind) {
    if (kind === "poster") return "jpg";
    const ext = String(scrap.extension || "").replace(/^\./, "");
    if (ext) return ext;
    if (scrap.type === "image") return "jpg";
    if (scrap.type === "video") return "mp4";
    if (scrap.type === "audio") return "mp3";
    return "bin";
  }

  function mediaObjectPath(scrap, kind) {
    const name = kind === "poster" ? "poster.jpg" : "media." + extFor(scrap, kind);
    return user.id + "/" + scrap.id + "/" + name;
  }

  async function signedUrl(path) {
    if (!path) return "";
    const { data, error } = await client.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
    if (error || !data || !data.signedUrl) return "";
    return data.signedUrl;
  }

  async function removeMediaFolder(scrapId) {
    const prefix = user.id + "/" + scrapId;
    const { data } = await client.storage.from(BUCKET).list(prefix);
    if (!data || !data.length) return;
    const paths = data.map((file) => prefix + "/" + file.name);
    await client.storage.from(BUCKET).remove(paths);
  }

  async function uploadDataUrl(scrap, field, kind) {
    const raw = scrap[field];
    if (!isDataUrl(raw)) return scrap[kind === "poster" ? "posterPath" : "mediaPath"] || "";
    const blob = dataUrlToBlob(raw);
    if (!blob) return "";
    const path = mediaObjectPath(scrap, kind);
    const { error } = await client.storage.from(BUCKET).upload(path, blob, {
      upsert: true,
      contentType: blob.type || "application/octet-stream",
    });
    if (error) throw error;
    return path;
  }

  function toRow(scrap) {
    return {
      id: scrap.id,
      user_id: user.id,
      created_at: new Date(scrap.createdAt || Date.now()).toISOString(),
      updated_at: new Date(scrap.updatedAt || scrap.createdAt || Date.now()).toISOString(),
      type: scrap.type || "text",
      tags: Array.isArray(scrap.tags) ? scrap.tags : [],
      title: scrap.title || "",
      body: scrap.text || "",
      url: scrap.url || "",
      filename: scrap.filename || "",
      mime: scrap.mime || "",
      extension: scrap.extension || "",
      size: Number(scrap.size) || 0,
      preview_text: scrap.previewText || "",
      pages: Number(scrap.pages) || 0,
      og: scrap.og || null,
      og_status: scrap.ogStatus || "",
      sample: !!scrap.sample,
      ephemeral: !!scrap.ephemeral,
      stored_media: !!scrap.storedMedia,
      domain: scrap.domain || "",
      error: scrap.error || "",
      memo: scrap.memo || "",
      media_path: scrap.mediaPath || null,
      poster_path: scrap.posterPath || null,
    };
  }

  async function fromRow(row) {
    const dataUrl = await signedUrl(row.media_path);
    const posterUrl = await signedUrl(row.poster_path);
    return {
      id: row.id,
      createdAt: Date.parse(row.created_at) || Date.now(),
      updatedAt: Date.parse(row.updated_at) || Date.now(),
      type: row.type || "text",
      tags: Array.isArray(row.tags) ? row.tags : [],
      title: row.title || "",
      text: row.body || "",
      url: row.url || "",
      filename: row.filename || "",
      mime: row.mime || "",
      extension: row.extension || "",
      size: Number(row.size) || 0,
      dataUrl: dataUrl,
      posterUrl: posterUrl,
      previewText: row.preview_text || "",
      pages: Number(row.pages) || 0,
      og: row.og || null,
      ogStatus: row.og_status || "",
      analyzing: false,
      sample: !!row.sample,
      ephemeral: !!row.ephemeral,
      storedMedia: !!row.stored_media && !!dataUrl,
      domain: row.domain || "",
      error: row.error || "",
      memo: row.memo || "",
      mediaPath: row.media_path || "",
      posterPath: row.poster_path || "",
    };
  }

  function fingerprint(scrap) {
    const copy = {
      id: scrap.id,
      type: scrap.type,
      tags: scrap.tags,
      title: scrap.title,
      text: scrap.text,
      url: scrap.url,
      filename: scrap.filename,
      memo: scrap.memo,
      ogStatus: scrap.ogStatus,
      ogTitle: scrap.og && scrap.og.title,
      storedMedia: scrap.storedMedia,
      mediaPath: scrap.mediaPath,
      posterPath: scrap.posterPath,
      sample: scrap.sample,
    };
    return JSON.stringify(copy);
  }

  async function hydrateList(rows) {
    const list = [];
    for (let i = 0; i < rows.length; i += 1) {
      list.push(await fromRow(rows[i]));
    }
    knownIds = list.map((item) => item.id);
    fingerprints = {};
    list.forEach((item) => {
      fingerprints[item.id] = fingerprint(item);
    });
    return list;
  }

  async function loadScraps() {
    if (!isActive()) return [];
    const { data, error } = await client
      .from("scraps")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return hydrateList(data || []);
  }

  async function prepareScrap(scrap) {
    const next = Object.assign({}, scrap, { updatedAt: scrap.updatedAt || Date.now() });
    try {
      if (isDataUrl(next.dataUrl)) {
        next.mediaPath = await uploadDataUrl(next, "dataUrl", "media");
        next.storedMedia = !!next.mediaPath;
      }
      if (isDataUrl(next.posterUrl)) {
        next.posterPath = await uploadDataUrl(next, "posterUrl", "poster");
      }
    } catch {
      next.storedMedia = false;
      next.error = next.error || "upload";
    }
    return next;
  }

  async function saveScraps(scraps) {
    if (!isActive()) return { ok: false, error: "auth", scraps: null };
    const incoming = Array.isArray(scraps) ? scraps : [];
    const incomingIds = incoming.map((item) => item.id);
    const removed = knownIds.filter((id) => incomingIds.indexOf(id) === -1);
    if (removed.length) {
      const { error: delError } = await client.from("scraps").delete().in("id", removed);
      if (delError) return { ok: false, error: "sync", scraps: null };
      for (let i = 0; i < removed.length; i += 1) {
        await removeMediaFolder(removed[i]);
      }
    }

    const saved = [];
    for (let i = 0; i < incoming.length; i += 1) {
      const item = incoming[i];
      const print = fingerprint(item);
      const changed = fingerprints[item.id] !== print || isDataUrl(item.dataUrl) || isDataUrl(item.posterUrl);
      if (!changed && fingerprints[item.id]) {
        saved.push(item);
        continue;
      }
      const prepared = await prepareScrap(Object.assign({}, item, { updatedAt: Date.now() }));
      const row = toRow(prepared);
      const { error } = await client.from("scraps").upsert(row, { onConflict: "id" });
      if (error) return { ok: false, error: "sync", scraps: null };
      if (prepared.mediaPath) {
        prepared.dataUrl = (await signedUrl(prepared.mediaPath)) || prepared.dataUrl;
      } else if (isHttpUrl(prepared.dataUrl) === false && !isDataUrl(prepared.dataUrl)) {
        prepared.dataUrl = "";
      }
      if (prepared.posterPath) {
        prepared.posterUrl = (await signedUrl(prepared.posterPath)) || prepared.posterUrl;
      }
      fingerprints[prepared.id] = fingerprint(prepared);
      saved.push(prepared);
    }
    knownIds = saved.map((item) => item.id);
    return { ok: true, quota: false, scraps: saved };
  }

  async function migrateLocalIfNeeded() {
    if (!isActive()) return { migrated: false };
    const already = localStorage.getItem(MIGRATE_KEY);
    if (already === user.id) return { migrated: false };
    let local = [];
    try {
      local = JSON.parse(localStorage.getItem(LOCAL_SCRAPS) || "[]");
    } catch {
      local = [];
    }
    if (!Array.isArray(local) || !local.length) {
      localStorage.setItem(MIGRATE_KEY, user.id);
      return { migrated: false };
    }
    const remote = await loadScraps();
    if (remote.length) {
      localStorage.setItem(MIGRATE_KEY, user.id);
      return { migrated: false };
    }
    const result = await saveScraps(local);
    if (result.ok) {
      localStorage.setItem(MIGRATE_KEY, user.id);
      try {
        localStorage.removeItem(LOCAL_SCRAPS);
      } catch {
        /* keep local if quota path fails */
      }
      return { migrated: true, count: local.length };
    }
    return { migrated: false, error: result.error };
  }

  function emitChange() {
    if (!changeHandler) return;
    clearTimeout(changeTimer);
    changeTimer = setTimeout(() => changeHandler(), 250);
  }

  function listenRemote() {
    if (!isActive() || channel) return;
    channel = client
      .channel("scraps-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scraps", filter: "user_id=eq." + user.id },
        emitChange
      )
      .subscribe();
  }

  function dropChannel() {
    if (channel && client) client.removeChannel(channel);
    channel = null;
  }

  async function signIn(method) {
    if (!isConfigured()) return { ok: false, error: "config" };
    await init();
    if (!client) return { ok: false, error: "client" };
    if (method === "browse") {
      const { data, error } = await client.auth.signInAnonymously();
      if (error) return { ok: false, error: error.message || "auth" };
      user = data && data.user ? data.user : user;
      return { ok: true, redirect: false };
    }
    const provider = method === "apple" ? "apple" : "google";
    const { error } = await client.auth.signInWithOAuth({
      provider: provider,
      options: { redirectTo: redirectTo() },
    });
    if (error) return { ok: false, error: error.message || "auth" };
    return { ok: true, redirect: true };
  }

  async function signOut() {
    if (client) {
      dropChannel();
      try {
        await client.auth.signOut();
      } catch {
        /* ignore */
      }
    }
    user = null;
    knownIds = [];
    fingerprints = {};
    try {
      localStorage.removeItem(LOCAL_SESSION);
    } catch {
      /* ignore */
    }
  }

  async function fetchOg(pageUrl) {
    if (!isActive()) return null;
    const { data, error } = await client.functions.invoke("og-preview", {
      body: { url: pageUrl },
    });
    if (error || !data) return null;
    return data;
  }

  async function init() {
    if (readyPromise) return readyPromise;
    readyPromise = (async () => {
      if (!isConfigured()) return;
      const create = factory();
      if (!create) return;
      const { url, key } = readConfig();
      client = create(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      const { data } = await client.auth.getSession();
      user = data && data.session ? data.session.user : null;
      client.auth.onAuthStateChange((_event, session) => {
        user = session ? session.user : null;
        if (user) listenRemote();
        else dropChannel();
      });
      if (user) listenRemote();
    })();
    return readyPromise;
  }

  global.MyScrapBackend = {
    isConfigured,
    isActive,
    init,
    getSession,
    signIn,
    signOut,
    loadScraps,
    saveScraps,
    migrateLocalIfNeeded,
    fetchOg,
    onRemoteChange(fn) {
      changeHandler = fn;
    },
  };
})(window);
