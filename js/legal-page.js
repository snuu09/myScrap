(function () {
  function take(key, legacy) {
    try {
      const next = localStorage.getItem(key);
      if (next != null) return next;
      const prev = localStorage.getItem(legacy);
      if (prev != null) {
        localStorage.setItem(key, prev);
        return prev;
      }
    } catch (e) {}
    return null;
  }

  function bootChrome() {
    try {
      const stored = take("mybrary.theme", "myscrap.theme");
      const dark =
        stored === "dark" ||
        (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
      const palette = take("mybrary.palette", "myscrap.palette");
      if (palette === "basalt" || palette === "ai") {
        document.documentElement.setAttribute("data-palette", palette);
      }
    } catch (e) {}
  }

  function lang() {
    try {
      return take("mybrary.lang", "myscrap.lang") === "en" ? "en" : "ko";
    } catch (e) {
      return "ko";
    }
  }

  function apply() {
    const current = lang();
    const i18n = window.MybraryI18n;
    document.documentElement.lang = current;
    if (i18n) {
      const page = /privacy\.html/.test(location.pathname) ? "privacy" : "terms";
      document.title = i18n.t(current, page) + " · " + i18n.t(current, "appName");
      document.querySelectorAll("[data-i18n]").forEach((node) => {
        node.textContent = i18n.t(current, node.getAttribute("data-i18n"));
      });
      document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
        node.setAttribute("aria-label", i18n.t(current, node.getAttribute("data-i18n-aria")));
      });
    }
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === current ? "true" : "false");
    });
    document.querySelectorAll(".legal-copy").forEach((block) => {
      block.hidden = block.getAttribute("data-legal-lang") !== current;
    });
    if (window.MybraryLegal) window.MybraryLegal.fill(document, current);
  }

  bootChrome();
  document.addEventListener("DOMContentLoaded", () => {
    apply();
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => {
        try {
          localStorage.setItem("mybrary.lang", btn.getAttribute("data-lang"));
        } catch (e) {}
        apply();
      });
    });
  });
})();
