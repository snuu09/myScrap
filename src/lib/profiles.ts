import { getSupabase } from "./supabase";
import type { PlanTier, Profile } from "./plans";

type Row = {
  user_id: string;
  plan_tier: PlanTier;
  trial_ends_at: string | null;
  created_at: string;
};

function fromRow(row: Row): Profile {
  return {
    userId: row.user_id,
    planTier: row.plan_tier,
    trialEndsAt: row.trial_ends_at ? Date.parse(row.trial_ends_at) : null,
    createdAt: Date.parse(row.created_at) || Date.now(),
  };
}

export async function loadProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error || !data) return null;
  return fromRow(data as Row);
}
