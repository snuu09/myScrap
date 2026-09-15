import { getSupabase } from "./supabase";
import { getAccessToken } from "./scraps";
import type { ScrapOg } from "./types";

export type OgFetchResult = {
  og: ScrapOg | null;
  ogStatus: "ready" | "error" | "skipped";
  /** name=description; ephemeral for classify, not stored on ScrapOg. */
  metaDescription?: string;
  /** Short page text window for classify; ephemeral, not stored. */
  excerpt?: string;
};

type RemoteOg = ScrapOg & { metaDescription: string; excerpt: string };

function asOgFields(row: Record<string, unknown>): ScrapOg {
  return {
    title: String(row.title || ""),
    description: String(row.description || ""),
    image: String(row.image || ""),
    siteName: String(row.siteName || row.site_name || ""),
    favicon: String(row.favicon || ""),
  };
}

function emptyOg(): ScrapOg {
  return { title: "", description: "", image: "", siteName: "", favicon: "" };
}

function hostOf(pageUrl: string) {
  try {
    return new URL(pageUrl).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function faviconFor(pageUrl: string) {
  try {
    return new URL(pageUrl).origin + "/favicon.ico";
  } catch {
    return "";
  }
}

export function youtubeEmbedUrl(pageUrl: string) {
  const id = youtubeId(pageUrl);
  if (!id) return "";
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
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
    if (host !== "instagram.com" && host !== "instagr.am") return "";
    const parts = u.pathname.split("/").filter(Boolean);
    const head = parts[0] === "share" ? parts[1] : parts[0];
    const code = parts[0] === "share" ? parts[2] : parts[1];
    if (head !== "p" && head !== "reel" && head !== "tv" && head !== "reels") return "";
    return code || "";
  } catch {
    return "";
  }
}

/** Public media redirect. An img tag follows it; no CORS proxy required. */
function instagramThumb(code: string) {
  return `https://www.instagram.com/p/${code}/media/?size=m`;
}

function meta(html: string, key: string) {
  const prop = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const prop2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
    "i",
  );
  const hit = html.match(prop) || html.match(prop2);
  return hit ? decodeHtml(hit[1].trim()) : "";
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
    .replace(/&gt;/g, ">");
}

function absUrl(maybe: string, base: string) {
  if (!maybe) return "";
  try {
    return new URL(maybe, base).href;
  } catch {
    return maybe;
  }
}

function parseOgHtml(html: string, pageUrl: string): ScrapOg {
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return {
    title: meta(html, "og:title") || (titleTag ? decodeHtml(titleTag[1].trim()) : ""),
    description: meta(html, "og:description") || meta(html, "description"),
    image: absUrl(meta(html, "og:image") || meta(html, "og:image:url"), pageUrl),
    siteName: meta(html, "og:site_name"),
    favicon: faviconFor(pageUrl),
  };
}

async function invokeRemote(url: string): Promise<RemoteOg | null> {
  const supabase = getSupabase();
  const token = await getAccessToken();
  if (!supabase || !token) return null;
  try {
    const { data, error } = await supabase.functions.invoke("og-preview", {
      body: { url },
      headers: { Authorization: "Bearer " + token },
    });
    if (error || !data) return null;
    const outer = data as Record<string, unknown>;
    const nested =
      outer.data && typeof outer.data === "object" && !Array.isArray(outer.data)
        ? (outer.data as Record<string, unknown>)
        : null;
    const row = nested || outer;
    const og = asOgFields(row);
    if (!og.title && !og.image && !og.siteName) return null;
    return {
      ...og,
      metaDescription: String(row.metaDescription || ""),
      excerpt: String(row.excerpt || ""),
    };
  } catch {
    return null;
  }
}

function httpImage(value: string) {
  return /^https?:\/\//i.test(value) ? value : "";
}

