(function (global) {
  const URL_RE = /\b((https?:\/\/|www\.)[^\s<>"'）)]+)/gi;

  const DOC_EXT = {
    pdf: "pdf",
    doc: "doc",
    docx: "docx",
    ppt: "ppt",
    pptx: "pptx",
    xls: "xls",
    xlsx: "xlsx",
    txt: "txt",
    md: "md",
    rtf: "rtf",
    csv: "csv",
    pages: "pages",
    key: "key",
    numbers: "numbers",
    hwp: "hwp",
    hwpx: "hwpx",
    odt: "odt",
    ods: "ods",
    odp: "odp",
    epub: "epub",
  };

  function extOf(name) {
    const m = String(name || "").toLowerCase().match(/\.([a-z0-9]+)$/);
    return m ? m[1] : "";
  }

  function normalizeUrl(raw) {
    let value = String(raw || "").trim();
    if (!value) return "";
    if (value.startsWith("www.")) value = "https://" + value;
    try {
      const u = new URL(value);
      if (u.protocol !== "http:" && u.protocol !== "https:") return "";
      return u.href;
    } catch {
      return "";
    }
  }

  function extractUrls(text) {
    const found = [];
    String(text || "").replace(URL_RE, (match) => {
      const href = normalizeUrl(match.replace(/[.,;:!?]+$/, ""));
      if (href) found.push(href);
      return match;
    });
    return found;
  }

  function isProbablyUrlOnly(text) {
    const trimmed = String(text || "").trim();
    if (!trimmed) return false;
    const urls = extractUrls(trimmed);
    if (!urls.length) return false;
    const without = trimmed
      .replace(URL_RE, "")
      .replace(/\s/g, "");
    return without.length === 0;
  }

  function typeFromMime(mime, filename) {
    const m = String(mime || "").toLowerCase();
    const ext = extOf(filename);
    if (m.startsWith("image/")) return "image";
    if (m.startsWith("video/")) return "video";
    if (m.startsWith("audio/")) return "audio";
    if (m === "application/pdf" || ext === "pdf") return "document";
    if (DOC_EXT[ext]) return "document";
    if (
      m.includes("officedocument") ||
      m.includes("msword") ||
      m.includes("ms-excel") ||
      m.includes("ms-powerpoint") ||
      m.includes("haansoft") ||
      m === "text/plain" ||
      m === "text/markdown" ||
      m === "text/csv" ||
      m === "application/rtf" ||
      m === "application/epub+zip"
    ) {
      return "document";
    }
    if (m.startsWith("text/")) return "document";
    if (ext && DOC_EXT[ext]) return "document";
    if (["png", "jpg", "jpeg", "gif", "webp", "avif", "heic", "heif", "svg", "bmp"].includes(ext)) {
      return "image";
    }
    if (["mp4", "webm", "mov", "m4v", "ogv"].includes(ext)) return "video";
    if (["mp3", "wav", "m4a", "ogg", "aac", "flac", "opus"].includes(ext)) return "audio";
    return "unknown";
  }

  function tagsFor(type, extra) {
    const tags = [type];
    if (extra && extra.extension) tags.push(extra.extension);
    if (extra && extra.domain) tags.push(extra.domain);
    return [...new Set(tags)];
  }

  function analyzeText(text) {
    const value = String(text || "").trim();
    const urls = extractUrls(value);
    if (isProbablyUrlOnly(value) && urls[0]) {
      let domain = "";
      try {
        domain = new URL(urls[0]).hostname.replace(/^www\./, "");
      } catch {
        domain = "";
      }
      return {
        type: "link",
        text: value,
        url: urls[0],
        tags: tagsFor("link", { domain }),
        domain,
      };
    }
    const extra = {};
    const tags = ["text"];
    if (urls[0]) {
      tags.push("link");
      extra.url = urls[0];
      try {
        extra.domain = new URL(urls[0]).hostname.replace(/^www\./, "");
        tags.push(extra.domain);
      } catch {
        extra.domain = "";
      }
    }
    return {
      type: "text",
      text: value,
      url: extra.url || "",
      tags,
      domain: extra.domain || "",
    };
  }

  function analyzeFile(file) {
    const filename = file.name || "file";
    const mime = file.type || "";
    const extension = extOf(filename);
    const rawType = typeFromMime(mime, filename);
    const unknown = rawType === "unknown";
    const type = unknown ? "document" : rawType;
    let domain = "";
    const tags = tagsFor(type, { extension });
    if (unknown) tags.push("unknown");
    return {
      type,
      filename,
      mime: mime || "application/octet-stream",
      extension,
      size: file.size || 0,
      tags,
      domain,
      unknown,
    };
  }

  function formatBytes(n) {
    const size = Number(n) || 0;
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(size < 10 * 1024 ? 1 : 0) + " KB";
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  }

  global.MyScrapTagger = {
    URL_RE,
    DOC_EXT,
    extOf,
    normalizeUrl,
    extractUrls,
    isProbablyUrlOnly,
    typeFromMime,
    analyzeText,
    analyzeFile,
    formatBytes,
  };
})(window);
