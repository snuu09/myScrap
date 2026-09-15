import { SYSTEM_TYPES } from "./typeCatalog";
import type { Scrap } from "./types";

/** MIME/type/language labels that co-occur too widely to mean “similar topic”. */
const GENERIC_TAGS = new Set<string>([
  ...SYSTEM_TYPES,
  "unknown",
  "file",
  "media",
  "photo",
  "music",
  "web",
  "url",
  "tool",
  "korean",
  "english",
  "japanese",
  "chinese",
  "한국어",
  "영어",
  "일본어",
  "중국어",
]);

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "your",
  "you",
  "are",
  "was",
  "were",
  "have",
  "has",
  "had",
  "not",
  "but",
  "all",
  "can",
  "will",
  "just",
  "about",
  "into",
  "over",
  "after",
  "before",
  "http",
  "https",
  "www",
  "com",
  "org",
  "net",
  "html",
  "그리고",
  "그러나",
  "또는",
  "에서",
  "으로",
  "로서",
  "하는",
  "하게",
  "하여",
  "있는",
  "없는",
  "있다",
  "없다",
  "된다",
  "한다",
  "위해",
  "대한",
  "통해",
  "관련",
  "같은",
  "다른",
  "이것",
  "그것",
  "저것",
  "여기",
  "거기",
]);

const MIN_SCORE = 5;
const MAX_RELATED = 8;

function tokens(value: string) {
  return value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 1);
}

function contentTokens(value: string) {
  return tokens(value).filter((part) => part.length > 2 && !STOP.has(part));
}

function topicTags(tags: string[]) {
  return tags
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 1 && !GENERIC_TAGS.has(tag));
}

function bodyText(item: Scrap) {
  return [item.text, item.previewText, item.memo].filter(Boolean).join(" ");
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0;
  let hit = 0;
  for (const token of a) if (b.has(token)) hit += 1;
  return hit / (a.size + b.size - hit);
}

function scorePair(item: Scrap, other: Scrap) {
  const mineTopics = topicTags(item.tags);
  const otherTopics = new Set(topicTags(other.tags));
  const sharedTopics = mineTopics.filter((tag) => otherTopics.has(tag)).length;

  const mineTitle = new Set(contentTokens(item.title));
  const titleOverlap = contentTokens(other.title).filter((token) => mineTitle.has(token)).length;

  const mineBody = new Set(contentTokens(bodyText(item)));
  const otherBody = new Set(contentTokens(bodyText(other)));
  const bodyScore = Math.min(4, jaccard(mineBody, otherBody) * 10);

  const domain = item.domain && item.domain === other.domain ? 2 : 0;

  return sharedTopics * 4 + Math.min(5, titleOverlap * 2.5) + bodyScore + domain;
}

/** Similar pages from summary, analysis, memo, and topic tags. No extra classify call. */
export function relatedScraps(item: Scrap, all: Scrap[], excludeIds: string[] = []) {
  const skip = new Set([item.id, ...excludeIds]);
  return all
    .filter((other) => !skip.has(other.id))
    .map((other) => ({ other, score: scorePair(item, other) }))
    .filter((row) => row.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || b.other.createdAt - a.other.createdAt)
    .slice(0, MAX_RELATED)
    .map((row) => row.other);
}
