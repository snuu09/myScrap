import { PLAN_LIMITS, planDisplayName, type PlanTier } from "./plans";
import { formatBytes } from "./tagger";
import { GUEST_FILE_LIMIT, GUEST_TOTAL_LIMIT } from "./localScraps";

export const PLAN_TRIAL_DAYS = 14;

export type PlanFeatureRow = {
  id: string;
  ok: boolean;
  label: string;
};

type TFn = (key: string, vars?: Record<string, string | number>) => string;

/** Current-session feature checklist aligned with the Upgrade matrix. */
export function planFeatureRows(
  t: TFn,
  opts: { browse: boolean; tier: PlanTier },
): PlanFeatureRow[] {
  const { browse, tier } = opts;
  const limits = PLAN_LIMITS[tier];

  const storageLabel = browse
    ? t("planFeatStorageBrowse", { limit: formatBytes(GUEST_TOTAL_LIMIT) })
    : limits.storageBytes == null
      ? t("planFeatStorageUnlimited")
      : t("planFeatStorage", { limit: formatBytes(limits.storageBytes) });

  const batchLabel = browse
    ? t("planFeatBatchBrowse", { size: formatBytes(GUEST_FILE_LIMIT) })
    : limits.batchMaxFiles == null
      ? t("planFeatBatchUnlimited")
      : t("planFeatBatch", { n: limits.batchMaxFiles });

  const classifyLabel =
    browse || tier === "standard" || tier === "premium" || tier === "admin"
      ? t("planFeatClassifyAlways")
      : t("planFeatClassifyTrial");

  const syncLabel = browse
    ? t("planFeatSyncDeviceOnly")
    : tier === "free"
      ? t("planFeatSyncAccount")
      : t("planFeatSyncReadySoon");

  return [
    { id: "storage", ok: true, label: storageLabel },
    { id: "batch", ok: true, label: batchLabel },
    {
      id: "ads",
      ok: !(browse || limits.ads),
      label: browse || limits.ads ? t("planFeatAdsOn") : t("planFeatAdsOff"),
    },
    { id: "classify", ok: true, label: classifyLabel },
    {
      id: "remind",
      ok: !browse && limits.remind,
      label: !browse && limits.remind ? t("planFeatRemindOn") : t("planFeatRemindOff"),
    },
    {
      id: "bundle",
      ok: !browse && (tier === "premium" || tier === "admin"),
      label:
        !browse && (tier === "premium" || tier === "admin")
          ? t("planFeatBundleOn")
          : t("planFeatBundleOff"),
    },
    {
      id: "history",
      ok: !browse && (tier === "premium" || tier === "admin"),
      label:
        !browse && (tier === "premium" || tier === "admin")
          ? t("planFeatHistoryOn")
          : t("planFeatHistoryOff"),
    },
    { id: "sync", ok: !browse, label: syncLabel },
  ];
}

export function effectivePlanTier(browse: boolean, tier: PlanTier | undefined): PlanTier {
  if (browse) return "free";
  return tier ?? "free";
}

export { planDisplayName };
