const KNOWN: Record<string, string> = {
  "youtube.com": "https://www.youtube.com/favicon.ico",
  "www.youtube.com": "https://www.youtube.com/favicon.ico",
  "youtu.be": "https://www.youtube.com/favicon.ico",
  "twitter.com": "https://twitter.com/favicon.ico",
  "x.com": "https://x.com/favicon.ico",
  "instagram.com": "https://www.instagram.com/favicon.ico",
  "www.instagram.com": "https://www.instagram.com/favicon.ico",
  "facebook.com": "https://www.facebook.com/favicon.ico",
  "www.facebook.com": "https://www.facebook.com/favicon.ico",
  "linkedin.com": "https://www.linkedin.com/favicon.ico",
  "www.linkedin.com": "https://www.linkedin.com/favicon.ico",
  "github.com": "https://github.com/favicon.ico",
  "medium.com": "https://medium.com/favicon.ico",
  "naver.com": "https://www.naver.com/favicon.ico",
  "www.naver.com": "https://www.naver.com/favicon.ico",
  "google.com": "https://www.google.com/favicon.ico",
  "www.google.com": "https://www.google.com/favicon.ico",
  "spotify.com": "https://open.spotify.com/favicon.ico",
  "open.spotify.com": "https://open.spotify.com/favicon.ico",
  "netflix.com": "https://www.netflix.com/favicon.ico",
  "www.netflix.com": "https://www.netflix.com/favicon.ico",
};

/** Prefer OG favicon, then a small known map, then /favicon.ico on the domain.
 *  Callers should fall back to Lucide Globe when this is empty or the image errors. */
export function siteIconUrl(domain: string, favicon?: string) {
  if (favicon) return favicon;
  const host = domain.replace(/^www\./, "").toLowerCase();
  if (!host) return "";
  if (KNOWN[domain]) return KNOWN[domain];
  if (KNOWN[host]) return KNOWN[host];
  if (KNOWN["www." + host]) return KNOWN["www." + host];
  return "https://" + host + "/favicon.ico";
}
