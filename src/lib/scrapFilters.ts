import type { Scrap, ScrapType } from "./types";

export type ScrapFilterState = {
  query: string;
  type: ScrapType | "all";
  day: string | null;
};

export function localDayKey(ms: number) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function filterScraps(scraps: Scrap[], state: ScrapFilterState) {
  const q = state.query.trim().toLowerCase();
  return scraps.filter((item) => {
    if (state.type !== "all" && item.type !== state.type) return false;
    if (state.day && localDayKey(item.createdAt) !== state.day) return false;
    if (!q) return true;
    const blob = [item.title, item.text, item.memo, item.url, item.filename, item.tags.join(" ")]
      .join(" ")
      .toLowerCase();
    return blob.includes(q);
  });
}

export function scrapsByDay(scraps: Scrap[]) {
  const map = new Map<string, number>();
  for (const item of scraps) {
    const key = localDayKey(item.createdAt);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

export function aggregateStats(scraps: Scrap[]) {
  const byType = new Map<string, number>();
  const byTag = new Map<string, number>();
  let totalBytes = 0;
  for (const item of scraps) {
    byType.set(item.type, (byType.get(item.type) || 0) + 1);
    for (const tag of item.tags) {
      byTag.set(tag, (byTag.get(tag) || 0) + 1);
    }
    if (item.storedMedia || item.mediaPath) totalBytes += Number(item.size) || 0;
  }
  const topTags = [...byTag.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  const topDays = [...scrapsByDay(scraps).entries()].sort((a, b) => b[1] - a[1]).slice(0, 7);
  return { byType, byTag: topTags, totalBytes, topDays, totalCount: scraps.length };
}

export function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function dayKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
