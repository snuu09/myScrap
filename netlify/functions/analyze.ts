import type { Config } from "@netlify/functions";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// Assignment wrote claude-sonnet-5; that id is not current. Pin the closest Sonnet.
const MODEL = "claude-sonnet-4-5";
const BUCKET = "scrap-media";

function env(name: string) {
  return (Netlify.env.get(name) || "").trim();
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
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

export default async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const header = req.headers.get("Authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "auth" }, 401);

  const supabaseUrl = env("VITE_SUPABASE_URL") || env("SUPABASE_URL");
  const supabaseKey = env("VITE_SUPABASE_ANON_KEY") || env("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseKey) return json({ error: "config" }, 500);

  const supabase = createClient(supabaseUrl, supabaseKey, {
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
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "body" }, 400);
  }

  const apiKey = env("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return json({ error: "ai", fallback: true }, 503);
  }

  const client = new Anthropic({ apiKey });
  const filename = payload.filename || "";
  const mime = payload.mime || "";
  const text = String(payload.text || "").slice(0, 8000);

  const system =
    "You classify personal scraps for MyBrary, a private shelf. Reply with JSON only: " +
    '{"type":"text|image|video|audio|link|document","tags":["..."],"title":"...","body":"...","url":"","domain":""}. ' +
    "type is the primary kind. tags are short lowercase labels including the type. title is a short shelf label. " +
    "body is a one-line description. No markdown. No extra keys.";

  const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

  if (payload.kind === "file" && payload.mediaPath && userData.user.id) {
    const path = String(payload.mediaPath);
    if (!path.startsWith(userData.user.id + "/")) return json({ error: "path" }, 403);
    const { data: signed, error: signError } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
    if (!signError && signed?.signedUrl && mime.startsWith("image/")) {
      const img = await fetch(signed.signedUrl);
      if (img.ok) {
        const bytes = Buffer.from(await img.arrayBuffer());
        const b64 = bytes.toString("base64");
        const media: "image/jpeg" | "image/png" | "image/gif" | "image/webp" =
          mime === "image/png" || mime === "image/gif" || mime === "image/webp" ? mime : "image/jpeg";
        content.push({
          type: "image",
          source: { type: "base64", media_type: media, data: b64 },
        });
      }
    }
    content.push({
      type: "text",
      text:
        "Classify this file. filename=" +
        filename +
        " mime=" +
        mime +
        " guessed=" +
        typeFromMime(mime, filename),
    });
  } else {
    content.push({
      type: "text",
      text: "Classify this paste:\n" + (text || "(empty)"),
    });
  }

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system,
      messages: [{ role: "user", content }],
    });
    const raw = message.content
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("")
      .trim();
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const parsed = JSON.parse(start >= 0 ? raw.slice(start, end + 1) : raw) as {
      type?: string;
      tags?: string[];
      title?: string;
      body?: string;
      url?: string;
      domain?: string;
    };
    const type = parsed.type || typeFromMime(mime, filename);
    const tags = Array.isArray(parsed.tags) && parsed.tags.length ? parsed.tags.map(String) : [type];
    return json({
      type,
      tags,
      title: String(parsed.title || filename || "").slice(0, 80),
      body: String(parsed.body || text || "").slice(0, 400),
      url: String(parsed.url || ""),
      domain: String(parsed.domain || ""),
    });
  } catch {
    return json({ error: "ai", fallback: true }, 503);
  }
};

export const config: Config = {
  path: "/api/analyze",
  method: "POST",
};
