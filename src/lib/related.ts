import type { Scrap } from "./types";

function tokens(value: string) {
  return value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 1);
}

function bodyText(item: Scrap) {
  return [item.text, item.previewText, item.memo].filter(Boolean).join(" ");
}

function scorePair(item: Scrap, other: Scrap) {
  const shared = item.tags.filter((tag) => other.tags.includes(tag)).length;
  const mineBody = new Set(tokens(bodyText(item)));
  const bodyOverlap = tokens(bodyText(other)).filter((token) => mineBody.has(token)).length;
  const mineTitle = new Set(tokens(item.title));
  const titleOverlap = tokens(other.title).filter((token) => mineTitle.has(token)).length;
  const domain = item.domain && item.domain === other.domain ? 1 : 0;
  const type = item.type && item.type === other.type ? 0.25 : 0;
  return shared * 3 + bodyOverlap * 2 + titleOverlap + domain + type;
}

/** Similar pages from summary, analysis, memo, and tags. No extra classify call. */
export function relatedScraps(item: Scrap, all: Scrap[], excludeIds: string[] = []) {
  const skip = new Set([item.id, ...excludeIds]);
  return all
    .filter((other) => !skip.has(other.id))
    .map((other) => ({ other, score: scorePair(item, other) }))
    .filter((row) => row.score >= 3)
    .sort((a, b) => b.score - a.score || b.other.createdAt - a.other.createdAt)
    .map((row) => row.other);
}
