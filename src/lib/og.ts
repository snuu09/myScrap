import { getSupabase } from "./supabase";
import { getAccessToken } from "./scraps";
import type { ScrapOg } from "./types";

export type OgFetchResult = { og: ScrapOg | null; ogStatus: "ready" | "error" | "skipped" };

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

function instagramEmbed(pageUrl: string) {
  try {
    const u = new URL(pageUrl);
    if (u.hostname.replace(/^www\./, "").toLowerCase() !== "instagram.com") return "";
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] !== "p" && parts[0] !== "reel" && parts[0] !== "tv" && parts[0] !== "reels") return "";
    const code = parts[1] || "";
    if (!code) return "";
    const kind = parts[0] === "reels" ? "reel" : parts[0];
    return `https://www.instagram.com/${kind}/${code}/embed/`;
  } catch {
    return "";
  }
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
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
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

async function invokeRemote(url: string): Promise<ScrapOg | null> {
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
    const og = asOgFields(nested || outer);
    if (!og.title && !og.image && !og.siteName) return null;
    return og;
  } catch {
    return null;
  }
}

async function youtubeOg(url: string, id: string): Promise<ScrapOg> {
  const og: ScrapOg = {
    title: "",
    description: "",
    image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    siteName: "YouTube",
    favicon: "https://www.youtube.com/favicon.ico",
  };
  try {
    const res = await fetch("https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent(url));
    if (!res.ok) return og;
    const data = (await res.json()) as { title?: string; author_name?: string; thumbnail_url?: string };
    if (data.title) og.title = data.title;
    if (data.author_name) og.siteName = data.author_name;
    if (data.thumbnail_url) og.image = data.thumbnail_url;
  } catch {
    /* thumbnail URL is enough */
  }
  return og;
}

async function proxyHtml(target: string) {
  try {
    const res = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(target));
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

async function clientOg(url: string, remote: ScrapOg | null): Promise<ScrapOg | null> {
  const yt = youtubeId(url);
  if (yt) return mergeOg(remote, await youtubeOg(url, yt));

  const html = await proxyHtml(url);
  let parsed = html ? parseOgHtml(html, url) : emptyOg();
  if (!parsed.image) {
    const embed = instagramEmbed(url);
    if (embed) {
      const embedHtml = await proxyHtml(embed);
      if (embedHtml) parsed = mergeOg(parsed, parseOgHtml(embedHtml, url));
    }
  }
  const merged = mergeOg(remote, parsed);
  if (!merged.image && !merged.title && !merged.siteName) return remote;
  if (!merged.siteName) merged.siteName = hostOf(url);
  if (!merged.favicon) merged.favicon = faviconFor(url);
  return merged;
}

/** Edge function when deployed, otherwise YouTube thumbs and an allorigins HTML scrape. */
export async function fetchOgPreview(url: string): Promise<OgFetchResult> {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return { og: null, ogStatus: "skipped" };

  const remote = await invokeRemote(trimmed);
  if (remote?.image) return { og: remote, ogStatus: "ready" };

  const filled = await clientOg(trimmed, remote);
  if (filled?.image) return { og: filled, ogStatus: "ready" };
  if (filled && (filled.title || filled.siteName)) return { og: filled, ogStatus: "error" };
  return { og: null, ogStatus: "error" };
}
