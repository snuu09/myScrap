import type { Scrap } from "./types";

export type ScrapFilterState = {
  query: string;
  /** Legacy single type; prefer `types` when set. */
  type?: string;
  /** Multi-type OR. Empty / ["all"] = no type gate. `bookmarked` alone filters bookmarks. */
  types?: string[];
  /** Inclusive local day bounds YYYY-MM-DD. Prefer over legacy `day`. */
  from?: string | null;
  to?: string | null;
  /** Legacy single day; treated as from=to when from/to absent. */
  day?: string | null;
  tags?: string[];
};

export function localDayKey(ms: number) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function resolveDateBounds(state: Pick<ScrapFilterState, "from" | "to" | "day">): {
  from: string | null;
  to: string | null;
} {
  if (state.from || state.to) {
    const from = state.from || state.to || null;
    const to = state.to || state.from || null;
    if (from && to && from > to) return { from: to, to: from };
    return { from, to };
  }
  if (state.day) return { from: state.day, to: state.day };
  return { from: null, to: null };
}

function typeGate(item: Scrap, state: ScrapFilterState): boolean {
  const types = state.types?.length
    ? state.types
    : state.type && state.type !== "all"
      ? [state.type]
      : [];
  if (!types.length || types.includes("all")) return true;
  if (types.length === 1 && types[0] === "bookmarked") return Boolean(item.bookmarked);
  const media = types.filter((t) => t !== "all" && t !== "bookmarked");
  const wantBookmark = types.includes("bookmarked");
  if (wantBookmark && !media.length) return Boolean(item.bookmarked);
  if (wantBookmark && media.length) {
    return Boolean(item.bookmarked) && media.includes(item.type);
  }
  return media.includes(item.type);
}

export function filterScraps(scraps: Scrap[], state: ScrapFilterState) {
  const q = state.query.trim().toLowerCase();
  const { from, to } = resolveDateBounds(state);
  return scraps.filter((item) => {
    if (!typeGate(item, state)) return false;
    if (from || to) {
      const key = localDayKey(item.createdAt);
      if (from && key < from) return false;
      if (to && key > to) return false;
    }
    if (state.tags?.length && !item.tags.some((tag) => state.tags?.includes(tag))) return false;
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

export function countInRange(scraps: Scrap[], from: string | null, to: string | null) {
  if (!from && !to) return scraps.length;
  return filterScraps(scraps, { query: "", from, to }).length;
}

export function monthBounds(year: number, month: number): { from: string; to: string } {
  const last = new Date(year, month + 1, 0).getDate();
  return {
    from: dayKey(year, month, 1),
    to: dayKey(year, month, last),
  };
}

export function scrapsInMonth(scraps: Scrap[], year: number, month: number) {
  const { from, to } = monthBounds(year, month);
  return countInRange(scraps, from, to);
}

export function yearsWithScraps(scraps: Scrap[]) {
  const years = new Set<string>();
  for (const item of scraps) years.add(String(new Date(item.createdAt).getFullYear()));
  return [...years].map(Number).sort((a, b) => b - a);
}

export function formatDayDot(key: string) {
  const [y, m, d] = key.split("-");
  return `${y}.${m}.${d}`;
}

export function formatRangeLabel(from: string | null, to: string | null, empty = "") {
  if (!from && !to) return empty;
  if (from && to && from === to) return formatDayDot(from);
  if (from && to) {
    const [, fm, fd] = from.split("-");
    const [, tm, td] = to.split("-");
    if (from.slice(0, 4) === to.slice(0, 4) && from.slice(5, 7) === to.slice(5, 7)) {
      return `${from.slice(0, 4)}.${fm}.${fd} ~ ${td}`;
    }
    if (from.slice(0, 4) === to.slice(0, 4)) {
      return `${from.slice(0, 4)}.${fm}.${fd} ~ ${tm}.${td}`;
    }
    return `${formatDayDot(from)} ~ ${formatDayDot(to)}`;
  }
  return formatDayDot(from || to || "");
}

/** Inclusive day keys between from and to (capped for slider axes). */
export function dayKeysBetween(from: string, to: string): string[] {
  let a = from;
  let b = to;
  if (a > b) [a, b] = [b, a];
  const out: string[] = [];
  const cur = new Date(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10));
  const end = new Date(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10));
  while (cur <= end) {
    out.push(dayKey(cur.getFullYear(), cur.getMonth(), cur.getDate()));
    cur.setDate(cur.getDate() + 1);
    if (out.length > 800) break;
  }
  return out;
}

export function minMaxDayKeys(scraps: Scrap[]): { min: string | null; max: string | null } {
  if (!scraps.length) return { min: null, max: null };
  let min = localDayKey(scraps[0].createdAt);
  let max = min;
  for (const item of scraps) {
    const k = localDayKey(item.createdAt);
    if (k < min) min = k;
    if (k > max) max = k;
  }
  return { min, max };
}

export function addDaysKey(key: string, delta: number) {
  const d = new Date(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10));
  d.setDate(d.getDate() + delta);
  return dayKey(d.getFullYear(), d.getMonth(), d.getDate());
}

export function startOfMonthKey(d = new Date()) {
  return dayKey(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonthKey(d = new Date()) {
  return dayKey(d.getFullYear(), d.getMonth(), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate());
}

export function presetRange(
  kind: "7d" | "month" | "3m" | "h1",
  now = new Date(),
): { from: string; to: string } {
  const today = dayKey(now.getFullYear(), now.getMonth(), now.getDate());
  if (kind === "7d") return { from: addDaysKey(today, -6), to: today };
  if (kind === "month") return { from: startOfMonthKey(now), to: today };
  if (kind === "3m") return { from: addDaysKey(today, -89), to: today };
  // H1 of current year
  const y = now.getFullYear();
  const mid = dayKey(y, 5, 30);
  const to = today < mid ? today : mid;
  return { from: dayKey(y, 0, 1), to };
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
  const topTags = [...byTag.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
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

export function monthsWithScraps(scraps: Scrap[]) {
  const keys = new Set<string>();
  for (const item of scraps) {
    const d = new Date(item.createdAt);
    keys.add(`${d.getFullYear()}-${d.getMonth()}`);
  }
  return [...keys]
    .map((key) => {
      const [y, m] = key.split("-").map(Number);
      return { year: y, month: m };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month);
}

/**
 * Months from first data month through last data month (inclusive gaps),
 * never past the current calendar month. Empty June between May and July is kept.
 */
export function monthsInArchiveSpan(scraps: Scrap[], now = new Date()) {
  const withData = monthsWithScraps(scraps);
  const cap = now.getFullYear() * 12 + now.getMonth();
  const past = withData.filter((row) => row.year * 12 + row.month <= cap);
  if (!past.length) return [] as { year: number; month: number }[];
  const first = past[0];
  const last = past[past.length - 1];
  const out: { year: number; month: number }[] = [];
  let y = first.year;
  let m = first.month;
  const end = last.year * 12 + last.month;
  while (y * 12 + m <= end) {
    out.push({ year: y, month: m });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return out;
}
