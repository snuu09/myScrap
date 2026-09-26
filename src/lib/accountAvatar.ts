/** Google / OAuth profile photo from Supabase user metadata (or identity_data). */
export function accountAvatarUrl(
  user: {
    user_metadata?: Record<string, unknown>;
    identities?: Array<{ identity_data?: Record<string, unknown> }>;
  } | null,
): string | null {
  if (!user) return null;
  const candidates: unknown[] = [
    user.user_metadata?.avatar_url,
    user.user_metadata?.picture,
  ];
  for (const id of user.identities ?? []) {
    candidates.push(id.identity_data?.avatar_url, id.identity_data?.picture);
  }
  for (const url of candidates) {
    if (typeof url === "string" && url.trim()) return url.trim();
  }
  return null;
}
