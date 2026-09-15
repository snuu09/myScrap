import type { Scrap } from "./types";
import { FAVICON_HOLDER } from "./audioCover";

export function scrapCover(scrap: Scrap) {
  if (scrap.posterUrl) return scrap.posterUrl;
  if (scrap.og?.image) return scrap.og.image;
  if (scrap.dataUrl && (scrap.type === "image" || scrap.type === "video")) return scrap.dataUrl;
  return FAVICON_HOLDER;
}

export function scrapCoverOrEmpty(scrap: Scrap) {
  if (scrap.posterUrl) return scrap.posterUrl;
  if (scrap.og?.image) return scrap.og.image;
  if (scrap.dataUrl && (scrap.type === "image" || scrap.type === "video")) return scrap.dataUrl;
  return "";
}

export function looksLikeAddress(title: string, domain = "", url = "") {
  const raw = title.trim();
  if (!raw) return true;
  if (raw === domain || raw === url) return true;
  if (/^https?:\/\//i.test(raw)) return true;
  if (domain && raw.toLowerCase() === domain.toLowerCase()) return true;
  return false;
}

function clipLabel(text: string, max = 32) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const sentence = clean.split(/[.!?。！？\n]/)[0]?.trim() || clean;
  if (sentence.length <= max) return sentence;
  return sentence.slice(0, max - 1).trimEnd() + "…";
}

/** Short shelf label. Domain and raw URLs lose to an OG description, then a shortened OG title. */
export function shelfTitle(input: {
  aiTitle?: string;
  ogTitle?: string;
  ogDescription?: string;
  domain?: string;
  url?: string;
  fallback?: string;
}) {
  const domain = (input.domain || "").trim();
  const url = (input.url || "").trim();
  const ai = (input.aiTitle || "").trim();
  const ogTitle = (input.ogTitle || "").trim();
  const usable = (value: string) => Boolean(value) && !looksLikeAddress(value, domain, url);
  if (usable(ai)) return clipLabel(ai);
  const fromDescription = clipLabel(input.ogDescription || "");
  if (usable(fromDescription)) return fromDescription;
  if (usable(ogTitle)) return clipLabel(ogTitle);
  const fallback = (input.fallback || "").trim();
  if (usable(fallback)) return clipLabel(fallback);
  return ogTitle || ai || fallback;
}

/** Prefer a real page title when the stored title is only an address or domain. */
export function scrapFaceTitle(scrap: Scrap, untitled: string) {
  const domain = scrap.domain.trim();
  const url = scrap.url.trim();
  const raw = scrap.title.trim();
  if (raw && !looksLikeAddress(raw, domain, url)) return raw;
  const fromDescription = clipLabel(scrap.og?.description || "", 80);
  if (fromDescription && !looksLikeAddress(fromDescription, domain, url)) return fromDescription;
  const ogTitle = scrap.og?.title.trim() || "";
  if (ogTitle && !looksLikeAddress(ogTitle, domain, url)) return ogTitle;
  return raw || ogTitle || untitled;
}
