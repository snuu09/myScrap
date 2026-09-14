import type { User } from "@supabase/supabase-js";
import { isBrowseUser } from "./guest";
import { getSupabase } from "./supabase";

export const SYSTEM_TYPES = ["text", "image", "video", "audio", "link", "document"] as const;

const GUEST_KEY = "mybrary.guest.types";

type Store = { ready: boolean; names: string[] };

function userKey(id: string) {
  return "mybrary.types." + id;
}

function cleanNames(names: string[]) {
  const next: string[] = [];
  for (const name of names) {
    const value = name.trim();
    if (!value || next.includes(value)) continue;
    next.push(value);
  }
  return next;
}

function readLocal(key: string): Store | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || !Array.isArray(parsed.names)) return null;
    return { ready: Boolean(parsed.ready), names: cleanNames(parsed.names) };
  } catch {
    return null;
  }
}

function writeLocal(key: string, names: string[]) {
  const store: Store = { ready: true, names: cleanNames(names) };
  localStorage.setItem(key, JSON.stringify(store));
}

async function writeRemote(user: User, names: string[]) {
  const supabase = getSupabase();
  if (!supabase) return;
  const clean = cleanNames(names);
  const { error: removeError } = await supabase.from("shelf_types").delete().eq("user_id", user.id);
  if (removeError) throw removeError;
  if (!clean.length) return;
  const { error } = await supabase.from("shelf_types").insert(clean.map((name) => ({ user_id: user.id, name })));
  if (error) throw error;
}

export async function loadTypeCatalog(user: User): Promise<string[]> {
  if (isBrowseUser(user)) {
    const stored = readLocal(GUEST_KEY);
    if (!stored?.ready) {
      writeLocal(GUEST_KEY, [...SYSTEM_TYPES]);
      return [...SYSTEM_TYPES];
    }
    return stored.names;
  }

  const key = userKey(user.id);
  const supabase = getSupabase();
  if (!supabase) {
    const stored = readLocal(key);
    return stored?.ready ? stored.names : [...SYSTEM_TYPES];
  }

  const { data, error } = await supabase.from("shelf_types").select("name").eq("user_id", user.id);
  if (error) {
    const stored = readLocal(key);
    return stored?.ready ? stored.names : [...SYSTEM_TYPES];
  }
  const names = cleanNames((data || []).map((row) => String((row as { name?: string }).name || "")));
  const local = readLocal(key);
  if (!names.length && !local?.ready) {
    await saveTypeCatalog(user, [...SYSTEM_TYPES]);
    return [...SYSTEM_TYPES];
  }
  return names.length ? names : local?.names || [];
}

export async function saveTypeCatalog(user: User, names: string[]) {
  const clean = cleanNames(names);
  if (isBrowseUser(user)) {
    writeLocal(GUEST_KEY, clean);
    return;
  }
  writeLocal(userKey(user.id), clean);
  await writeRemote(user, clean);
}

export function mergeTypeNames(catalog: string[], used: string[]) {
  return cleanNames([...catalog, ...used.filter((name) => name && name !== "unknown")]);
}
