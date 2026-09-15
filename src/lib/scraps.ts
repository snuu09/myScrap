import type { User } from "@supabase/supabase-js";
import * as tus from "tus-js-client";
import { getSupabase } from "./supabase";
import { isBrowseUser } from "./guest";
import {
  attachLocalMedia,
  clearLocalScraps,
  deleteLocalScrap,
  loadLocalScraps,
  localUsage,
  saveLocalScrap,
} from "./localScraps";
import { parseRevisions } from "./revisions";
import type { Scrap } from "./types";

const BUCKET = "scrap-media";
const SIGNED_TTL = 60 * 60;
/** Standard multipart upload is unreliable above this; use TUS instead. */
const RESUMABLE_BYTES = 6 * 1024 * 1024;

type Row = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  type: string;
  tags: unknown;
  title: string;
  body: string;
  url: string;
  filename: string;
  mime: string;
  extension: string;
  size: number;
  preview_text: string;
  source_text?: string;
  pages: number;
  og: unknown;
  og_status: string;
  sample: boolean;
  ephemeral: boolean;
  stored_media: boolean;
  domain: string;
  error: string;
  memo: string;
  media_path: string | null;
  poster_path: string | null;
  bookmarked?: boolean;
  read_at?: string | null;
  remind_at?: string | null;
  revisions?: unknown;
};

function parseOg(raw: unknown): Scrap["og"] {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    title: String(o.title || ""),
    description: String(o.description || ""),
    image: String(o.image || ""),
    siteName: String(o.siteName || o.site_name || ""),
    favicon: String(o.favicon || ""),
  };
}

function extFor(scrap: Scrap) {
  const ext = String(scrap.extension || "").replace(/^\./, "");
  if (ext) return ext;
  if (scrap.type === "image") return "jpg";
  if (scrap.type === "video") return "mp4";
  if (scrap.type === "audio") return "mp3";
  return "bin";
}

export function mediaObjectPath(userId: string, scrap: Scrap) {
  return userId + "/" + scrap.id + "/media." + extFor(scrap);
}

export function posterObjectPath(userId: string, scrapId: string) {
  return posterPagePath(userId, scrapId, 1);
}

export function posterPagePath(userId: string, scrapId: string, index: number) {
  return userId + "/" + scrapId + "/poster-" + index + ".jpg";
}

export function isPagedPosterPath(path: string) {
  return /\/poster-\d+\.jpg$/.test(String(path || ""));
}

/** Storage paths for cover pages. Legacy `poster.jpg` stays a single file. */
export function posterPathsFor(scrap: Pick<Scrap, "id" | "posterPath" | "pages">) {
  const path = scrap.posterPath || "";
  if (!path) return [];
  if (!isPagedPosterPath(path)) return [path];
  const [userId, scrapId] = path.split("/");
  if (!userId || !scrapId) return [path];
  const count = Math.max(1, Number(scrap.pages) || 1);
  return Array.from({ length: count }, (_, i) => posterPagePath(userId, scrapId, i + 1));
}

function posterCleanupPaths(userId: string, scrap: Pick<Scrap, "id" | "posterPath" | "pages">) {
  const paths = new Set<string>();
  if (scrap.posterPath) paths.add(scrap.posterPath);
  paths.add(userId + "/" + scrap.id + "/poster.jpg");
  const count = Math.max(4, Number(scrap.pages) || 0);
  for (let i = 1; i <= count; i++) paths.add(posterPagePath(userId, scrap.id, i));
  return [...paths];
}

type SignedCacheEntry = { url: string; expiresAt: number };

const signedUrlCache = new Map<string, SignedCacheEntry>();
const CACHE_SLACK_MS = 5 * 60 * 1000;

function cachedSignedUrl(path: string) {
  const hit = signedUrlCache.get(path);
  if (!hit) return "";
  if (hit.expiresAt - Date.now() < CACHE_SLACK_MS) {
    signedUrlCache.delete(path);
    return "";
  }
  return hit.url;
}

function rememberSignedUrl(path: string, url: string) {
  if (!path || !url) return;
  signedUrlCache.set(path, { url, expiresAt: Date.now() + SIGNED_TTL * 1000 });
}

