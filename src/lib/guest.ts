import type { User } from "@supabase/supabase-js";

export function isBrowseUser(user: User | null) {
  return Boolean(user?.is_anonymous || user?.user_metadata?.browse === true);
}
