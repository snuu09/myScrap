import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

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
      image: "",
      siteName: host,
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
  return a ? a[1].trim() : "";
}

function parseOg(html: string, pageUrl: string) {
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = meta(html, "og:title") || (titleTag ? titleTag[1].trim() : "");
  return {
    title,
    description: meta(html, "og:description") || meta(html, "description"),
    image: absUrl(meta(html, "og:image"), pageUrl),
    siteName: meta(html, "og:site_name") || fallback(pageUrl).siteName,
    favicon: fallback(pageUrl).favicon,
    url: meta(html, "og:url") || pageUrl,
  };
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
    const res = await fetch(pageUrl, {
      redirect: "follow",
      headers: { "User-Agent": "Mybrary-og/1.0" },
    });
    const html = await res.text();
    const data = { ...base, ...parseOg(html, pageUrl) };
    const ok = !!(data.title || data.image || data.description);
    return json({ ok, data });
  } catch {
    return json({ ok: false, data: base });
  }
});
