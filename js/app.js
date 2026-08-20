(function () {
  const i18n = window.MyScrapI18n;
  const storage = window.MyScrapStorage;
  const tagger = window.MyScrapTagger;
  const og = window.MyScrapOg;
  const preview = window.MyScrapPreview;

  const els = {};
  let lang = "ko";
  let themePref = "system";
  let scraps = [];
  let draft = null;
  let fileQueue = [];
  let menuIndex = 0;
  let reducedMotion = false;
  let mqSmall;
  let mqDark;
  let mqCoarse;
  let typeFilter = "";
  let tagFilter = "";
  let searchQuery = "";
  let peelArmedId = "";
  let peelArmedTimer = 0;
  let leaveArmedTimer = 0;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function t(key, vars) {
    return i18n.t(lang, key, vars);
  }

  function uid() {
    return "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  const SVG_NS = "http://www.w3.org/2000/svg";
  const SVG_TAGS = { svg: 1, path: 1, circle: 1, rect: 1, line: 1 };

  function applyI18n() {
    document.documentElement.lang = lang;
    $all("[data-i18n]").forEach((node) => {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    $all("[data-i18n-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", t(node.getAttribute("data-i18n-placeholder")));
    });
    $all("[data-i18n-aria]").forEach((node) => {
      node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria")));
    });
    $all("[data-lang]").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang ? "true" : "false");
    });
    const session = storage.getSession();
    const chip = els.sessionChip;
    if (session && chip) {
      const method =
        session.method === "apple"
          ? t("sessionApple")
          : session.method === "google"
            ? t("sessionGoogle")
            : t("sessionBrowse");
      chip.textContent = method + " · " + t("headerSession");
      chip.hidden = false;
    } else if (chip) {
      chip.hidden = true;
    }
    syncThemeButtons();
    renderList();
    if (draft) renderDraft();
  }

  function setLang(next) {
    lang = next === "en" ? "en" : "ko";
    storage.setLang(lang);
    applyI18n();
  }

  function resolvedTheme() {
    if (themePref === "light" || themePref === "dark") return themePref;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme() {
    const resolved = resolvedTheme();
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", resolved === "dark" ? "#221e1a" : "#f3eee6");
    syncThemeButtons();
  }

  function syncThemeButtons() {
    $all("[data-theme-choice]").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-theme-choice") === themePref ? "true" : "false");
    });
  }

  function setTheme(next) {
    if (next === "system") themePref = "system";
    else themePref = next === "dark" ? "dark" : "light";
    storage.setTheme(themePref);
    applyTheme();
  }

  function showStatus(message, kind) {
    if (!els.status) return;
    els.status.textContent = message || "";
    els.status.classList.toggle("is-info", kind === "info");
  }

  function persist() {
    const result = storage.saveScraps(scraps);
    if (result.ok && result.scraps) {
      scraps = mergePersisted(scraps, result.scraps);
    }
    if (!result.ok) showStatus(t("errorQuota"));
    else if (result.quota) showStatus(t("errorQuota"), "info");
    return result.ok;
  }

  function mergePersisted(live, saved) {
    const byId = new Map(saved.map((item) => [item.id, item]));
    return live.map((item) => {
      const next = byId.get(item.id);
      if (!next) return item;
      if (item.ephemeral) {
        return Object.assign({}, item, { storedMedia: false });
      }
      return Object.assign({}, item, {
        storedMedia: next.storedMedia !== false,
        dataUrl: next.dataUrl || "",
        posterUrl: next.posterUrl || "",
        og: next.og || null,
      });
    });
  }

  function updateStick() {
    if (!els.sendBtn || !els.input) return;
    els.sendBtn.disabled = !els.input.value.trim();
  }

  function growComposer() {
    if (!els.input) return;
    els.input.style.height = "auto";
    const max = 160;
    const next = Math.min(Math.max(els.input.scrollHeight, 44), max);
    els.input.style.height = next + "px";
    els.input.style.overflowY = els.input.scrollHeight > max ? "auto" : "hidden";
  }

  function isAppOpen() {
    return !els.viewApp.hidden;
  }

  function enterApp(method) {
    storage.setSession({ method: method, enteredAt: Date.now() });
    els.viewLogin.hidden = true;
    els.viewApp.hidden = false;
    els.logoutBtn.hidden = false;
    els.clearBtn.hidden = false;
    applyI18n();
    els.input.focus();
    updateCameraItem();
    updateFab();
    growComposer();
  }

  function resetLeaveArm() {
    if (!els.logoutBtn) return;
    els.logoutBtn.dataset.armed = "0";
    els.logoutBtn.textContent = t("logout");
  }

  function requestLeave() {
    if (!draft) {
      leaveApp();
      return;
    }
    if (els.logoutBtn.dataset.armed === "1") {
      resetLeaveArm();
      leaveApp();
      return;
    }
    els.logoutBtn.dataset.armed = "1";
    els.logoutBtn.textContent = t("leaveDraftConfirm");
    clearTimeout(leaveArmedTimer);
    leaveArmedTimer = setTimeout(resetLeaveArm, 4000);
  }

  function leaveApp() {
    storage.clearSession();
    els.viewApp.hidden = true;
    els.viewLogin.hidden = false;
    els.logoutBtn.hidden = true;
    els.clearBtn.hidden = true;
    closeMenu();
    closeLightbox();
    cancelDraft(true);
    typeFilter = "";
    tagFilter = "";
    searchQuery = "";
    if (els.search) els.search.value = "";
    resetLeaveArm();
    applyI18n();
    updateFab();
  }

  function formatWhen(ts) {
    const delta = Date.now() - ts;
    if (delta < 60 * 1000) return t("justNow");
    if (delta < 60 * 60 * 1000) {
      return t("minutesAgo", { n: Math.max(1, Math.round(delta / 60000)) });
    }
    return new Intl.DateTimeFormat(lang === "en" ? "en" : "ko", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  }

  function cameraAllowed() {
    const coarse = mqCoarse ? mqCoarse.matches : window.matchMedia("(pointer: coarse)").matches;
    const small = mqSmall ? mqSmall.matches : window.matchMedia("(max-width: 720px)").matches;
    return coarse || small;
  }

  function updateCameraItem() {
    $all("[data-camera-only]").forEach((node) => {
      node.hidden = !cameraAllowed();
    });
  }

  function visibleMenuItems() {
    return $all("#add-menu [role='menuitem']").filter((item) => !item.hidden);
  }

  function placeMenu() {
    const rect = els.addBtn.getBoundingClientRect();
    const menuWidth = Math.min(220, window.innerWidth - 24);
    let left = rect.left;
    if (left + menuWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - menuWidth - 12);
    }
    let top = rect.bottom + 8;
    els.addMenu.style.position = "fixed";
    els.addMenu.style.left = left + "px";
    els.addMenu.style.top = top + "px";
    els.addMenu.style.bottom = "auto";
    els.addMenu.style.width = menuWidth + "px";
    requestAnimationFrame(() => {
      const box = els.addMenu.getBoundingClientRect();
      if (box.bottom > window.innerHeight - 12) {
        els.addMenu.style.top = "auto";
        els.addMenu.style.bottom = window.innerHeight - rect.top + 8 + "px";
      }
    });
  }

  function openMenu() {
    els.addMenu.hidden = false;
    els.addBtn.setAttribute("aria-expanded", "true");
    placeMenu();
    const items = visibleMenuItems();
    menuIndex = 0;
    if (items[0]) items[0].focus();
  }

  function closeMenu() {
    els.addMenu.hidden = true;
    els.addBtn.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    if (els.addMenu.hidden) openMenu();
    else closeMenu();
  }

  function createScrap(partial) {
    return {
      id: uid(),
      createdAt: Date.now(),
      type: "text",
      tags: [],
      title: "",
      text: "",
      url: "",
      filename: "",
      mime: "",
      extension: "",
      size: 0,
      dataUrl: "",
      posterUrl: "",
      previewText: "",
      pages: 0,
      og: null,
      ogStatus: "",
      analyzing: false,
      sample: false,
      ephemeral: false,
      storedMedia: true,
      domain: "",
      error: "",
      memo: "",
      ...partial,
    };
  }

  function extraTagsFor(type) {
    if (type === "link") return lang === "en" ? ["reading", "auto"] : ["읽기", "자동분류"];
    return lang === "en" ? ["auto"] : ["자동분류"];
  }

  function mergeTags(scrap) {
    const base = Array.isArray(scrap.tags) ? scrap.tags.slice() : [];
    extraTagsFor(scrap.type).forEach((tag) => {
      if (!base.some((item) => String(item).toLowerCase() === String(tag).toLowerCase())) {
        base.push(tag);
      }
    });
    scrap.tags = base;
  }

  function patchWorking(id, patch) {
    if (draft && draft.id === id) {
      Object.assign(draft, patch);
      renderDraft();
      return;
    }
    updateScrap(id, patch);
  }

  function showDraft(scrap) {
    mergeTags(scrap);
    if (!scrap.memo) scrap.memo = "";
    draft = scrap;
    if (els.draftPanel) els.draftPanel.hidden = false;
    renderDraft();
    if (els.draftPanel) {
      els.draftPanel.scrollIntoView({
        block: "nearest",
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }
  }

  function cancelDraft(silent) {
    draft = null;
    fileQueue = [];
    if (els.draftPanel) {
      els.draftPanel.hidden = true;
      els.draftPanel.replaceChildren();
    }
    if (!silent) showStatus("");
  }

  function saveDraft() {
    if (!draft) return;
    const editing = !!draft.editing;
    const item = Object.assign({}, draft);
    delete item.editing;
    if (!editing) item.createdAt = Date.now();
    draft = null;
    if (els.draftPanel) {
      els.draftPanel.hidden = true;
      els.draftPanel.replaceChildren();
    }
    if (editing) {
      const idx = scraps.findIndex((s) => s.id === item.id);
      if (idx >= 0) scraps[idx] = Object.assign({}, scraps[idx], item);
      else scraps.unshift(item);
      persist();
      renderList();
    } else {
      addScrap(item);
    }
    showStatus("");
    const next = fileQueue.shift();
    if (next) ingestFile(next);
    else if (els.input) els.input.focus();
  }

  function editScrap(id) {
    if (draft) {
      showStatus(t("draftBusy"), "info");
      return;
    }
    const item = scraps.find((s) => s.id === id);
    if (!item) return;
    showDraft(Object.assign({}, item, { editing: true }));
  }

  function inputPreview(item) {
    if (item.url) return item.url;
    if (item.filename) {
      return [item.filename, item.extension ? "." + item.extension.replace(/^\./, "") : "", tagger.formatBytes(item.size)]
        .filter(Boolean)
        .join(" ");
    }
    return item.text || "";
  }

  function renderDraft() {
    if (!els.draftPanel) return;
    if (!draft) {
      els.draftPanel.hidden = true;
      els.draftPanel.replaceChildren();
      return;
    }
    els.draftPanel.hidden = false;
    const type = draft.type || "text";
    const types = ["link", "text", "image", "video", "audio", "document"];
    const detect = t("detected." + type);
    const head = el("div", { class: "draft-head" }, [
      el("div", {}, [
        el("p", { class: "draft-kicker", text: draft.editing ? t("editTitle") : t("classifyTitle") }),
        el("p", { class: "draft-detect", text: detect }),
      ]),
      el("span", { class: "draft-badge", text: t("types." + type) }),
    ]);
    const labelField = el("div", { class: "draft-field" }, [
      el("label", { for: "draft-label", text: t("editLabel") }),
      el(
        "select",
        {
          id: "draft-label",
          class: "draft-select",
          onchange: (ev) => {
            draft.type = ev.target.value;
            if (!draft.tags.includes(draft.type)) draft.tags.unshift(draft.type);
            renderDraft();
          },
        },
        types.map((name) =>
          el("option", { value: name, selected: name === type, text: t("types." + name) })
        )
      ),
    ]);
    const contentField = el("div", { class: "draft-field" }, [
      el("label", { text: t("inputContent") }),
      el("div", { class: "draft-input", text: inputPreview(draft) }),
    ]);
    const previewKids = [];
    const isLink = type === "link" || !!draft.url;
    if (draft.analyzing) {
      previewKids.push(el("p", { class: "muted", text: t("analyzing") }));
      previewKids.push(el("span", { class: "skeleton" }));
    } else if (isLink && draft.ogStatus === "loading") {
      previewKids.push(el("p", { class: "muted", text: t("ogLoading") }));
      previewKids.push(el("span", { class: "skeleton" }));
    } else {
      if (isLink && draft.ogStatus === "error") {
        previewKids.push(
          el("p", { class: "draft-preview-note" }, [
            el("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "aria-hidden": "true" }, [
              el("circle", { cx: "12", cy: "12", r: "9" }),
              el("path", { d: "M12 11v5M12 8h.01" }),
            ]),
            el("span", { text: t("ogRestricted") }),
          ])
        );
      }
      previewKids.push(renderMedia(draft, { preview: true }));
    }
    const previewBlock = el("div", { class: "draft-preview" }, previewKids);
    const tags = el("div", { class: "draft-tags" });
    draft.tags.forEach((tag, index) => {
      const label = t("types." + tag) !== "types." + tag ? t("types." + tag) : tag;
      tags.appendChild(
        el("span", { class: "draft-tag" }, [
          el("span", { text: "#" + label }),
          el(
            "button",
            {
              type: "button",
              "aria-label": t("removeTag"),
              onclick: () => {
                draft.tags = draft.tags.filter((_, i) => i !== index);
                renderDraft();
              },
            },
            [
              el("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "aria-hidden": "true" }, [
                el("path", { d: "M6 6l12 12M18 6L6 18" }),
              ]),
            ]
          ),
        ])
      );
    });
    tags.appendChild(
      el("input", {
        class: "draft-tag-add",
        type: "text",
        "aria-label": t("addTag"),
        placeholder: t("addTagPlaceholder"),
        onkeydown: (ev) => {
          if (ev.key !== "Enter") return;
          ev.preventDefault();
          const value = ev.target.value.trim().replace(/^#/, "");
          if (!value) return;
          if (!draft.tags.includes(value)) draft.tags.push(value);
          renderDraft();
        },
      })
    );
    const tagField = el("div", { class: "draft-field" }, [
      el("label", { text: t("suggestedTags") }),
      tags,
    ]);
    const memoField = el("div", { class: "draft-field" }, [
      el(
        "textarea",
        {
          class: "draft-memo",
          rows: 3,
          placeholder: t("memoPlaceholder"),
          "aria-label": t("memoPlaceholder"),
          text: draft.memo || "",
          oninput: (ev) => {
            draft.memo = ev.target.value;
          },
        }
      ),
    ]);
    const actions = el("div", { class: "draft-actions" }, [
      el("button", { type: "button", class: "draft-cancel", text: t("cancel"), onclick: () => cancelDraft() }),
      el("button", { type: "button", class: "draft-save", text: t("save"), onclick: saveDraft }),
    ]);
    els.draftPanel.replaceChildren(head, labelField, contentField, previewBlock, tagField, memoField, actions);
  }

  function addScrap(scrap) {
    scraps.unshift(scrap);
    persist();
    renderList();
    return scrap;
  }

  function updateScrap(id, patch) {
    const item = scraps.find((s) => s.id === id);
    if (!item) return;
    Object.assign(item, patch);
    persist();
    renderList();
  }

  function removeScrap(id) {
    scraps = scraps.filter((s) => s.id !== id);
    persist();
    renderList();
  }

  function fileTooLarge(file) {
    return file && file.size > 12 * 1024 * 1024;
  }

  async function ingestText(text) {
    const value = String(text || "").trim();
    if (!value) return;
    if (draft) {
      showStatus(t("draftBusy"), "info");
      return false;
    }
    const analyzed = tagger.analyzeText(value);
    const scrap = createScrap({
      type: analyzed.type,
      tags: analyzed.tags,
      text: analyzed.text,
      url: analyzed.url,
      domain: analyzed.domain,
      ogStatus: analyzed.type === "link" || analyzed.url ? "loading" : "",
    });
    showDraft(scrap);
    if (scrap.url) hydrateOg(scrap.id, scrap.url);
    return true;
  }

  async function ingestFile(file) {
    if (!file) return;
    if (draft) {
      fileQueue.push(file);
      showStatus(t("queued", { n: fileQueue.length }), "info");
      return;
    }
    const analyzed = tagger.analyzeFile(file);
    const scrap = createScrap({
      type: analyzed.type,
      tags: analyzed.tags,
      filename: analyzed.filename,
      mime: analyzed.mime,
      extension: analyzed.extension,
      size: analyzed.size,
      title: analyzed.filename,
      analyzing: true,
      ephemeral: fileTooLarge(file),
    });
    showDraft(scrap);
    showStatus(t("analyzing"), "info");
    try {
      let dataUrl = "";
      if (analyzed.type === "image") {
        dataUrl = await preview.compressImage(file);
      } else {
        dataUrl = await preview.readFileAsDataUrl(file);
      }
      const patch = {
        analyzing: false,
        dataUrl: dataUrl,
        storedMedia: !scrap.ephemeral,
      };
      if (analyzed.type === "video" && dataUrl) {
        patch.posterUrl = await preview.captureVideoPoster(dataUrl);
      }
      if (analyzed.type === "document" && dataUrl) {
        const doc = await preview.previewDocument(file, dataUrl);
        if (doc.kind === "pdf") {
          patch.posterUrl = doc.dataUrl;
          patch.pages = doc.pages;
        } else if (doc.kind === "text") {
          patch.previewText = doc.text;
        } else {
          patch.error = "doc";
        }
      }
      patchWorking(scrap.id, patch);
      showStatus(fileQueue.length ? t("queued", { n: fileQueue.length }) : "");
    } catch (err) {
      patchWorking(scrap.id, { analyzing: false, error: "file" });
      showStatus(t("errorFile"));
    }
  }

  async function hydrateOg(id, url) {
    const result = await og.fetchOg(url);
    const patch = {
      og: result.data,
      ogStatus: result.ok ? "ok" : "error",
      title: result.data && result.data.title ? result.data.title : "",
    };
    if (draft && draft.id === id) {
      if (!patch.title) patch.title = draft.title;
      patchWorking(id, patch);
      return;
    }
    const item = scraps.find((s) => s.id === id);
    if (!item) return;
    updateScrap(id, {
      og: result.data,
      ogStatus: result.ok ? "ok" : "error",
      title: (result.data && result.data.title) || item.title,
    });
  }

  function handleClipboardData(data) {
    if (!data) return false;
    const files = data.files ? Array.from(data.files) : [];
    const items = data.items ? Array.from(data.items) : [];
    let used = false;
    if (files.length) {
      ingestFile(files[0]);
      files.slice(1).forEach((file) => fileQueue.push(file));
      if (files.length > 1) showStatus(t("queued", { n: files.length - 1 }), "info");
      used = true;
    } else {
      items.forEach((item) => {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            ingestFile(file);
            used = true;
          }
        }
      });
    }
    const text = data.getData && data.getData("text/plain");
    if (text && text.trim() && !used) {
      ingestText(text);
      used = true;
    }
    return used;
  }

  async function fromClipboardButton() {
    closeMenu();
    if (navigator.clipboard && navigator.clipboard.read) {
      try {
        const items = await navigator.clipboard.read();
        let used = false;
        for (const item of items) {
          const types = item.types || [];
          const imageType = types.find((type) => type.startsWith("image/"));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], "clipboard.png", { type: blob.type || "image/png" });
            ingestFile(file);
            used = true;
            continue;
          }
          if (types.includes("text/plain")) {
            const blob = await item.getType("text/plain");
            const text = await blob.text();
            if (text.trim()) {
              ingestText(text);
              used = true;
            }
          }
        }
        if (!used) showStatus(t("clipboardEmpty"), "info");
        return;
      } catch (err) {
        if (err && err.name === "NotAllowedError") {
          showStatus(t("clipboardDenied"));
          return;
        }
      }
    }
    if (navigator.clipboard && navigator.clipboard.readText) {
      try {
        const text = await navigator.clipboard.readText();
        if (text.trim()) ingestText(text);
        else showStatus(t("clipboardEmpty"), "info");
        return;
      } catch {
        showStatus(t("clipboardDenied"));
        return;
      }
    }
    showStatus(t("clipboardUnsupported"), "info");
  }

  function sampleSvg(label, fill) {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">' +
      '<rect width="640" height="400" fill="' +
      fill +
      '"/>' +
      '<text x="40" y="210" fill="#f4f7fb" font-size="42" font-family="sans-serif">' +
      label +
      "</text></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function loadSamples() {
    const existing = scraps.filter((s) => s.sample);
    if (existing.length) {
      scraps = scraps.filter((s) => !s.sample);
      persist();
      renderList();
      return;
    }
    const note = createScrap({
      type: "text",
      tags: ["text"],
      text:
        lang === "en"
          ? "Bus number I keep forgetting, and the bakery with the late window."
          : "자주 잊어버리는 버스 번호, 늦게까지 불 켜진 빵집.",
      sample: true,
    });
    const link = createScrap({
      type: "link",
      tags: ["link", "wikipedia.org"],
      url: "https://www.wikipedia.org/",
      domain: "wikipedia.org",
      ogStatus: "loading",
      sample: true,
    });
    const photo = createScrap({
      type: "image",
      tags: ["image"],
      filename: "window.svg",
      dataUrl: sampleSvg(lang === "en" ? "window light" : "창가 빛", "#e56f0a"),
      sample: true,
    });
    scraps.unshift(photo, link, note);
    persist();
    renderList();
    hydrateOg(link.id, link.url);
  }

  function el(tag, attrs, kids) {
    const node = SVG_TAGS[tag]
      ? document.createElementNS(SVG_NS, tag)
      : document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((key) => {
        const value = attrs[key];
        if (value == null || value === false) return;
        if (key === "class") node.setAttribute("class", value);
        else if (key === "text") node.textContent = value;
        else if (key.slice(0, 2) === "on") node.addEventListener(key.slice(2), value);
        else if (key === "dataset") {
          Object.keys(value).forEach((d) => {
            node.dataset[d] = value[d];
          });
        } else node.setAttribute(key, value === true ? "" : String(value));
      });
    }
    (kids || []).forEach((child) => {
      if (child) node.appendChild(child);
    });
    return node;
  }

  function bindHoverMedia(wrap, media) {
    const play = () => {
      const p = media.play();
      if (p && p.catch) p.catch(() => {});
    };
    const stop = () => {
      media.pause();
      try {
        media.currentTime = 0;
      } catch {
        /* ignore */
      }
    };
    wrap.addEventListener("pointerenter", () => {
      if (reducedMotion) return;
      play();
    });
    wrap.addEventListener("pointerleave", stop);
    wrap.addEventListener("click", (ev) => {
      if (ev.target.closest("a,button")) return;
      if (media.paused) play();
      else stop();
    });
  }

  function mediaMissing(item) {
    if (item.analyzing) return false;
    if (item.type === "image" || item.type === "video" || item.type === "audio") {
      return !item.dataUrl;
    }
    if (item.type === "document") {
      return !item.dataUrl && !item.posterUrl && !item.previewText && item.storedMedia === false;
    }
    return false;
  }

  function missingMediaSlip(item) {
    const name = item.filename || t("types." + (item.type || "document"));
    const meta = [item.extension, item.size ? tagger.formatBytes(item.size) : ""]
      .filter(Boolean)
      .join(" · ");
    const note = item.ephemeral ? t("mediaSessionOnly") : t("mediaDropped");
    return el("div", { class: "media-missing" }, [
      el("strong", { text: name }),
      meta ? el("p", { class: "muted", text: meta }) : null,
      el("p", { class: "muted", text: note }),
    ]);
  }

  function openLightbox(item) {
    if (!item || !item.dataUrl || !els.lightbox || !els.lightboxImage) return;
    els.lightboxImage.src = item.dataUrl;
    els.lightboxImage.alt = item.filename || t("types.image");
    els.lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    if (els.lightboxClose) els.lightboxClose.focus();
  }

  function closeLightbox() {
    if (!els.lightbox) return;
    els.lightbox.hidden = true;
    if (els.lightboxImage) {
      els.lightboxImage.removeAttribute("src");
      els.lightboxImage.alt = "";
    }
    document.body.style.overflow = "";
  }

  function copyLink(url) {
    const value = String(url || "");
    if (!value) return;
    const done = () => showStatus(t("copied"), "info");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(() => {
        showStatus(value, "info");
      });
      return;
    }
    showStatus(value, "info");
  }

  function saveFile(item) {
    if (!item || !item.dataUrl) return;
    const a = document.createElement("a");
    a.href = item.dataUrl;
    a.download = item.filename || "scrap";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function renderMedia(item, opts) {
    const interactive = !(opts && opts.preview);
    if (mediaMissing(item)) return missingMediaSlip(item);
    if (item.type === "image" && item.dataUrl) {
      return el(
        "div",
        {
          class: "media-frame photo",
          onclick: interactive
            ? () => {
                openLightbox(item);
              }
            : undefined,
        },
        [el("img", { src: item.dataUrl, alt: item.filename || t("types.image") })]
      );
    }
    if (item.type === "video" && item.dataUrl) {
      const video = el("video", {
        src: item.dataUrl,
        poster: item.posterUrl || "",
        playsinline: true,
        muted: true,
        loop: true,
        preload: "metadata",
      });
      const wrap = el("div", { class: "media-frame" }, [
        video,
        el("span", { class: "play-badge", text: t("videoHint") }),
      ]);
      bindHoverMedia(wrap, video);
      return wrap;
    }
    if (item.type === "audio" && item.dataUrl) {
      const audio = el("audio", {
        src: item.dataUrl,
        preload: "metadata",
      });
      const wrap = el("div", { class: "audio-row" }, [
        el("div", { class: "audio-art", "aria-hidden": "true" }),
        el("div", {}, [
          el("strong", { text: item.filename || t("types.audio") }),
          el("p", { class: "muted", text: t("audioHint") }),
          audio,
        ]),
      ]);
      bindHoverMedia(wrap, audio);
      return wrap;
    }
    if (item.type === "document") {
      const kids = [];
      kids.push(el("p", { class: "doc-title", text: item.filename || t("types.document") }));
      if (item.analyzing) {
        kids.push(el("span", { class: "skeleton", text: " " }));
        kids.push(el("p", { class: "muted", text: t("pdfLoading") }));
      } else if (item.posterUrl) {
        kids.push(
          el("div", { class: "doc-page" }, [
            el("img", { src: item.posterUrl, alt: item.filename || t("types.document") }),
          ])
        );
        if (item.pages) {
          kids.push(el("p", { class: "muted", text: String(item.pages) }));
        }
      } else if (item.previewText) {
        kids.push(el("pre", { class: "doc-excerpt", text: item.previewText }));
      } else {
        kids.push(el("p", { class: "muted", text: t("docPreviewFail") }));
      }
      kids.push(
        el("p", {
          class: "muted",
          text: [item.extension, tagger.formatBytes(item.size)].filter(Boolean).join(" · "),
        })
      );
      return el("div", {}, kids);
    }
    if (item.type === "link" || item.url) {
      return renderOg(item);
    }
    return el("p", { class: "scrap-text", text: item.text || "" });
  }

  function renderOg(item) {
    if (item.ogStatus === "loading") {
      return el("div", {}, [
        item.text && item.type === "text" ? el("p", { class: "scrap-text", text: item.text }) : null,
        el("p", { class: "muted", text: t("ogLoading") }),
        el("span", { class: "skeleton" }),
      ]);
    }
    const data = item.og || og.parseUrlFallback(item.url);
    const hasImage = !!(data && data.image);
    const card = el("div", { class: "og-card" + (hasImage ? "" : " has-no-image") });
    if (hasImage) {
      const img = el("img", {
        class: "og-image",
        src: data.image,
        alt: "",
        referrerpolicy: "no-referrer",
      });
      img.addEventListener("error", () => img.remove());
      card.appendChild(img);
    }
    const meta = el("div", { class: "og-meta" }, [
      el("h3", { text: data.title || data.siteName || item.url }),
      data.description ? el("p", { text: data.description }) : null,
      el(
        "p",
        {},
        [
          el("a", {
            href: item.url,
            target: "_blank",
            rel: "noopener noreferrer",
            text: data.siteName || item.url,
          }),
        ]
      ),
    ]);
    card.appendChild(meta);
    if (item.ogStatus === "error") {
      return el("div", {}, [
        item.text && item.type === "text" ? el("p", { class: "scrap-text", text: item.text }) : null,
        el("p", { class: "muted", text: t("ogError") }),
        card,
      ]);
    }
    if (item.text && item.type === "text") {
      return el("div", {}, [el("p", { class: "scrap-text", text: item.text }), card]);
    }
    return card;
  }

  function visibleScraps() {
    const q = searchQuery.trim().toLowerCase();
    return scraps.filter((item) => {
      if (typeFilter && item.type !== typeFilter) return false;
      if (tagFilter) {
        const wanted = String(tagFilter).toLowerCase();
        const tags = Array.isArray(item.tags) ? item.tags : [];
        if (!tags.some((tag) => String(tag).toLowerCase() === wanted)) return false;
      }
      if (!q) return true;
      const hay = [
        item.title,
        item.text,
        item.filename,
        item.url,
        item.memo,
        item.domain,
        ...(item.tags || []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  function setTypeFilter(next) {
    typeFilter = next || "";
    renderList();
  }

  function setTagFilter(tag) {
    tagFilter = tag || "";
    renderList();
  }

  function clearFilters() {
    typeFilter = "";
    tagFilter = "";
    searchQuery = "";
    if (els.search) els.search.value = "";
    renderList();
  }

  function tagLabel(tag) {
    const key = "types." + tag;
    const translated = t(key);
    return translated !== key ? translated : tag;
  }

  function renderListTools() {
    if (!els.listTools || !els.typeChips) return;
    const hasAny = scraps.length > 0;
    els.listTools.hidden = !hasAny;
    if (!hasAny) return;
    const types = ["", "text", "image", "video", "audio", "link", "document"];
    els.typeChips.replaceChildren(
      ...types.map((name) =>
        el("button", {
          type: "button",
          "aria-pressed": (name || "") === typeFilter ? "true" : "false",
          text: name ? t("types." + name) : t("filterAll"),
          onclick: () => setTypeFilter(name),
        })
      )
    );
    if (els.tagFilterBar) {
      if (!tagFilter) {
        els.tagFilterBar.hidden = true;
        els.tagFilterBar.replaceChildren();
      } else {
        els.tagFilterBar.hidden = false;
        els.tagFilterBar.replaceChildren(
          el("span", { text: t("filterTag", { tag: tagLabel(tagFilter) }) }),
          el("button", { type: "button", text: t("clearFilter"), onclick: () => setTagFilter("") })
        );
      }
    }
  }

  function scrapActions(item) {
    const kids = [];
    if (item.url) {
      kids.push(
        el("button", {
          type: "button",
          class: "text-btn",
          text: t("copyLink"),
          onclick: () => copyLink(item.url),
        })
      );
    }
    if (item.dataUrl && item.storedMedia !== false) {
      kids.push(
        el("button", {
          type: "button",
          class: "text-btn",
          text: t("saveFile"),
          onclick: () => saveFile(item),
        })
      );
    }
    if (!kids.length) return null;
    return el("div", { class: "scrap-actions" }, kids);
  }

  function requestPeel(id) {
    if (peelArmedId === id) {
      peelArmedId = "";
      clearTimeout(peelArmedTimer);
      removeScrap(id);
      return;
    }
    peelArmedId = id;
    clearTimeout(peelArmedTimer);
    peelArmedTimer = setTimeout(() => {
      peelArmedId = "";
      renderList();
    }, 4000);
    renderList();
  }

  function renderList() {
    if (!els.list) return;
    renderListTools();
    const hasAny = scraps.length > 0;
    const shown = visibleScraps();
    const filteredOut = hasAny && shown.length === 0;
    els.empty.hidden = hasAny || !!draft;
    if (els.filterEmpty) els.filterEmpty.hidden = !filteredOut;
    els.list.hidden = !shown.length;
    const sampleBtn = $("[data-action='samples']");
    if (sampleBtn) {
      const hasSamples = scraps.some((s) => s.sample);
      sampleBtn.textContent = hasSamples ? t("hideSamples") : t("loadSamples");
      sampleBtn.hidden = hasAny && !hasSamples;
    }
    els.list.replaceChildren();
    shown.forEach((item) => {
      const tags = el("div", { class: "tags" });
      item.tags.forEach((tag) => {
        tags.appendChild(
          el("button", {
            type: "button",
            class: "tag",
            text: tagLabel(tag),
            "aria-pressed": tagFilter && String(tag).toLowerCase() === String(tagFilter).toLowerCase() ? "true" : "false",
            onclick: () => setTagFilter(tag),
          })
        );
      });
      if (item.sample) {
        tags.appendChild(el("span", { class: "tag sample-tag", text: t("sample") }));
      }
      const peeling = peelArmedId === item.id;
      const li = el("li", { class: "scrap is-" + item.type, dataset: { id: item.id } }, [
        el("span", { class: "magnet-dot", "aria-hidden": "true" }),
        el("article", { class: "scrap-body" }, [
          el("div", { class: "scrap-head" }, [
            tags,
            el("time", { class: "time", datetime: new Date(item.createdAt).toISOString(), text: formatWhen(item.createdAt) }),
            el("div", { class: "scrap-head-actions" }, [
              el(
                "button",
                {
                  type: "button",
                  class: "icon-tiny",
                  "aria-label": t("editItem"),
                  onclick: () => editScrap(item.id),
                },
                [
                  el("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "aria-hidden": "true" }, [
                    el("path", { d: "M4 20h4l10-10-4-4L4 16v4z" }),
                    el("path", { d: "M14 6l4 4" }),
                  ]),
                ]
              ),
              el(
                "button",
                {
                  type: "button",
                  class: "icon-tiny" + (peeling ? " is-armed" : ""),
                  "aria-label": peeling ? t("peelConfirm") : t("deleteItem"),
                  title: peeling ? t("peelConfirm") : t("deleteItem"),
                  onclick: () => requestPeel(item.id),
                },
                [
                  el("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "aria-hidden": "true" }, [
                    el("path", { d: "M6 6l12 12M18 6L6 18" }),
                  ]),
                ]
              ),
            ]),
          ]),
          renderMedia(item),
          item.memo ? el("p", { class: "scrap-memo", text: item.memo }) : null,
          scrapActions(item),
        ]),
      ]);
      els.list.appendChild(li);
    });
  }

  function onSubmit(ev) {
    ev.preventDefault();
    const value = (els.input.value || "").trim();
    if (!value) {
      updateStick();
      return;
    }
    if (draft) {
      showStatus(t("draftBusy"), "info");
      return;
    }
    els.input.value = "";
    updateStick();
    growComposer();
    ingestText(value);
  }

  function onPaste(ev) {
    if (!isAppOpen()) return;
    const data = ev.clipboardData;
    if (!data) return;
    const hasFile = (data.files && data.files.length) || Array.from(data.items || []).some((it) => it.kind === "file");
    if (hasFile) {
      ev.preventDefault();
      handleClipboardData(data);
      return;
    }
    if (document.activeElement !== els.input) {
      const text = data.getData("text/plain");
      if (text && text.trim()) {
        ev.preventDefault();
        ingestText(text);
      }
    }
  }

  function onDrop(ev) {
    ev.preventDefault();
    els.composer.classList.remove("is-drop");
    const files = ev.dataTransfer && ev.dataTransfer.files;
    if (files && files.length) {
      Array.from(files).forEach((file) => ingestFile(file));
      return;
    }
    const text = ev.dataTransfer && ev.dataTransfer.getData("text/plain");
    if (text) ingestText(text);
  }

  function updateFab() {
    if (!els.toTop) return;
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    els.toTop.hidden = !isAppOpen() || y < 80;
  }

  function confirmClear() {
    if (els.clearBtn.dataset.armed === "1") {
      cancelDraft(true);
      scraps = [];
      persist();
      renderList();
      els.clearBtn.dataset.armed = "0";
      els.clearBtn.textContent = t("clear");
      return;
    }
    els.clearBtn.dataset.armed = "1";
    els.clearBtn.textContent = draft ? t("clearDraftConfirm") : t("clearConfirm");
    setTimeout(() => {
      if (els.clearBtn.dataset.armed === "1") {
        els.clearBtn.dataset.armed = "0";
        els.clearBtn.textContent = t("clear");
      }
    }, 4000);
  }

  function cacheEls() {
    els.viewLogin = $("#view-login");
    els.viewApp = $("#view-app");
    els.logoutBtn = $("[data-action='logout']");
    els.clearBtn = $("[data-action='clear']");
    els.sessionChip = $("[data-session-label]");
    els.composer = $("#composer");
    els.input = $("#composer-input");
    els.addBtn = $("#add-btn");
    els.addMenu = $("#add-menu");
    els.list = $("#scrap-list");
    els.empty = $("#empty-state");
    els.status = $("#status-line");
    els.draftPanel = $("#draft-panel");
    els.toTop = $("#to-top");
    els.filePhoto = $("#file-photo");
    els.fileCamera = $("#file-camera");
    els.fileAny = $("#file-any");
    els.sendBtn = $("#send-btn");
    els.listTools = $("#list-tools");
    els.search = $("#scrap-search");
    els.typeChips = $("#type-chips");
    els.tagFilterBar = $("#tag-filter-bar");
    els.filterEmpty = $("#filter-empty");
    els.lightbox = $("#lightbox");
    els.lightboxClose = $("#lightbox-close");
    els.lightboxImage = $("#lightbox-image");
  }

  function bind() {
    $all("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
    });
    $all("[data-theme-choice]").forEach((btn) => {
      btn.addEventListener("click", () => setTheme(btn.getAttribute("data-theme-choice")));
    });
    $all("[data-auth]").forEach((btn) => {
      btn.addEventListener("click", () => enterApp(btn.getAttribute("data-auth")));
    });
    els.logoutBtn.addEventListener("click", requestLeave);
    els.clearBtn.addEventListener("click", confirmClear);
    els.composer.addEventListener("submit", onSubmit);
    els.addBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      toggleMenu();
    });
    els.addMenu.addEventListener("click", (ev) => {
      const item = ev.target.closest("[data-action]");
      if (!item) return;
      const action = item.getAttribute("data-action");
      if (action === "clipboard") fromClipboardButton();
      if (action === "camera") {
        closeMenu();
        els.fileCamera.click();
      }
      if (action === "photo") {
        closeMenu();
        els.filePhoto.click();
      }
      if (action === "file") {
        closeMenu();
        els.fileAny.click();
      }
    });
    document.addEventListener("click", (ev) => {
      if (!els.addMenu.hidden && !ev.target.closest(".add-wrap")) closeMenu();
    });
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        if (els.lightbox && !els.lightbox.hidden) {
          closeLightbox();
          return;
        }
        closeMenu();
      }
      if (!els.addMenu.hidden && (ev.key === "ArrowDown" || ev.key === "ArrowUp")) {
        ev.preventDefault();
        const items = visibleMenuItems();
        if (!items.length) return;
        menuIndex = ev.key === "ArrowDown" ? menuIndex + 1 : menuIndex - 1;
        if (menuIndex < 0) menuIndex = items.length - 1;
        if (menuIndex >= items.length) menuIndex = 0;
        items[menuIndex].focus();
      }
    });
    els.input.addEventListener("input", () => {
      updateStick();
      growComposer();
    });
    els.input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        els.composer.requestSubmit();
      }
    });
    ["dragenter", "dragover"].forEach((name) => {
      els.composer.addEventListener(name, (ev) => {
        ev.preventDefault();
        els.composer.classList.add("is-drop");
      });
    });
    ["dragleave", "drop"].forEach((name) => {
      els.composer.addEventListener(name, (ev) => {
        if (name === "dragleave" && ev.target !== els.composer) return;
        els.composer.classList.remove("is-drop");
      });
    });
    els.composer.addEventListener("drop", onDrop);
    document.addEventListener("paste", onPaste);
    [els.filePhoto, els.fileCamera, els.fileAny].forEach((input) => {
      input.addEventListener("change", () => {
        Array.from(input.files || []).forEach((file) => ingestFile(file));
        input.value = "";
      });
    });
    $("[data-action='samples']").addEventListener("click", loadSamples);
    if (els.search) {
      els.search.addEventListener("input", () => {
        searchQuery = els.search.value;
        renderList();
      });
    }
    const clearFiltersBtn = $("[data-action='clear-filters']");
    if (clearFiltersBtn) clearFiltersBtn.addEventListener("click", clearFilters);
    if (els.lightbox) {
      els.lightbox.addEventListener("click", (ev) => {
        if (ev.target === els.lightbox) closeLightbox();
      });
    }
    if (els.lightboxClose) els.lightboxClose.addEventListener("click", closeLightbox);
    els.toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));
    window.addEventListener("scroll", updateFab, { passive: true });
    const onViewportChange = () => {
      updateCameraItem();
      updateFab();
      if (els.addMenu && !els.addMenu.hidden) placeMenu();
    };
    window.addEventListener("resize", onViewportChange);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onViewportChange);
    }
    mqSmall = window.matchMedia("(max-width: 720px)");
    mqCoarse = window.matchMedia("(pointer: coarse)");
    mqDark = window.matchMedia("(prefers-color-scheme: dark)");
    const listenMq = (mq, fn) => {
      if (mq.addEventListener) mq.addEventListener("change", fn);
      else if (mq.addListener) mq.addListener(fn);
    };
    listenMq(mqSmall, onViewportChange);
    listenMq(mqCoarse, updateCameraItem);
    listenMq(mqDark, () => {
      if (themePref === "system") applyTheme();
    });
  }

  function init() {
    cacheEls();
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lang = storage.getLang();
    themePref = storage.getTheme();
    scraps = storage.loadScraps();
    bind();
    applyTheme();
    applyI18n();
    updateStick();
    growComposer();
    updateCameraItem();
    if (storage.getSession()) enterApp(storage.getSession().method);
    else {
      els.viewLogin.hidden = false;
      els.viewApp.hidden = true;
    }
    updateFab();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
