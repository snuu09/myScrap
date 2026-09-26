import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { usePlan } from "../context/Plan";
import { formatBytes } from "../lib/tagger";
import { formatTrialEndDate } from "../lib/time";
import { planDisplayName } from "../lib/plans";

type Props = {
  showAdsNote?: boolean;
};

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

/** Tier name + compact trial line (max two lines). */
export function PlanTierMeta() {
  const { lang } = usePrefs();
  const { profile, trialDaysLeft, trialExpired } = usePlan();

  if (!profile) {
    return <p className="text-[0.8125rem] text-muted">{t(lang, "noPlanProfile")}</p>;
  }

  const trialLine =
    trialExpired
      ? t(lang, "trialExpiredMsg")
      : trialDaysLeft !== null && profile.trialEndsAt != null
        ? t(lang, "trialDaysLeft", { n: trialDaysLeft }) +
          " · " +
          formatTrialEndDate(profile.trialEndsAt, lang)
        : null;

  return (
    <div className="plan-usage-meta">
      <strong className="plan-usage-tier">{planDisplayName(profile.planTier)}</strong>
      {trialLine ? (
        <span className={"plan-trial-msg" + (trialExpired ? " plan-trial-msg--danger" : "")}>{trialLine}</span>
      ) : null}
    </div>
  );
}

export function PlanUsageBlock({ showAdsNote = false }: Props) {
  const { lang } = usePrefs();
  const { profile, usageBytes, storageLimit, showAds } = usePlan();

  if (!profile) {
    return <p className="text-[0.8125rem] text-muted">{t(lang, "noPlanProfile")}</p>;
  }

  return (
    <div className="plan-usage-block">
      <PlanTierMeta />
      <StorageGauge usageBytes={usageBytes} storageLimit={storageLimit} />
      {showAdsNote && showAds ? <span className="plan-ads-note">{t(lang, "adPlaceholder")}</span> : null}
    </div>
  );
}
