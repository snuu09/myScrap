export type PlanTier = "free" | "standard" | "premium" | "admin";

export type Profile = {
  userId: string;
  planTier: PlanTier;
  trialEndsAt: number | null;
  createdAt: number;
};

export type PlanLimits = {
  storageBytes: number | null;
  ads: boolean;
  trialLimited: boolean;
  /** null = unlimited */
  batchMaxFiles: number | null;
  remind: boolean;
};

const MB = 1024 * 1024;

/** Runtime limits. UI labels Free / Middle / High map to free / standard / premium. */
export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    storageBytes: 100 * MB,
    ads: true,
    trialLimited: true,
    batchMaxFiles: 1,
    remind: false,
  },
  standard: {
    storageBytes: 500 * MB,
    ads: true,
    trialLimited: false,
    batchMaxFiles: 3,
    remind: true,
  },
  premium: {
    storageBytes: 1024 * MB,
    ads: false,
    trialLimited: false,
    batchMaxFiles: null,
    remind: true,
  },
  admin: {
    storageBytes: null,
    ads: false,
    trialLimited: false,
    batchMaxFiles: null,
    remind: true,
  },
};

/** English tier names in both KO and EN UI (matrix / settings). */
export function planDisplayName(tier: PlanTier | undefined) {
  if (tier === "standard") return "Middle";
  if (tier === "premium") return "High";
  if (tier === "admin") return "Admin";
  return "Free";
}

export function limitsFor(profile: Profile | null): PlanLimits {
  return PLAN_LIMITS[profile?.planTier ?? "free"];
}

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

export function batchMaxFilesFor(profile: Profile | null) {
  return limitsFor(profile).batchMaxFiles;
}

export function canRemindFor(profile: Profile | null) {
  return limitsFor(profile).remind;
}

export function canAddBatchFiles(profile: Profile | null, currentCount: number, addingCount: number) {
  const max = batchMaxFilesFor(profile);
  if (max === null) return { ok: true as const };
  if (currentCount + addingCount > max) return { ok: false as const, max };
  return { ok: true as const };
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
