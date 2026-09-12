import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const MAX_BYTES = 4 * 1024 * 1024;

function blockedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host === "0.0.0.0" || host === "::1" || host === "[::1]") return true;
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  return false;
}

function imageType(header: string, bytes: Uint8Array) {
  const mime = header.split(";")[0].trim().toLowerCase();
  if (mime.startsWith("image/")) return mime;
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "image/png";
  if (bytes[0] === 0x47 && bytes[1] === 0x49) return "image/gif";
  if (bytes[0] === 0x52 && bytes[1] === 0x49) return "image/webp";
  return "";
}

function env(name: string) {
  return (Netlify.env.get(name) || process.env[name] || "").trim();
}

async function hasSession(req: Request) {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  const supabaseUrl = env("VITE_SUPABASE_URL") || env("SUPABASE_URL");
  const supabaseKey = env("VITE_SUPABASE_ANON_KEY") || env("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseKey) return false;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: "Bearer " + token } },
  });
  const { data, error } = await supabase.auth.getUser(token);
  return !error && Boolean(data.user);
}

export default async (req: Request) => {
  if (req.method !== "GET") return new Response("method", { status: 405 });
  if (!(await hasSession(req))) return new Response("auth", { status: 401 });

  const raw = new URL(req.url).searchParams.get("url") || "";
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response("url", { status: 400 });
  }
  if (target.protocol !== "https:" || blockedHost(target.hostname)) {
    return new Response("url", { status: 400 });
  }

  try {
    const res = await fetch(target.href, {
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "User-Agent": BROWSER_UA,
      },
    });
    if (!res.ok) return new Response("upstream", { status: 502 });

    let finalUrl: URL | null = null;
    try {
      finalUrl = new URL(res.url);
    } catch {
      finalUrl = null;
    }
    if (!finalUrl || finalUrl.protocol !== "https:" || blockedHost(finalUrl.hostname)) {
      return new Response("url", { status: 400 });
    }

    const buf = new Uint8Array(await res.arrayBuffer());
    if (!buf.byteLength || buf.byteLength > MAX_BYTES) return new Response("size", { status: 413 });
    const type = imageType(res.headers.get("content-type") || "", buf);
    if (!type) return new Response("type", { status: 415 });

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("fetch", { status: 502 });
  }
};

export const config: Config = {
  path: "/api/og-image",
  method: "GET",
};
