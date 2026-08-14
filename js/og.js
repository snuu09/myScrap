(function (global) {
  function timeout(ms) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    return { signal: ctrl.signal, cancel: () => clearTimeout(id) };
  }

  function parseUrlFallback(pageUrl) {
    try {
      const u = new URL(pageUrl);
      return {
        title: u.hostname.replace(/^www\./, ""),
        description: u.pathname === "/" ? u.hostname : u.pathname,
        image: "",
        siteName: u.hostname.replace(/^www\./, ""),
        favicon: u.origin + "/favicon.ico",
        url: u.href,
      };
    } catch {
      return {
        title: pageUrl,
        description: "",
        image: "",
        siteName: "",
        favicon: "",
        url: pageUrl,
      };
    }
  }

  function absUrl(maybe, base) {
    if (!maybe) return "";
    try {
      return new URL(maybe, base).href;
    } catch {
      return maybe;
    }
  }

  function parseOgHtml(html, pageUrl) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const prop = (name) =>
      doc.querySelector(`meta[property="${name}"]`)?.getAttribute("content") ||
      doc.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ||
      "";
    const icon =
      doc.querySelector('link[rel="icon"]')?.getAttribute("href") ||
      doc.querySelector('link[rel="shortcut icon"]')?.getAttribute("href") ||
      "";
    const title =
      prop("og:title") ||
      doc.querySelector("title")?.textContent?.trim() ||
      "";
    return {
      title,
      description: prop("og:description") || prop("description"),
      image: absUrl(prop("og:image"), pageUrl),
      siteName: prop("og:site_name") || parseUrlFallback(pageUrl).siteName,
      favicon: absUrl(icon, pageUrl) || parseUrlFallback(pageUrl).favicon,
      url: prop("og:url") || pageUrl,
    };
  }

  async function fetchMicrolink(pageUrl, signal) {
    const endpoint =
      "https://api.microlink.io/?url=" + encodeURIComponent(pageUrl);
    const res = await fetch(endpoint, { signal });
    if (!res.ok) throw new Error("microlink " + res.status);
    const json = await res.json();
    if (json.status !== "success" || !json.data) throw new Error("microlink empty");
    const d = json.data;
    const image =
      (d.image && (d.image.url || d.image)) ||
      (d.logo && (d.logo.url || d.logo)) ||
      "";
    return {
      title: d.title || "",
      description: d.description || "",
      image: typeof image === "string" ? image : "",
      siteName: d.publisher || d.author || parseUrlFallback(pageUrl).siteName,
      favicon: (d.logo && d.logo.url) || "",
      url: d.url || pageUrl,
    };
  }

  async function fetchHtmlViaProxy(proxyUrl, signal) {
    const res = await fetch(proxyUrl, { signal });
    if (!res.ok) throw new Error("proxy " + res.status);
    return res.text();
  }

  async function fetchOg(pageUrl) {
    const fallback = parseUrlFallback(pageUrl);
    const clock = timeout(9000);
    try {
      try {
        const data = await fetchMicrolink(pageUrl, clock.signal);
        if (data.title || data.image || data.description) {
          clock.cancel();
          return { ok: true, data: { ...fallback, ...data } };
        }
      } catch {
        /* next proxy */
      }

      const proxies = [
        "https://corsproxy.io/?" + encodeURIComponent(pageUrl),
        "https://api.allorigins.win/raw?url=" + encodeURIComponent(pageUrl),
      ];
      for (const proxy of proxies) {
        try {
          const html = await fetchHtmlViaProxy(proxy, clock.signal);
          const data = parseOgHtml(html, pageUrl);
          if (data.title || data.image || data.description) {
            clock.cancel();
            return { ok: true, data: { ...fallback, ...data } };
          }
        } catch {
          /* try next */
        }
      }
      clock.cancel();
      return { ok: false, data: fallback };
    } catch {
      clock.cancel();
      return { ok: false, data: fallback };
    }
  }

  global.MyScrapOg = { fetchOg, parseUrlFallback };
})(window);
