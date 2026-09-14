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
    "type is the primary kind. tags are short lowercase labels including the type. title is a short shelf label. " +
    "body is a one-line description. summary is 1-2 sentences. analysis is 2-4 sentences about what it contains and why it is worth keeping. " +
    "Write title, body, summary, and analysis in " +
    language +
    ". No markdown. No extra keys."
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
  const text = String(payload.text || "").slice(0, 8000);
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
    content.push({
      type: "text",
      text: "Classify and analyze this paste:\n" + (text || "(empty)"),
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
        max_tokens: 700,
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
    const summary = String(parsed.summary || parsed.body || text || "").slice(0, 400);
    const analysis = String(parsed.analysis || "").slice(0, 800);
    return json({
      type,
      tags,
      title: String(parsed.title || filename || "").slice(0, 80),
      body: String(parsed.body || summary || text || "").slice(0, 400),
      summary,
      analysis,
      url: String(parsed.url || ""),
      domain: String(parsed.domain || ""),
    });
  } catch {
    return json({ error: "ai", fallback: true }, 503);
  }
});