function withTimeout<T>(work: Promise<T | null>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

async function youtubeOg(url: string, id: string): Promise<ScrapOg> {
  const og: ScrapOg = {
    title: "",
    description: "",
    image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    siteName: "YouTube",
    favicon: "https://www.youtube.com/favicon.ico",
  };
  const extra = await withTimeout(
    (async () => {
      const res = await fetch("https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent(url));
      if (!res.ok) return null;
      return (await res.json()) as { title?: string; author_name?: string; thumbnail_url?: string };
    })(),
    400,
  );
  if (!extra) return og;
  if (extra.title) og.title = extra.title;
  if (extra.author_name) og.siteName = extra.author_name;
  if (httpImage(extra.thumbnail_url || "")) og.image = extra.thumbnail_url || og.image;
  return og;
}

async function microlinkOg(url: string): Promise<ScrapOg | null> {
  try {
    const res = await fetch("https://api.microlink.io/?url=" + encodeURIComponent(url), {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      status?: string;
      data?: {
        title?: string;
        description?: string;
        publisher?: string;
        author?: string;
        image?: { url?: string } | string;
        logo?: { url?: string } | string;
      };
    };
    if (body.status && body.status !== "success") return null;
    const data = body.data || {};
    const imageRaw = typeof data.image === "string" ? data.image : data.image?.url || "";
    const logoRaw = typeof data.logo === "string" ? data.logo : data.logo?.url || "";
    const title = String(data.title || "").trim();
    const image = httpImage(imageRaw);
    if (!image && !title) return null;
    if (title === "Instagram" && !image) return null;
    return {
      title: title === "Instagram" ? "" : title,
      description: String(data.description || ""),
      image,
      siteName: String(data.author || data.publisher || ""),
      favicon: httpImage(logoRaw) || faviconFor(url),
    };
  } catch {
    return null;
  }
}

async function proxyHtml(target: string) {
  try {
    const res = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(target), {
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return "";
    const data = (await res.json()) as { contents?: string };
    return String(data.contents || "");
  } catch {
    return "";
  }
}

function mergeOg(base: ScrapOg | null, next: ScrapOg): ScrapOg {
  return {
    title: next.title || base?.title || "",
    description: next.description || base?.description || "",
    image: next.image || base?.image || "",
    siteName: next.siteName || base?.siteName || "",
    favicon: next.favicon || base?.favicon || "",
  };
}

function instagramOg(code: string): ScrapOg {
  return {
    title: "",
    description: "",
    image: instagramThumb(code),
    siteName: "Instagram",
    favicon: "https://www.instagram.com/favicon.ico",
  };
}

async function clientOg(url: string): Promise<ScrapOg | null> {
  const yt = youtubeId(url);
  if (yt) return youtubeOg(url, yt);

  const ig = instagramCode(url);
  if (ig) return instagramOg(ig);

  const linked = await microlinkOg(url);
  if (linked?.image) {
    if (!linked.siteName) linked.siteName = hostOf(url);
    if (!linked.favicon) linked.favicon = faviconFor(url);
    return linked;
  }

  const html = await proxyHtml(url);
  const parsed = html ? parseOgHtml(html, url) : emptyOg();
  const merged = mergeOg(linked, parsed);
  if (!merged.image && !merged.title && !merged.siteName) return null;
  if (!merged.siteName) merged.siteName = hostOf(url);
  if (!merged.favicon) merged.favicon = faviconFor(url);
  return merged;
}

function packResult(
  og: ScrapOg,
  extra?: { metaDescription?: string; excerpt?: string },
): OgFetchResult {
  const filled = {
    ...og,
    siteName: og.siteName || "",
    favicon: og.favicon || "",
  };
  if (!filled.image && !filled.title && !filled.siteName) {
    return { og: null, ogStatus: "error", metaDescription: "", excerpt: "" };
  }
  return {
    og: filled,
    ogStatus: filled.image ? "ready" : "error",
    metaDescription: extra?.metaDescription || "",
    excerpt: extra?.excerpt || "",
  };
}

/** Prefer Edge Function og-preview when signed in. Fall back to microlink / HTML scrape. */
export async function fetchOgPreview(url: string): Promise<OgFetchResult> {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return { og: null, ogStatus: "skipped" };

  const remote = await withTimeout(invokeRemote(trimmed), 6000);
  if (remote) {
    const og: ScrapOg = {
      title: remote.title,
      description: remote.description,
      image: remote.image,
      siteName: remote.siteName || hostOf(trimmed),
      favicon: remote.favicon || faviconFor(trimmed),
    };
    return packResult(og, {
      metaDescription: remote.metaDescription,
      excerpt: remote.excerpt,
    });
  }

  const client = await clientOg(trimmed);
  if (!client) return { og: null, ogStatus: "error" };
  return packResult(client);
}
