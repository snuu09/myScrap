import type { Scrap, ScrapRevision } from "./types";

export type { ScrapRevision };

type RevisionKind = ScrapRevision["kind"];

export const REVISION_LIMIT = 30;

export function parseRevisions(raw: unknown): ScrapRevision[] {
  if (!Array.isArray(raw)) return [];
  const next: ScrapRevision[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const id = String(item.id || "");
    if (!id) continue;
    next.push({
      id,
      at: Number(item.at) || 0,
      kind: item.kind === "ai" ? "ai" : "edit",
      title: String(item.title || ""),
      memo: String(item.memo || ""),
      tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag)).filter(Boolean) : [],
      type: String(item.type || "text"),
      text: String(item.text || ""),
      previewText: String(item.previewText || item.preview_text || ""),
    });
  }
  return next.slice(0, REVISION_LIMIT);
}

export function pushRevision(item: Scrap, kind: RevisionKind): ScrapRevision[] {
  const snap: ScrapRevision = {
    id: crypto.randomUUID(),
    at: Date.now(),
    kind,
    title: item.title || "",
    memo: item.memo || "",
    tags: [...(item.tags || [])],
    type: item.type || "text",
    text: item.text || "",
    previewText: item.previewText || "",
  };
  return [snap, ...parseRevisions(item.revisions)].slice(0, REVISION_LIMIT);
}

export function applyRevision(item: Scrap, revision: ScrapRevision): Scrap {
  return {
    ...item,
    title: revision.title,
    memo: revision.memo,
    tags: [...revision.tags],
    type: revision.type,
    text: revision.text,
    previewText: revision.previewText ?? item.previewText,
    revisions: pushRevision(item, "edit"),
    updatedAt: Date.now(),
  };
}
