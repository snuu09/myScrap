import { onRequest } from "firebase-functions/v2/https";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// Assignment wrote claude-sonnet-5; pin the closest current Sonnet id.
const MODEL = "claude-sonnet-4-5";
const BUCKET = "scrap-media";

function env(name: string) {
  return String(process.env[name] || "").trim();
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

export const analyze = onRequest(
  { region: "asia-northeast3", cors: true, invoker: "public" },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      res.status(405).json({ error: "method" });
      return;
    }

    const header = String(req.get("Authorization") || "");
    const token = header.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      res.status(401).json({ error: "auth" });
      return;
    }

    const supabaseUrl = env("SUPABASE_URL") || env("VITE_SUPABASE_URL");
    const supabaseKey = env("SUPABASE_ANON_KEY") || env("VITE_SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseKey) {
      res.status(500).json({ error: "config" });
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: "Bearer " + token } },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      res.status(401).json({ error: "auth" });
      return;
    }

    const payload = (req.body || {}) as {
      kind?: string;
      text?: string;
      mediaPath?: string;
      mime?: string;
      filename?: string;
    };

    const apiKey = env("ANTHROPIC_API_KEY");
    if (!apiKey) {
      res.status(503).json({ error: "ai", fallback: true });
      return;
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
      if (!path.startsWith(userData.user.id + "/")) {
        res.status(403).json({ error: "path" });
        return;
      }
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
      res.json({
        type,
        tags,
        title: String(parsed.title || filename || "").slice(0, 80),
        body: String(parsed.body || text || "").slice(0, 400),
        url: String(parsed.url || ""),
        domain: String(parsed.domain || ""),
      });
    } catch {
      res.status(503).json({ error: "ai", fallback: true });
    }
  },
);
