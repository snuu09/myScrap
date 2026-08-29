export type PlanTier = "free" | "standard" | "premium" | "admin";

export type Profile = {
  userId: string;
  planTier: PlanTier;
  trialEndsAt: number | null;
  createdAt: number;
};

const MB = 1024 * 1024;

export const PLAN_LIMITS: Record<
  PlanTier,
  { storageBytes: number | null; ads: boolean; trialLimited: boolean }
> = {
  free: { storageBytes: 100 * MB, ads: true, trialLimited: true },
  standard: { storageBytes: 1024 * MB, ads: true, trialLimited: false },
  premium: { storageBytes: null, ads: false, trialLimited: false },
  admin: { storageBytes: null, ads: false, trialLimited: false },
};

export function trialExpired(profile: Profile | null, now = Date.now()) {
  if (!profile) return false;
  const limits = PLAN_LIMITS[profile.planTier];
  if (!limits.trialLimited || !profile.trialEndsAt) return false;
  return now > profile.trialEndsAt;
}

export function storageLimitBytes(profile: Profile | null) {
  if (!profile) return PLAN_LIMITS.free.storageBytes;
  return PLAN_LIMITS[profile.planTier].storageBytes;
}

export function showAdsForProfile(profile: Profile | null) {
  if (!profile) return true;
  return PLAN_LIMITS[profile.planTier].ads;
}

export function canUploadBytes(
  profile: Profile | null,
  usageBytes: number,
  addingBytes: number,
  now = Date.now(),
) {
  if (trialExpired(profile, now)) {
    return { ok: false as const, reason: "trialExpired" as const };
  }
  const limit = storageLimitBytes(profile);
  if (limit !== null && usageBytes + addingBytes > limit) {
    return { ok: false as const, reason: "quotaExceeded" as const };
  }
  return { ok: true as const };
}

export function canStickText(profile: Profile | null, now = Date.now()) {
  if (trialExpired(profile, now)) {
    return { ok: false as const, reason: "trialExpired" as const };
  }
  return { ok: true as const };
}

export function computeUsageBytes(scraps: { size: number; storedMedia: boolean; mediaPath?: string }[]) {
  return scraps.reduce((sum, item) => {
    if (item.storedMedia || item.mediaPath) return sum + (Number(item.size) || 0);
    return sum;
  }, 0);
}

export function trialDaysLeft(profile: Profile | null, now = Date.now()) {
  if (!profile?.trialEndsAt || !PLAN_LIMITS[profile.planTier].trialLimited) return null;
  const ms = profile.trialEndsAt - now;
  if (ms <= 0) return 0;
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}
