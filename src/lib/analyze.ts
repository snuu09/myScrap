import type { AnalyzeResult, ScrapType } from "./types";
import { analyzeFile, analyzeText } from "./tagger";
import { getAccessToken } from "./scraps";

type Payload = {
  kind: "text" | "file";
  text?: string;
  mediaPath?: string;
  mime?: string;
  filename?: string;
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
      fallback: true,
    };
  };

  if (!token) return fallback();

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return fallback();
    const data = (await res.json()) as AnalyzeResult;
    if (!data || !data.type) return fallback();
    return data;
  } catch {
    return fallback();
  }
}
