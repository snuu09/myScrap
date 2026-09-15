import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";

// Assignment wrote claude-sonnet-5; that id is not current.
const MODEL = "claude-sonnet-4-5";
const BUCKET = "scrap-media";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extOf(name: string) {
  const m = String(name || "")
    .toLowerCase()
    .match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

function typeFromMime(mime: string, filename: string) {
  const m = String(mime || "").toLowerCase();
  const ext = extOf(filename);
  if (m.startsWith("image/")) return "image";
  if (m.startsWith("video/")) return "video";
  if (m.startsWith("audio/")) return "audio";
  if (m.startsWith("text/") || ext === "pdf" || ext === "doc" || ext === "docx") return "document";
  return "document";
}

function systemPrompt(lang: string) {
  const language = lang === "en" ? "English" : "Korean";
  return (
    "You classify personal scraps for MyBrary, a private shelf. Reply with JSON only: " +
    '{"type":"text|image|video|audio|link|document","tags":["..."],"title":"...","body":"...","summary":"...","analysis":"...","url":"","domain":""}. ' +
    "type is the primary kind. tags are short lowercase labels including the type. " +
    "title is a shelf label of at most 32 characters. When a Page title is given, only shorten that title; do not invent a new topic. Never use the raw URL or domain as the title when a page title or description is given. If there is no short title, use the first sentence of the Meta description or OG description. " +
    "body is a one-line shelf blurb. summary is 3 to 5 sentences the reader can use instead of opening the source. analysis is 6 to 10 sentences of key points grounded only in the given Page excerpt, paste, image, or file metadata. " +
    "For links, write a page briefing from the excerpt and metadata. For images, describe the scene, any readable text, and why it might be kept. For plain text, cover claims, lists, and action items. For video, audio, or documents without extracted body text, stick to filename and mime and end with one short line that body text was not extracted. " +
    "When Page title, OG description, Meta description, or Page excerpt are given, ground body, summary, and analysis only in those facts. Do not invent prices, tool stacks, product names, or claims that are not present in that text. If only a URL is given with no page metadata, keep summary and analysis very short and say preview metadata was not available. " +
    "In summary and analysis, wrap 1 to 3 of the most important short phrases in ==double equals== like ==this== so the app can highlight them. Do not wrap whole sentences. " +
    "Write title, body, summary, and analysis in " +
    language +
    ". No markdown other than ==highlights==. No extra keys."
  );
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  const url = Deno.env.get("SUPABASE_URL") || "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") || "";
  if (!token || !url || !anon) return json({ error: "auth" }, 401);

  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: "Bearer " + token } },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return json({ error: "auth" }, 401);

  let payload: {
    kind?: string;
    text?: string;
    mediaPath?: string;
    mime?: string;
    filename?: string;
    lang?: string;
    ogTitle?: string;
    ogDescription?: string;
    metaDescription?: string;
    pageExcerpt?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "body" }, 400);
  }

  const apiKey = (Deno.env.get("ANTHROPIC_API_KEY") || "").trim();
  if (!apiKey) return json({ error: "ai", fallback: true }, 503);

  const filename = payload.filename || "";
  const mime = payload.mime || "";
  const text = String(payload.text || "").slice(0, 12000);
  const lang = payload.lang === "en" ? "en" : "ko";
  const content: ContentPart[] = [];

  if (payload.kind === "file" && payload.mediaPath && userData.user.id) {
    const path = String(payload.mediaPath);
    if (!path.startsWith(userData.user.id + "/")) return json({ error: "path" }, 403);
    const { data: signed, error: signError } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
    if (!signError && signed?.signedUrl && mime.startsWith("image/")) {
      const img = await fetch(signed.signedUrl);
      if (img.ok) {
        const bytes = new Uint8Array(await img.arrayBuffer());
        const media =
          mime === "image/png" || mime === "image/gif" || mime === "image/webp" ? mime : "image/jpeg";
        content.push({
          type: "image",
          source: { type: "base64", media_type: media, data: bytesToBase64(bytes) },
        });
      }
    }
    content.push({
      type: "text",
      text:
        "Classify and analyze this file. filename=" +
        filename +
        " mime=" +
        mime +
        " guessed=" +
        typeFromMime(mime, filename),
    });
  } else {
    const ogTitle = String(payload.ogTitle || "").slice(0, 180);
    const ogDescription = String(payload.ogDescription || "").slice(0, 400);
    const metaDescription = String(payload.metaDescription || "").slice(0, 400);
    const pageExcerpt = String(payload.pageExcerpt || "").slice(0, 6000);
    const hints: string[] = [];
    if (ogTitle) hints.push("Page title: " + ogTitle);
    if (ogDescription) hints.push("OG description: " + ogDescription);
    if (metaDescription) hints.push("Meta description: " + metaDescription);
    if (pageExcerpt) hints.push("Page excerpt:\n" + pageExcerpt);
    const ogHint = hints.length ? "\n" + hints.join("\n") : "";
    content.push({
      type: "text",
      text: "Classify and analyze this paste:\n" + (text || "(empty)") + ogHint,
    });
  }

  try {
    const ai = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1600,
        system: systemPrompt(lang),
        messages: [{ role: "user", content }],
      }),
    });
    if (!ai.ok) return json({ error: "ai", fallback: true }, 503);
    const message = (await ai.json()) as { content?: { type: string; text?: string }[] };
    const raw = (message.content || [])
      .map((part) => (part.type === "text" ? part.text || "" : ""))
      .join("")
      .trim();
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const parsed = JSON.parse(start >= 0 ? raw.slice(start, end + 1) : raw) as {
      type?: string;
      tags?: string[];
      title?: string;
      body?: string;
      summary?: string;
      analysis?: string;
      url?: string;
      domain?: string;
    };
    const type = parsed.type || typeFromMime(mime, filename);
    const tags = Array.isArray(parsed.tags) && parsed.tags.length ? parsed.tags.map(String) : [type];
    const summary = String(parsed.summary || parsed.body || text || "").slice(0, 800);
    const analysis = String(parsed.analysis || "").slice(0, 2000);
    return json({
      type,
      tags,
      title: String(parsed.title || filename || "").slice(0, 40),
      body: String(parsed.body || summary || text || "").slice(0, 800),
      summary,
      analysis,
      url: String(parsed.url || ""),
      domain: String(parsed.domain || ""),
    });
  } catch {
    return json({ error: "ai", fallback: true }, 503);
  }
});
