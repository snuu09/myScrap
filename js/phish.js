(function (global) {
  // On-device URL shape check. Not a live blocklist and not a guarantee.
  const SHORTENERS = {
    "bit.ly": 1,
    "t.co": 1,
    "tinyurl.com": 1,
    "tiny.cc": 1,
    "ow.ly": 1,
    "is.gd": 1,
    "buff.ly": 1,
    "cutt.ly": 1,
    "rebrand.ly": 1,
    "rb.gy": 1,
    "goo.gl": 1,
    "lnkd.in": 1,
    "s.id": 1,
    "vo.la": 1,
    "han.gl": 1,
    "url.kr": 1,
  };

  const RISKY_TLD = {
    zip: 1,
    mov: 1,
    tk: 1,
    ml: 1,
    ga: 1,
    cf: 1,
    gq: 1,
    top: 1,
    click: 1,
    cfd: 1,
    rest: 1,
    country: 1,
    work: 1,
    xyz: 1,
    link: 1,
    support: 1,
    account: 1,
  };

  const BRANDS = [
    "apple",
    "google",
    "microsoft",
    "paypal",
    "amazon",
    "facebook",
    "instagram",
    "whatsapp",
    "kakao",
    "naver",
    "toss",
    "samsung",
    "netflix",
    "steam",
    "binance",
    "coinbase",
    "icloud",
    "outlook",
    "office365",
  ];

  const PATH_HOOKS = /login|signin|sign-in|verify|password|passwd|account|update|confirm|wallet|invoice|secure|auth/i;

  function registrable(host) {
    const parts = String(host || "")
      .toLowerCase()
      .replace(/^www\./, "")
      .split(".")
      .filter(Boolean);
    if (parts.length < 2) return parts.join(".");
    const sld = parts[parts.length - 2];
    if (parts.length >= 3 && ["co", "com", "ac", "ne", "or", "go", "net"].includes(sld)) {
      return parts.slice(-3).join(".");
    }
    return parts.slice(-2).join(".");
  }

  function mixedScript(host) {
    const latin = /[A-Za-z]/.test(host);
    const other = /[^\x00-\x7F.]/.test(host);
    return latin && other;
  }

  function assess(raw) {
    const reasons = [];
    let score = 0;
    let url;
    try {
      url = new URL(String(raw || "").trim());
    } catch {
      return { level: "high", score: 100, reasons: ["bad"] };
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { level: "high", score: 100, reasons: ["bad"] };
    }

    const host = url.hostname.toLowerCase();
    const bare = host.replace(/^www\./, "");
    const labels = bare.split(".").filter(Boolean);
    const root = registrable(bare);
    const tld = labels[labels.length - 1] || "";

    if (url.protocol === "http:") {
      score += 22;
      reasons.push("http");
    }
    if (url.username || url.password) {
      score += 40;
      reasons.push("userinfo");
    }
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":")) {
      score += 40;
      reasons.push("ip");
    }
    if (host.includes("xn--") || mixedScript(host)) {
      score += 35;
      reasons.push("punycode");
    }
    if (labels.length >= 5) {
      score += 18;
      reasons.push("subdomains");
    }
    if ((bare.match(/-/g) || []).length >= 3) {
      score += 14;
      reasons.push("hyphens");
    }
    if (url.href.length > 140) {
      score += 10;
      reasons.push("long");
    }
    if (SHORTENERS[bare]) {
      score += 22;
      reasons.push("shortener");
    }
    if (RISKY_TLD[tld]) {
      score += 18;
      reasons.push("tld");
    }

    const hostBlob = bare.replace(/[-.]/g, "");
    BRANDS.forEach((brand) => {
      if (hostBlob.indexOf(brand) === -1) return;
      const rootBlob = root.replace(/[-.]/g, "");
      if (rootBlob === brand || rootBlob.indexOf(brand) === 0) return;
      score += 36;
      if (reasons.indexOf("brand") === -1) reasons.push("brand");
    });

    if (PATH_HOOKS.test(url.pathname + url.search) && (score >= 14 || labels.length >= 4 || RISKY_TLD[tld])) {
      score += 16;
      reasons.push("loginpath");
    }

    let level = "low";
    if (score >= 45) level = "high";
    else if (score >= 20) level = "mid";
    return { level: level, score: score, reasons: reasons };
  }

  global.MyScrapPhish = { assess: assess };
})(window);
