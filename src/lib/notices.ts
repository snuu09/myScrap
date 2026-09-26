import { PLAN_TRIAL_DAYS } from "./planFeatures";
import type { PlanTier, Profile } from "./plans";
import { formatBytes } from "./tagger";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Show period notice when expired or this many days (or fewer) remain (non-browse). */
export const NOTICE_PERIOD_DAYS = 7;
/** Storage warn / critical thresholds (percent of limit). */
export const NOTICE_STORAGE_WARN_PCT = 80;
export const NOTICE_STORAGE_CRIT_PCT = 95;
/** Max items shown in the header panel before “see all”. */
export const NOTICE_PANEL_MAX = 5;

export const ONBOARDING_PREFS_KEY = "mybrary.notice.onboardingPrefs";
export const SEEN_NOTICES_KEY = "mybrary.notice.seen";
export const NOTICE_LOG_KEY = "mybrary.notice.log";
export const DISMISSED_NOTICES_KEY = "mybrary.notice.dismissed";
/** Cap persisted history so localStorage stays small. */
export const NOTICE_LOG_MAX = 40;

export type NoticeSeverity = "info" | "warn" | "urgent";
export type NoticeKind = "onboardingPrefs" | "periodFree" | "periodPaid" | "storage";

export type NoticeItem = {
  id: string;
  kind: NoticeKind;
  severity: NoticeSeverity;
  /** i18n key */
  titleKey: string;
  titleVars?: Record<string, string | number>;
  href: "/upgrade" | "/settings";
};

export type NoticeLogEntry = NoticeItem & {
  firstAt: number;
  lastAt: number;
  dismissed: boolean;
};

function emitNoticesChange() {
  window.dispatchEvent(new Event("mybrary:notices-change"));
}

type BuildOpts = {
  browse: boolean;
  profile: Profile | null;
  planTier: PlanTier;
  trialDaysLeft: number | null;
  trialExpired: boolean;
  createdAtIso: string | undefined;
  usageBytes: number;
  storageLimit: number | null;
  /** Future: paid plan period end (ms). Omitted until billing ships. */
  paidEndsAt?: number | null;
  /** When false, skip the one-time prefs onboarding tip. */
  showOnboardingPrefs?: boolean;
};

