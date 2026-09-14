import type { Scrap } from "./types";

function tokens(value: string) {
  return value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 1);
}

function scorePair(item: Scrap, other: Scrap) {
  const shared = item.tags.filter((tag) => other.tags.includes(tag)).length;
  const domain = item.domain && item.domain === other.domain ? 2 : 0;
  const type = item.type && item.type === other.type ? 1 : 0;
  const mine = new Set(tokens(item.title));
  const overlap = tokens(other.title).filter((token) => mine.has(token)).length;
  return shared * 3 + domain + type + overlap;
}

/** Related pages from fields already on the shelf. No extra classify call. */
export function relatedScraps(item: Scrap, all: Scrap[]) {
  return all
    .filter((other) => other.id !== item.id)
    .map((other) => ({ other, score: scorePair(item, other) }))
    .filter((row) => row.score >= 3)
    .sort((a, b) => b.score - a.score || b.other.createdAt - a.other.createdAt)
    .map((row) => row.other);
}
