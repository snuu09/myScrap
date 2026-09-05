import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function url() {
  return (import.meta.env.VITE_SUPABASE_URL || "").trim();
}

function key() {
  return (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
}

export function isSupabaseConfigured() {
  const u = url();
  const k = key();
  if (!u || !k) return false;
  if (/YOUR_/i.test(u) || /YOUR_/i.test(k)) return false;
  return /^https:\/\//i.test(u) && k.length > 20;
}

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(url(), key(), {
      auth: { detectSessionInUrl: true, flowType: "pkce" },
    });
  }
  return client;
}
