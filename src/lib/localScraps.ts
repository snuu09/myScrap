import { computeUsageBytes } from "./plans";
import type { Scrap } from "./types";

const SCRAPS_KEY = "mybrary.guest.scraps";
const NOTICE_KEY = "mybrary.guest.notice";
const MIGRATE_KEY = "mybrary.guest.migrateAsked";
const VERSION = 1;

const MB = 1024 * 1024;
/** One data URL per scrap has to fit next to the others in a ~5MB origin quota. */
export const GUEST_FILE_LIMIT = Math.round(1.5 * MB);
export const GUEST_TOTAL_LIMIT = 4 * MB;

type Envelope = { v: number; scraps: Scrap[] };

/** Thrown when localStorage refuses the write, so the UI can explain the device limit. */
export class GuestQuotaError extends Error {
  constructor() {
    super("guest-quota");
    this.name = "GuestQuotaError";
  }
}

function normalize(item: Scrap): Scrap {
  return {
    ...item,
    bookmarked: Boolean(item.bookmarked),
    readAt: item.readAt ?? null,
    remindAt: item.remindAt ?? null,
    og: item.og ?? null,
    ogStatus: item.ogStatus || "",
  };
}

function readAll(): Scrap[] {
  try {
    const raw = localStorage.getItem(SCRAPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Envelope | Scrap[];
    const list = Array.isArray(parsed) ? parsed : parsed?.scraps;
    if (!Array.isArray(list)) return [];
    return list
      .filter((item): item is Scrap => Boolean(item && typeof item.id === "string"))
      .map(normalize);
  } catch {
    return [];
  }
}

function writeAll(scraps: Scrap[]) {
  const envelope: Envelope = { v: VERSION, scraps };
  try {
    localStorage.setItem(SCRAPS_KEY, JSON.stringify(envelope));
  } catch {
    throw new GuestQuotaError();
  }
}

function byNewest(list: Scrap[]) {
  return [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function loadLocalScraps(): Scrap[] {
  return byNewest(readAll());
}

export function saveLocalScrap(scrap: Scrap) {
  const list = readAll().filter((item) => item.id !== scrap.id);
  list.push({ ...scrap, analyzing: false });
  writeAll(list);
  // New device scraps re-arm the move-to-account question for the next sign-in.
  clearGuestMigrateAsked();
}

export function deleteLocalScrap(scrap: Scrap) {
  writeAll(readAll().filter((item) => item.id !== scrap.id));
}

export function clearLocalScraps() {
  try {
    localStorage.removeItem(SCRAPS_KEY);
  } catch {
    /* nothing left to clear */
  }
}

export function localUsage(): { count: number; bytes: number } {
  const list = readAll();
  return { count: list.length, bytes: computeUsageBytes(list) };
}

export function localScrapCount() {
  return readAll().length;
}

export function hasLocalScraps() {
  return readAll().length > 0;
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

/** Keeps guest media inline as a data URL. Oversized files are shelved without a preview. */
export async function attachLocalMedia(file: File) {
  const used = localUsage().bytes;
  if (file.size > GUEST_FILE_LIMIT || used + file.size > GUEST_TOTAL_LIMIT) {
    return { mediaPath: "", dataUrl: "", storedMedia: false, skipped: true };
  }
  const dataUrl = await readAsDataUrl(file);
  return { mediaPath: "", dataUrl, storedMedia: Boolean(dataUrl), skipped: false };
}

export async function dataUrlToFile(dataUrl: string, filename: string, mime: string) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename || "media", { type: mime || blob.type || "application/octet-stream" });
}

export function guestNoticeSeen() {
  try {
    return localStorage.getItem(NOTICE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markGuestNoticeSeen() {
  try {
    localStorage.setItem(NOTICE_KEY, "1");
  } catch {
    /* the notice shows again next time */
  }
}

export function guestMigrateAsked() {
  try {
    return localStorage.getItem(MIGRATE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markGuestMigrateAsked() {
  try {
    localStorage.setItem(MIGRATE_KEY, "1");
  } catch {
    /* the question comes back next sign-in */
  }
}

export function clearGuestMigrateAsked() {
  try {
    localStorage.removeItem(MIGRATE_KEY);
  } catch {
    /* ignore */
  }
}
