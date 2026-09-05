import { getSupabase } from "./supabase";
import { getAccessToken } from "./scraps";
import type { ScrapOg } from "./types";

export type OgFetchResult = { og: ScrapOg | null; ogStatus: "ready" | "error" | "skipped" };

/** Calls the existing Supabase og-preview edge function when available. */
export async function fetchOgPreview(url: string): Promise<OgFetchResult> {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return { og: null, ogStatus: "skipped" };

  const supabase = getSupabase();
  const token = await getAccessToken();
  if (!supabase || !token) return { og: null, ogStatus: "skipped" };

  try {
    const { data, error } = await supabase.functions.invoke("og-preview", {
      body: { url: trimmed },
      headers: { Authorization: "Bearer " + token },
    });
    if (error || !data) return { og: null, ogStatus: "error" };
    const row = data as Record<string, unknown>;
    const og: ScrapOg = {
      title: String(row.title || ""),
      description: String(row.description || ""),
      image: String(row.image || ""),
      siteName: String(row.siteName || row.site_name || ""),
      favicon: String(row.favicon || ""),
    };
    if (!og.title && !og.image && !og.siteName) return { og: null, ogStatus: "error" };
    return { og, ogStatus: "ready" };
  } catch {
    return { og: null, ogStatus: "error" };
  }
}
