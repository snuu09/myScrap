import { GUEST_FILE_LIMIT } from "./localScraps";

/** Matches `scrap-media` file_size_limit in supabase/migrations/20260905143000_scrap_media_file_size.sql. */
export const MEDIA_FILE_LIMIT = 104857600;

export type UploadIssue = "empty" | "tooLarge" | "guestFile" | "quota" | "trial";

type Gate = { ok: boolean; reason?: "trialExpired" | "quotaExceeded" };

/** Reject a file before Storage sees it. `reservedBytes` is the size of earlier valid files in the same batch. */
export function uploadIssue(
  file: File,
  opts: { guest: boolean; reservedBytes: number; canUpload: (addingBytes: number) => Gate },
): UploadIssue | null {
  if (!file.size) return "empty";
  if (opts.guest && file.size > GUEST_FILE_LIMIT) return "guestFile";
  if (file.size > MEDIA_FILE_LIMIT) return "tooLarge";
  const gate = opts.canUpload(opts.reservedBytes + file.size);
  if (!gate.ok) return gate.reason === "trialExpired" ? "trial" : "quota";
  return null;
}
