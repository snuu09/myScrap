import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { usePlan } from "../context/Plan";
import { formatBytes } from "../lib/tagger";
import { formatTrialEndDate } from "../lib/time";
import type { PlanTier } from "../lib/plans";

type Props = {
  showAdsNote?: boolean;
};

function planName(lang: "ko" | "en", tier: PlanTier | undefined) {
  const key =
    tier === "standard"
      ? "planStandard"
      : tier === "premium"
        ? "planPremium"
        : tier === "admin"
          ? "planAdmin"
          : "planFree";
  return t(lang, key);
}

export function StorageGauge({
  usageBytes,
  storageLimit,
}: {
  usageBytes: number;
  storageLimit: number | null;
}) {
  const { lang } = usePrefs();
  if (storageLimit === null) {
    return <p className="plan-storage-label">{t(lang, "storageUnlimited")}</p>;
  }
  const pct = Math.min(100, storageLimit > 0 ? (usageBytes / storageLimit) * 100 : 0);
  const label = t(lang, "storageUsed", {
    used: formatBytes(usageBytes),
    limit: formatBytes(storageLimit),
  });
  return (
    <div className="storage-gauge">
      <p className="plan-storage-label">{label}</p>
      <div
        className="storage-gauge-track"
        role="progressbar"
        aria-label={t(lang, "storageGaugeLabel")}
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="storage-gauge-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function PlanUsageBlock({ showAdsNote = false }: Props) {
  const { lang } = usePrefs();
  const { profile, usageBytes, storageLimit, trialDaysLeft, trialExpired, showAds } = usePlan();

  if (!profile) {
    return <p className="text-[0.8125rem] text-muted">{t(lang, "noPlanProfile")}</p>;
  }

  const showTrialDate =
    !trialExpired &&
    trialDaysLeft !== null &&
    profile.trialEndsAt != null;

  return (
    <div className="plan-usage-block">
      <strong className="plan-usage-tier">{planName(lang, profile.planTier)}</strong>
      {trialExpired ? (
        <span className="plan-trial-msg plan-trial-msg--danger">{t(lang, "trialExpiredMsg")}</span>
      ) : trialDaysLeft !== null ? (
        <span className="plan-trial-msg">{t(lang, "trialDaysLeft", { n: trialDaysLeft })}</span>
      ) : null}
      {showTrialDate ? (
        <span className="plan-trial-date">
          {t(lang, "trialEndsOn", { date: formatTrialEndDate(profile.trialEndsAt!, lang) })}
        </span>
      ) : null}
      <StorageGauge usageBytes={usageBytes} storageLimit={storageLimit} />
      {showAdsNote && showAds ? (
        <span className="plan-ads-note">{t(lang, "adPlaceholder")}</span>
      ) : null}
      <span className="plan-upgrade-hint">{t(lang, "planUpgradeHint")}</span>
    </div>
  );
}