async function signedUrl(path: string | null) {
  const supabase = getSupabase();
  if (!supabase || !path) return "";
  const cached = cachedSignedUrl(path);
  if (cached) return cached;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
  if (error || !data?.signedUrl) return "";
  rememberSignedUrl(path, data.signedUrl);
  return data.signedUrl;
}

function needsSignedMedia(scrap: Scrap) {
  if (!scrap.mediaPath) return false;
  // OG image is enough for link cards; otherwise rehydrate any stored blob (image/video/audio/doc).
  if (scrap.type === "image" && scrap.og?.image) return false;
  return true;
}

function posterPathsToSign(scrap: Scrap, posterPages?: number) {
  const all = posterPathsFor(scrap);
  if (!posterPages || posterPages < 1) return all;
  return all.slice(0, posterPages);
}

function needsSignedPoster(scrap: Scrap, posterPages?: number) {
  if (!scrap.posterPath) return false;
  const wanted = posterPathsToSign(scrap, posterPages);
  if (!wanted.length) return false;
  if (!scrap.posterUrl) return true;
  if (posterPages) return false;
  return wanted.length > 1 && scrap.posterUrls.length < wanted.length;
}

/** Batch-sign media + poster paths and fill `dataUrl` / `posterUrl` (session-cached). */
export async function hydrateSignedMedia(
  scraps: Scrap[],
  opts?: { posterPages?: number },
): Promise<Scrap[]> {
  const supabase = getSupabase();
  if (!supabase || !scraps.length) return scraps;
  const posterPages = opts?.posterPages;

  const paths: string[] = [];
  const urlByPath = new Map<string, string>();

  for (const scrap of scraps) {
    const candidates = [
      needsSignedMedia(scrap) ? scrap.mediaPath : "",
      ...(needsSignedPoster(scrap, posterPages) ? posterPathsToSign(scrap, posterPages) : []),
    ].filter(Boolean);
    for (const path of candidates) {
      const cached = cachedSignedUrl(path);
      if (cached) {
        urlByPath.set(path, cached);
        continue;
      }
      if (!paths.includes(path)) paths.push(path);
    }
  }

  if (paths.length) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_TTL);
    if (!error && data) {
      for (const row of data) {
        if (!row?.path || !row.signedUrl || row.error) continue;
        rememberSignedUrl(row.path, row.signedUrl);
        urlByPath.set(row.path, row.signedUrl);
      }
    } else {
      await Promise.all(
        paths.map(async (path) => {
          const url = await signedUrl(path);
          if (url) urlByPath.set(path, url);
        }),
      );
    }
  }

  if (!urlByPath.size) return scraps;

  return scraps.map((scrap) => {
    let next = scrap;
    if (needsSignedMedia(scrap)) {
      const url = urlByPath.get(scrap.mediaPath);
      if (url) next = { ...next, dataUrl: url, storedMedia: true };
    }
    if (scrap.posterPath && needsSignedPoster(scrap, posterPages)) {
      const urls = posterPathsToSign(scrap, posterPages)
        .map((path) => urlByPath.get(path) || "")
        .filter(Boolean);
      if (urls.length) next = { ...next, posterUrl: urls[0], posterUrls: urls };
    }
    return next;
  });
}

function toRow(userId: string, scrap: Scrap): Row {
  return {
    id: scrap.id,
    user_id: userId,
    created_at: new Date(scrap.createdAt || Date.now()).toISOString(),
    updated_at: new Date(scrap.updatedAt || scrap.createdAt || Date.now()).toISOString(),
    type: scrap.type || "text",
    tags: Array.isArray(scrap.tags) ? scrap.tags : [],
    title: scrap.title || "",
    body: scrap.text || "",
    url: scrap.url || "",
    filename: scrap.filename || "",
    mime: scrap.mime || "",
    extension: scrap.extension || "",
    size: Number(scrap.size) || 0,
    preview_text: scrap.previewText || "",
    source_text: scrap.sourceText || "",
    pages: Math.max(0, Number(scrap.pages) || 0),
    og: scrap.og,
    og_status: scrap.ogStatus || "",
    sample: false,
    ephemeral: false,
    stored_media: !!scrap.storedMedia,
    domain: scrap.domain || "",
    error: scrap.error || "",
    memo: scrap.memo || "",
    media_path: scrap.mediaPath || null,
    poster_path: scrap.posterPath || null,
    bookmarked: !!scrap.bookmarked,
    read_at: scrap.readAt ? new Date(scrap.readAt).toISOString() : null,
    remind_at: scrap.remindAt ? new Date(scrap.remindAt).toISOString() : null,
    revisions: parseRevisions(scrap.revisions),
  };
}

