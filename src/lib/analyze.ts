import type { AnalyzeResult, ScrapType } from "./types";
import { analyzeFile, analyzeText } from "./tagger";
import { getAccessToken } from "./scraps";
import { functionUrl, getSupabase, publishableKey } from "./supabase";
import type { Lang } from "../i18n";

type Payload = {
  kind: "text" | "file";
  text?: string;
  mediaPath?: string;
  mime?: string;
  filename?: string;
  lang?: Lang;
  ogTitle?: string;
  ogDescription?: string;
  metaDescription?: string;
  pageExcerpt?: string;
  signal?: AbortSignal;
};

type AnalyzeMiss = NonNullable<AnalyzeResult["miss"]>;

function ruleTags(payload: Payload): AnalyzeResult {
  if (payload.kind === "text") {
    const hit = analyzeText(payload.text || "");
    return {
      type: hit.type,
      tags: hit.tags,
      title: hit.title,
      body: hit.body,
      summary: hit.body,
      analysis: "",
      url: hit.url,
      domain: hit.domain,
    };
  }
  const fake = {
    name: payload.filename || "file",
    type: payload.mime || "",
  } as File;
  const hit = analyzeFile(fake);
  return {
    type: hit.type as ScrapType,
    tags: hit.tags,
    title: hit.title,
    body: hit.body,
    summary: hit.body,
    analysis: "",
  };
}

function withMiss(payload: Payload, miss: AnalyzeMiss): AnalyzeResult {
  return { ...ruleTags(payload), fallback: miss === "rules", miss };
}

function aborted(err: unknown) {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}

async function postAnalyze(token: string, payload: Payload) {
  const endpoint = functionUrl("analyze");
  const apikey = publishableKey();
  if (!endpoint || !apikey) throw new Error("config");
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      apikey,
    },
    body: JSON.stringify({
      kind: payload.kind,
      text: payload.text,
      mediaPath: payload.mediaPath,
      mime: payload.mime,
      filename: payload.filename,
      lang: payload.lang === "en" ? "en" : "ko",
      ogTitle: payload.ogTitle || "",
      ogDescription: payload.ogDescription || "",
      metaDescription: payload.metaDescription || "",
      pageExcerpt: payload.pageExcerpt || "",
    }),
    signal: payload.signal,
  });
}

function looksLikeHtml(res: Response, raw: string) {
  const type = res.headers.get("content-type") || "";
  return type.includes("text/html") || raw.trim().startsWith("<");
}

export async function requestAnalyze(payload: Payload): Promise<AnalyzeResult> {
  const token = await getAccessToken();
  // Guest media never reaches storage, so there is no path for the function to read.
  if (!token || (payload.kind === "file" && !payload.mediaPath)) return withMiss(payload, "rules");

  try {
    let res = await postAnalyze(token, payload);
    if (payload.signal?.aborted) throw new DOMException("Aborted", "AbortError");

    if (res.status === 401) {
      const supabase = getSupabase();
      const refreshed = supabase ? await supabase.auth.refreshSession() : null;
      const next = refreshed?.data.session?.access_token || "";
      if (next) {
        res = await postAnalyze(next, payload);
        if (payload.signal?.aborted) throw new DOMException("Aborted", "AbortError");
      }
      if (res.status === 401) return withMiss(payload, "auth");
    }

    const raw = await res.text();
    if (looksLikeHtml(res, raw) || res.status === 404) return withMiss(payload, "missing");

    let data: AnalyzeResult | null = null;
    try {
      data = raw ? (JSON.parse(raw) as AnalyzeResult) : null;
    } catch {
      return withMiss(payload, "missing");
    }

    if (res.status === 503 || data?.fallback) return withMiss(payload, "rules");
    if (!res.ok || !data?.type) return withMiss(payload, "missing");

    const summary = String(data.summary || data.body || "").slice(0, 400);
    const analysis = String(data.analysis || "").slice(0, 800);
    return {
      ...data,
      body: String(data.body || summary).slice(0, 400),
      summary,
      analysis,
      fallback: false,
      miss: "",
    };
  } catch (err) {
    if (aborted(err)) throw err;
    return withMiss(payload, "missing");
  }
}
