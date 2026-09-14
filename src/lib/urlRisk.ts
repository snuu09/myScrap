export type UrlCaution = "http" | "punycode" | "login";

/** One-line caution. Not a phishing scanner. */
export function urlCaution(raw: string): UrlCaution | "" {
  const value = raw.trim();
  if (!value) return "";
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return "";
  }
  if (url.protocol === "http:") return "http";
  const host = url.hostname.toLowerCase();
  if (host.includes("xn--")) return "punycode";
  if (/(^|[.-])(login|signin|sign-in|verify|account|password)([.-]|$)/.test(host)) return "login";
  return "";
}
