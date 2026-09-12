import type { AnalyzeResult, ScrapType } from "./types";
import { analyzeFile, analyzeText } from "./tagger";
import { getAccessToken } from "./scraps";
import type { Lang } from "../i18n";

type Payload = {
  kind: "text" | "file";
  text?: string;
  mediaPath?: string;
  mime?: string;
  filename?: string;
  lang?: Lang;
  signal?: AbortSignal;
};

export async function requestAnalyze(payload: Payload): Promise<AnalyzeResult> {
  const token = await getAccessToken();
  const fallback = (): AnalyzeResult => {
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
        fallback: true,
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
      fallback: true,
    };
  };

  // Guest media never reaches storage, so there is no path for the function to read.
  if (!token || (payload.kind === "file" && !payload.mediaPath)) return fallback();

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        kind: payload.kind,
        text: payload.text,
        mediaPath: payload.mediaPath,
        mime: payload.mime,
        filename: payload.filename,
        lang: payload.lang === "en" ? "en" : "ko",
      }),
      signal: payload.signal,
    });
    if (payload.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    if (!res.ok) return fallback();
    const data = (await res.json()) as AnalyzeResult;
    if (!data || !data.type) return fallback();
    const summary = String(data.summary || data.body || "").slice(0, 400);
    const analysis = String(data.analysis || "").slice(0, 800);
    return {
      ...data,
      body: String(data.body || summary).slice(0, 400),
      summary,
      analysis,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    if (err instanceof Error && err.name === "AbortError") throw err;
    return fallback();
  }
}
