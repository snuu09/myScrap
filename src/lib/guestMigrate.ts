import type { User } from "@supabase/supabase-js";
import { dataUrlToFile, deleteLocalScrap, loadLocalScraps } from "./localScraps";
import { saveScrap, uploadMedia } from "./scraps";

export type MigrateResult = { moved: number; skipped: number; failed: number; left: number };

/**
 * Moves this device's browse scraps into a real account. `allowBytes` applies the
 * account plan quota; scraps it rejects stay on the device instead of being dropped.
 */
export async function migrateLocalScraps(
  user: User,
  allowBytes: (bytes: number) => boolean,
): Promise<MigrateResult> {
  const list = loadLocalScraps().reverse();
  let moved = 0;
  let skipped = 0;
  let failed = 0;

  for (const scrap of list) {
    const hasMedia = Boolean(scrap.dataUrl) && scrap.dataUrl.startsWith("data:");
    if (hasMedia && !allowBytes(Number(scrap.size) || 0)) {
      skipped += 1;
      continue;
    }
    try {
      const next = { ...scrap, mediaPath: "", dataUrl: "", storedMedia: false, updatedAt: Date.now() };
      if (hasMedia) {
        const file = await dataUrlToFile(scrap.dataUrl, scrap.filename, scrap.mime);
        const uploaded = await uploadMedia(user, next, file);
        next.mediaPath = uploaded.mediaPath;
        next.dataUrl = uploaded.dataUrl;
        next.storedMedia = uploaded.storedMedia;
      }
      await saveScrap(user, next);
      deleteLocalScrap(scrap);
      moved += 1;
    } catch {
      failed += 1;
    }
  }

  return { moved, skipped, failed, left: skipped + failed };
}
