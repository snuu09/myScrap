import type { User } from "@supabase/supabase-js";
import { uploadPosters } from "./scraps";
import { getSupabase } from "./supabase";
import type { Scrap } from "./types";

const MAX_BYTES = 4 * 1024 * 1024;

export function needsOgCoverSnapshot(scrap: Pick<Scrap, "posterPath" | "posterUrl" | "og">) {
  const image = scrap.og?.image || "";
  if (!/^https?:\/\//i.test(image)) return false;
  return !scrap.posterPath && !scrap.posterUrl;
}

function weservUrl(imageUrl: string) {
  const stripped = imageUrl.replace(/^https?:\/\//i, "");
  return "https://images.weserv.nl/?url=" + encodeURIComponent(stripped) + "&output=jpg&n=-1";
}

async function blobFrom(res: Response) {
  if (!res.ok) return null;
  const type = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (type && !type.startsWith("image/")) return null;
  const blob = await res.blob();
  if (!blob.size || blob.size > MAX_BYTES) return null;
  if (blob.type && !blob.type.startsWith("image/")) return null;
  return blob;
}

/** Same-origin copy when the Netlify function is running; otherwise a one-time CORS proxy. */
export async function fetchOgImageBlob(imageUrl: string): Promise<Blob | null> {
  try {
    const supabase = getSupabase();
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;
    const same = await fetch("/api/og-image?url=" + encodeURIComponent(imageUrl), {
      headers: session?.access_token ? { Authorization: "Bearer " + session.access_token } : {},
    });
    if (same.status === 400 || same.status === 413 || same.status === 415) return null;
    const blob = await blobFrom(same);
    if (blob) return blob;
    if (same.status === 401 || same.status === 403) return null;
  } catch {
    /* function missing on static hosting */
  }
  try {
    const proxy = await fetch(weservUrl(imageUrl));
    return await blobFrom(proxy);
  } catch {
    return null;
  }
}

export async function snapshotOgCover(user: User, scrap: Scrap): Promise<Partial<Scrap> | null> {
  if (!needsOgCoverSnapshot(scrap)) return null;
  const blob = await fetchOgImageBlob(scrap.og?.image || "");
  if (!blob) return null;
  const uploaded = await uploadPosters(user, scrap.id, [blob]);
  if (!uploaded.posterUrl && !uploaded.posterPath) return null;
  return {
    posterPath: uploaded.posterPath,
    posterUrl: uploaded.posterUrl,
    posterUrls: uploaded.posterUrls,
    pages: uploaded.pages || 1,
  };
}