function fromRow(row: Row): Scrap {
  const mediaPath = row.media_path || "";
  const posterPath = row.poster_path || "";
  return {
    id: row.id,
    createdAt: Date.parse(row.created_at) || Date.now(),
    updatedAt: Date.parse(row.updated_at) || Date.now(),
    type: (row.type as Scrap["type"]) || "text",
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    title: row.title || "",
    text: row.body || "",
    url: row.url || "",
    filename: row.filename || "",
    mime: row.mime || "",
    extension: row.extension || "",
    size: Number(row.size) || 0,
    dataUrl: "",
    posterPath,
    posterUrl: "",
    posterUrls: [],
    pages: Math.max(0, Number(row.pages) || 0),
    previewText: row.preview_text || "",
    sourceText: row.source_text || "",
    sample: !!row.sample,
    storedMedia: !!row.stored_media && !!mediaPath,
    domain: row.domain || "",
    error: row.error || "",
    memo: row.memo || "",
    mediaPath,
    bookmarked: !!row.bookmarked,
    readAt: row.read_at ? Date.parse(row.read_at) || null : null,
    remindAt: row.remind_at ? Date.parse(row.remind_at) || null : null,
    og: parseOg(row.og),
    ogStatus: row.og_status || "",
    revisions: parseRevisions(row.revisions),
  };
}

export async function loadScraps(user: User): Promise<Scrap[]> {
  if (isBrowseUser(user)) return loadLocalScraps();
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("scraps")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data || []) as Row[]).map(fromRow);
}

export async function uploadMedia(
  user: User,
  scrap: Scrap,
  file: File,
  onProgress?: (ratio: number) => void,
) {
  if (isBrowseUser(user)) return attachLocalMedia(file);
  const supabase = getSupabase();
  if (!supabase) throw new Error("config");
  const path = mediaObjectPath(user.id, scrap);
  if (file.size > RESUMABLE_BYTES) {
    await uploadResumable(path, file, onProgress);
  } else {
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || "application/octet-stream",
    });
    if (error) throw error;
    onProgress?.(1);
  }
  const dataUrl = await signedUrl(path);
  return { mediaPath: path, dataUrl, storedMedia: !!dataUrl, skipped: false };
}

export async function uploadPoster(user: User, scrapId: string, blob: Blob) {
  const uploaded = await uploadPosters(user, scrapId, [blob]);
  return { posterPath: uploaded.posterPath, posterUrl: uploaded.posterUrl };
}

export async function uploadPosters(user: User, scrapId: string, blobs: Blob[]) {
  const slice = blobs.filter(Boolean);
  if (!slice.length) return { posterPath: "", posterUrl: "", posterUrls: [] as string[], pages: 0 };
  if (isBrowseUser(user)) {
    const posterUrls = await Promise.all(slice.map((blob) => blobToDataUrl(blob)));
    return { posterPath: "", posterUrl: posterUrls[0] || "", posterUrls, pages: posterUrls.length };
  }
  const supabase = getSupabase();
  if (!supabase) throw new Error("config");
  const posterUrls: string[] = [];
  let posterPath = "";
  for (let i = 0; i < slice.length; i++) {
    const path = posterPagePath(user.id, scrapId, i + 1);
    const file = new File([slice[i]], "poster-" + (i + 1) + ".jpg", { type: "image/jpeg" });
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: "image/jpeg",
    });
    if (error) throw error;
    if (i === 0) posterPath = path;
    posterUrls.push(await signedUrl(path));
  }
  return { posterPath, posterUrl: posterUrls[0] || "", posterUrls, pages: posterUrls.length };
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(blob);
  });
}

function resumableEndpoint() {
  const base = (import.meta.env.VITE_SUPABASE_URL || "").trim();
  const u = new URL(base);
  const host = u.hostname.replace(/\.supabase\.co$/i, ".storage.supabase.co");
  return `${u.protocol}//${host}/storage/v1/upload/resumable`;
}

