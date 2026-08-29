import type { User } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import type { Scrap } from "./types";

const BUCKET = "scrap-media";
const SIGNED_TTL = 60 * 60;

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
};

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

async function signedUrl(path: string | null) {
  const supabase = getSupabase();
  if (!supabase || !path) return "";
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
  if (error || !data?.signedUrl) return "";
  return data.signedUrl;
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
    pages: 0,
    og: null,
    og_status: "",
    sample: false,
    ephemeral: false,
    stored_media: !!scrap.storedMedia,
    domain: scrap.domain || "",
    error: scrap.error || "",
    memo: scrap.memo || "",
    media_path: scrap.mediaPath || null,
    poster_path: null,
  };
}

async function fromRow(row: Row): Promise<Scrap> {
  const dataUrl = await signedUrl(row.media_path);
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
    dataUrl,
    previewText: row.preview_text || "",
    sample: !!row.sample,
    storedMedia: !!row.stored_media && !!dataUrl,
    domain: row.domain || "",
    error: row.error || "",
    memo: row.memo || "",
    mediaPath: row.media_path || "",
  };
}

export async function loadScraps(user: User): Promise<Scrap[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("scraps")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const list: Scrap[] = [];
  for (const row of (data || []) as Row[]) list.push(await fromRow(row));
  return list;
}

export async function uploadMedia(user: User, scrap: Scrap, file: File) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("config");
  const path = mediaObjectPath(user.id, scrap);
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw error;
  const dataUrl = await signedUrl(path);
  return { mediaPath: path, dataUrl, storedMedia: !!dataUrl };
}

export async function saveScrap(user: User, scrap: Scrap) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("config");
  const { error } = await supabase.from("scraps").upsert(toRow(user.id, scrap), { onConflict: "id" });
  if (error) throw error;
}

export async function deleteScrap(user: User, scrap: Scrap) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("config");
  if (scrap.mediaPath) {
    await supabase.storage.from(BUCKET).remove([scrap.mediaPath]);
  }
  const { error } = await supabase.from("scraps").delete().eq("id", scrap.id).eq("user_id", user.id);
  if (error) throw error;
}

/** Account scrap count + stored media bytes from Supabase (RLS-scoped). */
export async function loadUserDbUsage(user: User): Promise<{ count: number; bytes: number }> {
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
  const supabase = getSupabase();
  if (!supabase) throw new Error("config");
  const { data, error } = await supabase.from("scraps").select("id, media_path").eq("user_id", user.id);
  if (error) throw error;
  const paths = (data || [])
    .map((row) => (row as { media_path: string | null }).media_path)
    .filter((path): path is string => Boolean(path));
  for (let i = 0; i < paths.length; i += 50) {
    const chunk = paths.slice(i, i + 50);
    await supabase.storage.from(BUCKET).remove(chunk);
  }
  const { error: delError } = await supabase.from("scraps").delete().eq("user_id", user.id);
  if (delError) throw delError;
}

export const SCRAPS_CLEARED_EVENT = "mybrary:scraps-cleared";

export async function getAccessToken() {
  const supabase = getSupabase();
  if (!supabase) return "";
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || "";
}
