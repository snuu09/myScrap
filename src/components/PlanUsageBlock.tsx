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
  hideLabel = false,
}: {
  usageBytes: number;
  storageLimit: number | null;
  /** When true, only the bar (or unlimited note if no limit). */
  hideLabel?: boolean;
}) {
  const { lang } = usePrefs();
  if (storageLimit === null) {
    return hideLabel ? null : <p className="plan-storage-label">{t(lang, "storageUnlimited")}</p>;
  }
  const pct = Math.min(100, storageLimit > 0 ? (usageBytes / storageLimit) * 100 : 0);
  const label = t(lang, "storageUsed", {
    used: formatBytes(usageBytes),
    limit: formatBytes(storageLimit),
  });
  return (
    <div className="storage-gauge">
      {hideLabel ? null : <p className="plan-storage-label">{label}</p>}
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

/** Tier name + optional trial line. Browse with no profile shows Free. */
export function PlanTierMeta({
  forceFree = false,
  hideTrial = false,
}: {
  forceFree?: boolean;
  hideTrial?: boolean;
}) {
  const { lang } = usePrefs();
  const { profile, trialDaysLeft, trialExpired } = usePlan();

  if (!profile && !forceFree) {
    return <p className="text-[0.8125rem] text-muted">{t(lang, "noPlanProfile")}</p>;
  }

  const tier = profile?.planTier ?? "free";
  const trialLine =
    !hideTrial && !forceFree && profile
      ? trialExpired
        ? t(lang, "trialExpiredMsg")
        : trialDaysLeft !== null && profile.trialEndsAt != null
          ? t(lang, "trialDaysLeft", { n: trialDaysLeft }) +
            " · " +
            formatTrialEndDate(profile.trialEndsAt, lang)
          : null
      : null;

  return (
    <div className="plan-usage-meta">
      <strong className="plan-usage-tier">{planDisplayName(tier)}</strong>
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