async function uploadResumable(path: string, file: File, onProgress?: (ratio: number) => void) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("config");
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (sessionError || !token) throw new Error("auth");
  const contentType = file.type || "application/octet-stream";
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: resumableEndpoint(),
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${token}`,
        apikey: anonKey,
        "x-upsert": "true",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: BUCKET,
        objectName: path,
        contentType,
        cacheControl: "3600",
      },
      chunkSize: RESUMABLE_BYTES,
      onError(error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      },
      onProgress(bytesUploaded, bytesTotal) {
        if (bytesTotal > 0) onProgress?.(bytesUploaded / bytesTotal);
      },
      onSuccess() {
        onProgress?.(1);
        resolve();
      },
    });

    upload
      .findPreviousUploads()
      .then((previous) => {
        if (previous.length) upload.resumeFromPreviousUpload(previous[0]);
        upload.start();
      })
      .catch(reject);
  });
}

export async function removeMedia(user: User, mediaPath: string) {
  const path = String(mediaPath || "").trim();
  if (!path || isBrowseUser(user)) return;
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

export async function saveScrap(user: User, scrap: Scrap) {
  if (isBrowseUser(user)) {
    saveLocalScrap(scrap);
    return;
  }
  const supabase = getSupabase();
  if (!supabase) throw new Error("config");
  const { error } = await supabase.from("scraps").upsert(toRow(user.id, scrap), { onConflict: "id" });
  if (error) throw error;
}

export async function deleteScrap(user: User, scrap: Scrap) {
  if (isBrowseUser(user)) {
    deleteLocalScrap(scrap);
    return;
  }
  const supabase = getSupabase();
  if (!supabase) throw new Error("config");
  await removeMedia(user, scrap.mediaPath);
  for (const path of posterCleanupPaths(user.id, scrap)) {
    await removeMedia(user, path);
  }
  const { error } = await supabase.from("scraps").delete().eq("id", scrap.id).eq("user_id", user.id);
  if (error) throw error;
}

/** Account scrap count + stored media bytes from Supabase (RLS-scoped), or this device for guests. */
export async function loadUserDbUsage(user: User): Promise<{ count: number; bytes: number }> {
  if (isBrowseUser(user)) return localUsage();
  const supabase = getSupabase();
  if (!supabase) return { count: 0, bytes: 0 };
  const { data, error, count } = await supabase
    .from("scraps")
    .select("size, stored_media, media_path", { count: "exact" })
    .eq("user_id", user.id);
  if (error) throw error;
  const rows = (data || []) as { size: number; stored_media: boolean; media_path: string | null }[];
  const bytes = rows.reduce((sum, row) => {
    if (row.stored_media || row.media_path) return sum + (Number(row.size) || 0);
    return sum;
  }, 0);
  return { count: count ?? rows.length, bytes };
}

/** Delete all scraps and media for this user. Does not touch profiles. */
export async function clearUserScraps(user: User) {
  if (isBrowseUser(user)) {
    clearLocalScraps();
    return;
  }
  const supabase = getSupabase();
  if (!supabase) throw new Error("config");
  const { data, error } = await supabase.from("scraps").select("id, media_path, poster_path, pages").eq("user_id", user.id);
  if (error) throw error;
  const paths = (data || [])
    .flatMap((row) => {
      const r = row as { id: string; media_path: string | null; poster_path: string | null; pages: number | null };
      return [r.media_path, ...posterCleanupPaths(user.id, { id: r.id, posterPath: r.poster_path || "", pages: Number(r.pages) || 0 })];
    })
    .filter((path): path is string => Boolean(path));
  for (let i = 0; i < paths.length; i += 50) {
    const chunk = paths.slice(i, i + 50);
    await supabase.storage.from(BUCKET).remove(chunk);
  }
  const { error: delError } = await supabase.from("scraps").delete().eq("user_id", user.id);
  if (delError) throw delError;
}

export const SCRAPS_CLEARED_EVENT = "mybrary:scraps-cleared";
export const SCRAPS_CHANGED_EVENT = "mybrary:scraps-changed";

export async function getAccessToken() {
  const supabase = getSupabase();
  if (!supabase) return "";
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || "";
}