export function readOnboardingPrefsDismissed() {
  try {
    return localStorage.getItem(ONBOARDING_PREFS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissOnboardingPrefs() {
  try {
    localStorage.setItem(ONBOARDING_PREFS_KEY, "1");
  } catch {
    /* ignore */
  }
  emitNoticesChange();
}

export function readSeenNoticeIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_NOTICES_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function markNoticesSeen(ids: string[]) {
  if (ids.length === 0) return;
  const next = readSeenNoticeIds();
  let changed = false;
  for (const id of ids) {
    if (!next.has(id)) {
      next.add(id);
      changed = true;
    }
  }
  if (!changed) return;
  try {
    localStorage.setItem(SEEN_NOTICES_KEY, JSON.stringify([...next]));
  } catch {
    /* ignore */
  }
  emitNoticesChange();
}

export function isNoticeUnread(id: string, seen = readSeenNoticeIds()) {
  return !seen.has(id);
}

function readIdSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function writeIdSet(key: string, ids: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

export function readDismissedNoticeIds() {
  return readIdSet(DISMISSED_NOTICES_KEY);
}

function isNoticeLogEntry(value: unknown): value is NoticeLogEntry {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.kind === "string" &&
    typeof row.severity === "string" &&
    typeof row.titleKey === "string" &&
    (row.href === "/upgrade" || row.href === "/settings") &&
    typeof row.firstAt === "number" &&
    typeof row.lastAt === "number" &&
    typeof row.dismissed === "boolean"
  );
}

export function readNoticeLog(): NoticeLogEntry[] {
  try {
    const raw = localStorage.getItem(NOTICE_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isNoticeLogEntry).sort((a, b) => b.lastAt - a.lastAt);
  } catch {
    return [];
  }
}

function writeNoticeLog(entries: NoticeLogEntry[]) {
  const trimmed = [...entries]
    .sort((a, b) => b.lastAt - a.lastAt)
    .slice(0, NOTICE_LOG_MAX);
  try {
    localStorage.setItem(NOTICE_LOG_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

/** Merge live notices into the durable history log. Silent (no event) to avoid render loops. */
export function upsertNoticeLog(items: NoticeItem[], now = Date.now()): boolean {
  if (items.length === 0) return false;
  const byId = new Map(readNoticeLog().map((entry) => [entry.id, entry]));
  let changed = false;
  for (const item of items) {
    const prev = byId.get(item.id);
    if (prev) {
      const contentChanged =
        prev.titleKey !== item.titleKey ||
        prev.severity !== item.severity ||
        prev.href !== item.href ||
        prev.kind !== item.kind ||
        JSON.stringify(prev.titleVars ?? null) !== JSON.stringify(item.titleVars ?? null);
      if (!contentChanged) continue;
      byId.set(item.id, {
        ...prev,
        ...item,
        firstAt: prev.firstAt,
        lastAt: now,
        dismissed: prev.dismissed,
      });
      changed = true;
    } else {
      byId.set(item.id, {
        ...item,
        firstAt: now,
        lastAt: now,
        dismissed: false,
      });
      changed = true;
    }
  }
  if (!changed) return false;
  writeNoticeLog([...byId.values()]);
  return true;
}

/** Hide from the bell panel; keep in history. */
export function dismissNotice(id: string) {
  const dismissed = readDismissedNoticeIds();
  dismissed.add(id);
  writeIdSet(DISMISSED_NOTICES_KEY, dismissed);

  const log = readNoticeLog();
  const idx = log.findIndex((entry) => entry.id === id);
  if (idx >= 0 && !log[idx].dismissed) {
    log[idx] = { ...log[idx], dismissed: true, lastAt: Date.now() };
    writeNoticeLog(log);
  }

  markNoticesSeen([id]);
  if (id === "onboarding-prefs") dismissOnboardingPrefs();
  else emitNoticesChange();
}

/** Wipe history + dismissals + seen flags. Onboarding prefs tip stays dismissed if already closed. */
export function clearNoticeHistory() {
  try {
    localStorage.removeItem(NOTICE_LOG_KEY);
    localStorage.removeItem(DISMISSED_NOTICES_KEY);
    localStorage.removeItem(SEEN_NOTICES_KEY);
  } catch {
    /* ignore */
  }
  emitNoticesChange();
}

function sessionDaysLeft(createdAtIso: string | undefined, now: number) {
  const start = createdAtIso ? Date.parse(createdAtIso) : NaN;
  if (!Number.isFinite(start)) return { daysLeft: PLAN_TRIAL_DAYS, expired: false };
  const endsAt = start + PLAN_TRIAL_DAYS * DAY_MS;
  const left = Math.ceil((endsAt - now) / DAY_MS);
  if (left <= 0) return { daysLeft: 0, expired: true };
  return { daysLeft: left, expired: false };
}

function freePeriodDays(opts: BuildOpts, now: number) {
  const { browse, profile, planTier, trialDaysLeft, trialExpired, createdAtIso } = opts;
  const useSession = browse || (planTier === "free" && profile?.trialEndsAt == null);
  if (useSession) return sessionDaysLeft(createdAtIso, now);
  if (planTier !== "free") return null;
  if (trialEndsMissing(profile, trialDaysLeft, trialExpired)) return null;
  return {
    daysLeft: trialExpired ? 0 : (trialDaysLeft ?? 0),
    expired: trialExpired,
  };
}

function trialEndsMissing(
  profile: Profile | null,
  trialDaysLeft: number | null,
  trialExpired: boolean,
) {
  return profile?.trialEndsAt == null && trialDaysLeft == null && !trialExpired;
}

function paidPeriodDays(paidEndsAt: number | null | undefined, now: number) {
  if (paidEndsAt == null || !Number.isFinite(paidEndsAt)) return null;
  const left = Math.ceil((paidEndsAt - now) / DAY_MS);
  if (left <= 0) return { daysLeft: 0, expired: true };
  return { daysLeft: left, expired: false };
}

function pushFreePeriod(items: NoticeItem[], free: { daysLeft: number; expired: boolean }, browse: boolean) {
  if (free.expired) {
    items.push({
      id: "period-free-expired",
      kind: "periodFree",
      severity: "urgent",
      titleKey: "noticePeriodFreeExpired",
      href: "/upgrade",
    });
    return;
  }
  /** Include daysLeft in id so each day decrement reappears as unread. */
  if (browse) {
    items.push({
      id: `period-browse-${free.daysLeft}`,
      kind: "periodFree",
      severity: free.daysLeft <= 3 ? "urgent" : free.daysLeft <= NOTICE_PERIOD_DAYS ? "warn" : "info",
      titleKey: "noticeBrowsePeriod",
      titleVars: { n: free.daysLeft },
      href: "/upgrade",
    });
    return;
  }
  if (free.daysLeft <= NOTICE_PERIOD_DAYS) {
    items.push({
      id: `period-free-${free.daysLeft}`,
      kind: "periodFree",
      severity: free.daysLeft <= 3 ? "urgent" : "warn",
      titleKey: "noticePeriodFreeSoon",
      titleVars: { n: free.daysLeft },
      href: "/upgrade",
    });
  }
}

function pushStorage(items: NoticeItem[], usageBytes: number, storageLimit: number) {
  const pct = (usageBytes / storageLimit) * 100;
  const used = formatBytes(usageBytes);
  const limit = formatBytes(storageLimit);

  /** Threshold-scoped ids so crossing warn → crit → full re-alerts unread. */
  if (pct >= 100 || usageBytes >= storageLimit) {
    items.push({
      id: "storage-full",
      kind: "storage",
      severity: "urgent",
      titleKey: "noticeStorageFull",
      titleVars: { used, limit },
      href: "/upgrade",
    });
    return;
  }

  if (pct >= NOTICE_STORAGE_CRIT_PCT) {
    items.push({
      id: "storage-crit",
      kind: "storage",
      severity: "urgent",
      titleKey: "noticeStorageSoon",
      titleVars: { pct: Math.floor(pct), used, limit },
      href: "/settings",
    });
    return;
  }

  if (pct >= NOTICE_STORAGE_WARN_PCT) {
    items.push({
      id: "storage-warn",
      kind: "storage",
      severity: "warn",
      titleKey: "noticeStorageSoon",
      titleVars: { pct: Math.floor(pct), used, limit },
      href: "/settings",
    });
  }
}

/** Personal notices: onboarding tip, period, and storage. */
export function buildNotices(opts: BuildOpts, now = Date.now()): NoticeItem[] {
  const items: NoticeItem[] = [];

  if (opts.showOnboardingPrefs !== false && !readOnboardingPrefsDismissed()) {
    items.push({
      id: "onboarding-prefs",
      kind: "onboardingPrefs",
      severity: "info",
      titleKey: "noticeOnboardingPrefs",
      href: "/settings",
    });
  }

  const free = freePeriodDays(opts, now);
  if (free) {
    if (opts.browse || free.expired || free.daysLeft <= NOTICE_PERIOD_DAYS) {
      pushFreePeriod(items, free, opts.browse);
    }
  }

  const paid =
    opts.planTier === "standard" || opts.planTier === "premium" || opts.planTier === "admin"
      ? paidPeriodDays(opts.paidEndsAt, now)
      : null;
  if (paid && (paid.expired || paid.daysLeft <= NOTICE_PERIOD_DAYS)) {
    items.push(
      paid.expired
        ? {
            id: "period-paid-expired",
            kind: "periodPaid",
            severity: "urgent",
            titleKey: "noticePeriodPaidExpired",
            href: "/upgrade",
          }
        : {
            id: `period-paid-${paid.daysLeft}`,
            kind: "periodPaid",
            severity: paid.daysLeft <= 3 ? "urgent" : "warn",
            titleKey: "noticePeriodPaidSoon",
            titleVars: { n: paid.daysLeft },
            href: "/upgrade",
          },
    );
  }

  const { storageLimit, usageBytes } = opts;
  if (storageLimit != null && storageLimit > 0) {
    pushStorage(items, usageBytes, storageLimit);
  }

  return items;
}
