import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";

const EXCERPT_MAX = 6000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function fallback(pageUrl: string) {
  try {
    const u = new URL(pageUrl);
    const host = u.hostname.replace(/^www\./, "");
    return {
      title: host,
      description: u.pathname === "/" ? host : u.pathname,
      metaDescription: "",
      excerpt: "",
      image: "",
      siteName: host,
      favicon: u.origin + "/favicon.ico",
      url: u.href,
    };
  } catch {
    return {
      title: pageUrl,
      description: "",
      metaDescription: "",
      excerpt: "",
      image: "",
      siteName: "",
      favicon: "",
      url: pageUrl,
    };
  }
}

function absUrl(maybe: string, base: string) {
  if (!maybe) return "";
  try {
    return new URL(maybe, base).href;
  } catch {
    return maybe;
  }
}

function meta(html: string, key: string) {
  const prop = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const prop2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
    "i"
  );
  const a = html.match(prop) || html.match(prop2);
  return a ? decodeHtml(a[1].trim()) : "";
}

function decodeHtml(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&#(\d+);/g, (_, num) => {
      const code = Number.parseInt(num, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/gi, " ");
}

/** Strip chrome and take a short plain-text window for classify. Not stored. */
function extractExcerpt(html: string) {
  const fromLd = jsonLdArticleBody(html);
  if (fromLd.length >= 80) return fromLd.slice(0, EXCERPT_MAX);

  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const plain = (chunk: string) =>
    decodeHtml(chunk.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
  const article = cleaned.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  const main = cleaned.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const articleText = article?.[1] ? plain(article[1]) : "";
  const mainText = main?.[1] ? plain(main[1]) : "";
  const fullText = plain(cleaned);
  const best =
    articleText.length >= 80 ? articleText : mainText.length >= 80 ? mainText : fullText;
  return best.slice(0, EXCERPT_MAX);
}

function jsonLdArticleBody(html: string) {
  const blocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  const parts: string[] = [];
  for (const block of blocks) {
    const raw = block.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "").trim();
    try {
      const data = JSON.parse(raw) as unknown;
      collectArticleBodies(data, parts);
    } catch {
      /* ignore malformed ld+json */
    }
  }
  return decodeHtml(parts.join(" ")).replace(/\s+/g, " ").trim();
}

function collectArticleBodies(node: unknown, out: string[]) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const item of node) collectArticleBodies(item, out);
    return;
  }
  if (typeof node !== "object") return;
  const row = node as Record<string, unknown>;
  const body = row.articleBody;
  if (typeof body === "string" && body.trim()) out.push(body.trim());
  else if (Array.isArray(body)) {
    for (const part of body) {
      if (typeof part === "string" && part.trim()) out.push(part.trim());
    }
  }
  if (row["@graph"]) collectArticleBodies(row["@graph"], out);
  if (row.mainEntity) collectArticleBodies(row.mainEntity, out);
}

function parseOg(html: string, pageUrl: string) {
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const ogDescription = meta(html, "og:description");
  const metaDescription = meta(html, "description");
  const title = meta(html, "og:title") || (titleTag ? decodeHtml(titleTag[1].trim()) : "");
  return {
    title,
    description: ogDescription || metaDescription,
    metaDescription,
    excerpt: extractExcerpt(html),
    image: absUrl(meta(html, "og:image") || meta(html, "og:image:url"), pageUrl),
    siteName: meta(html, "og:site_name") || fallback(pageUrl).siteName,
    favicon: fallback(pageUrl).favicon,
    url: meta(html, "og:url") || pageUrl,
  };
}

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

type OgData = ReturnType<typeof fallback>;

function hostOf(pageUrl: string) {
  try {
    return new URL(pageUrl).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function youtubeId(pageUrl: string) {
  try {
    const u = new URL(pageUrl);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") return u.pathname.split("/").filter(Boolean)[0] || "";
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v") || "";
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") return parts[1] || "";
    }
  } catch {
    /* ignore */
  }
  return "";
}

function instagramCode(pageUrl: string) {
  try {
    const u = new URL(pageUrl);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "instagram.com") return "";
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "p" || parts[0] === "reel" || parts[0] === "tv" || parts[0] === "reels") {
      return parts[1] || "";
    }
  } catch {
    /* ignore */
  }
  return "";
}

function firstContentImage(html: string, base: string) {
  const og = absUrl(meta(html, "og:image") || meta(html, "og:image:url"), base);
  if (og) return og;
  const img = html.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
  return img ? absUrl(decodeHtml(img[1]), base) : "";
}

async function fetchText(target: string) {
  const res = await fetch(target, {
    redirect: "follow",
    headers: {
      "User-Agent": BROWSER_UA,
      Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) return "";
  return await res.text();
}

async function enrichProvider(pageUrl: string, data: OgData): Promise<OgData> {
  const next = { ...data };
  const host = hostOf(pageUrl);

  const yt = youtubeId(pageUrl);
  if (yt) {
    if (!next.image) next.image = `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
    if (!next.siteName) next.siteName = "YouTube";
    try {
      const raw = await fetchText(
        "https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent(pageUrl),
      );
      const oembed = raw ? (JSON.parse(raw) as { title?: string; author_name?: string; thumbnail_url?: string }) : null;
      if (oembed?.title && (!next.title || next.title === host)) next.title = oembed.title;
      if (oembed?.author_name) next.siteName = oembed.author_name;
      if (oembed?.thumbnail_url) next.image = oembed.thumbnail_url;
    } catch {
      /* thumbnail URL is enough */
    }
    return next;
  }

  if (!next.image && (host === "instagram.com" || host.endsWith(".instagram.com"))) {
    const code = instagramCode(pageUrl);
    if (code) {
      const kind = pageUrl.includes("/reel") ? "reel" : pageUrl.includes("/tv/") ? "tv" : "p";
      const html = await fetchText(`https://www.instagram.com/${kind}/${code}/embed/`).catch(() => "");
      const image = html ? firstContentImage(html, pageUrl) : "";
      if (image) next.image = image;
      if (!next.siteName) next.siteName = "Instagram";
    }
  }

  if (!next.image && (host === "facebook.com" || host === "fb.watch" || host.endsWith(".facebook.com"))) {
    const embed = "https://www.facebook.com/plugins/post.php?href=" + encodeURIComponent(pageUrl);
    const html = await fetchText(embed).catch(() => "");
    const image = html ? firstContentImage(html, pageUrl) : "";
    if (image) next.image = image;
    if (!next.siteName) next.siteName = "Facebook";
  }

  return next;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const auth = req.headers.get("Authorization") || "";
  const url = Deno.env.get("SUPABASE_URL") || "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") || "";
  if (!auth || !url || !anon) return json({ ok: false, error: "unauthorized" }, 401);

  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: auth } },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return json({ ok: false, error: "unauthorized" }, 401);

  let pageUrl = "";
  try {
    const body = await req.json();
    pageUrl = String(body && body.url ? body.url : "").trim();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  const base = fallback(pageUrl);
  if (!/^https?:\/\//i.test(pageUrl)) {
    return json({ ok: false, data: base }, 400);
  }

  try {
    const html = await fetchText(pageUrl);
    const scraped = html ? { ...base, ...parseOg(html, pageUrl) } : base;
    const data = await enrichProvider(pageUrl, scraped);
    const ok = !!(data.title || data.image || data.description);
    return json({ ok, data });
  } catch {
    return json({ ok: false, data: base });
  }
});
