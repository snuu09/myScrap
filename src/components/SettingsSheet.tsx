import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  CheckCircle2,
  Cloud,
  Edit3,
  KeyRound,
  LogOut,
  Minus,
  Monitor,
  Moon,
  QrCode,
  Search,
  Shield,
  Sun,
  Trash2,
  User,
  UserMinus,
} from "lucide-react";
import { usePrefs, type ReadingScale, type ThemeChoice } from "../context/Prefs";
import { isBrowseUser, useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import { clearUserScraps, loadUserDbUsage, SCRAPS_CLEARED_EVENT } from "../lib/scraps";
import { useDialog } from "../lib/dialog";
import { useT } from "../lib/useT";
import { formatBytes } from "../lib/tagger";
import { accountAvatarUrl } from "../lib/accountAvatar";
import { markArriveGenie } from "../lib/pageGenie";
import { effectivePlanTier, planFeatureRows, PLAN_TRIAL_DAYS } from "../lib/planFeatures";
import { formatTrialEndDate } from "../lib/time";
import { dismissOnboardingPrefs } from "../lib/notices";
import { PlanTierMeta, StorageGauge } from "./PlanUsageBlock";

const READING_OPTIONS: { size: ReadingScale; labelKey: string }[] = [
  { size: 13, labelKey: "readingScaleSm" },
  { size: 15, labelKey: "readingScaleMd" },
  { size: 17, labelKey: "readingScaleLg" },
  { size: 19, labelKey: "readingScaleXl" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function avatarInitials(label: string) {
  const cleaned = label.replace(/@.*/, "").trim();
  if (!cleaned) return "MB";
  const parts = cleaned.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return cleaned.slice(0, 2).toUpperCase();
}

function usageCombined(
  t: (key: string, vars?: Record<string, string | number>) => string,
  count: number,
  usedBytes: number,
  limit: number | null,
) {
  const used = formatBytes(usedBytes);
  if (limit === null) {
    return t("dbUsageCombinedUnlimited", { count, used });
  }
  return t("dbUsageCombined", { count, used, limit: formatBytes(limit) });
}

/** Free trial or browse session window (14 days from created_at / trialEndsAt). */
function periodState(opts: {
  useSessionWindow: boolean;
  trialEndsAt: number | null | undefined;
  trialDaysLeft: number | null;
  trialExpired: boolean;
  createdAtIso: string | undefined;
}) {
  const { useSessionWindow, trialEndsAt, trialDaysLeft, trialExpired, createdAtIso } = opts;
  if (useSessionWindow) {
    const start = createdAtIso ? Date.parse(createdAtIso) : NaN;
    if (!Number.isFinite(start)) {
      return {
        show: true,
        expired: false,
        daysLeft: PLAN_TRIAL_DAYS,
        pct: 100,
        endsAt: null as number | null,
      };
    }
    const endsAt = start + PLAN_TRIAL_DAYS * DAY_MS;
    const left = Math.ceil((endsAt - Date.now()) / DAY_MS);
    if (left <= 0) return { show: true, expired: true, daysLeft: 0, pct: 0, endsAt };
    return {
      show: true,
      expired: false,
      daysLeft: left,
      pct: Math.min(100, (left / PLAN_TRIAL_DAYS) * 100),
      endsAt,
    };
  }
  if (trialEndsAt == null && trialDaysLeft == null && !trialExpired) {
    return { show: false, expired: false, daysLeft: 0, pct: 0, endsAt: null as number | null };
  }
  const left = trialExpired ? 0 : (trialDaysLeft ?? 0);
  return {
    show: true,
    expired: trialExpired,
    daysLeft: left,
    pct: trialExpired ? 0 : Math.min(100, Math.max(0, (left / PLAN_TRIAL_DAYS) * 100)),
    endsAt: trialEndsAt ?? null,
  };
}

function periodLabel(
  t: (key: string, vars?: Record<string, string | number>) => string,
  period: ReturnType<typeof periodState>,
  lang: "ko" | "en",
) {
  if (period.expired) return t("trialExpiredMsg");
  const base = t("trialDaysLeft", { n: period.daysLeft });
  if (period.endsAt != null) return `${base} · ${formatTrialEndDate(period.endsAt, lang)}`;
  return base;
}

export function SettingsPage() {
  const { lang, theme, palette, readingScale, setLang, setTheme, setPalette, setReadingScale } = usePrefs();
  const t = useT();
  const { user, signOut } = useAuth();
  const { profile, setScrapsForUsage, setUsageSnapshot, scrapCount, usageBytes, storageLimit, trialDaysLeft, trialExpired } =
    usePlan();
  const { alert, confirm } = useDialog();
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const [usageLoading, setUsageLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [dbCount, setDbCount] = useState(scrapCount);
  const [dbBytes, setDbBytes] = useState(usageBytes);

  const browse = Boolean(user && isBrowseUser(user));
  const avatarUrl = accountAvatarUrl(user);
  const planTier = effectivePlanTier(browse, profile?.planTier);
  const featureRows = planFeatureRows(t, { browse, tier: planTier });
  const period = periodState({
    useSessionWindow: browse || (planTier === "free" && profile?.trialEndsAt == null),
    trialEndsAt: profile?.trialEndsAt,
    trialDaysLeft,
    trialExpired: browse ? false : trialExpired,
    createdAtIso: user?.created_at,
  });
  const showPeriod = browse || planTier === "free";
  const paidSync =
    Boolean(user) &&
    !browse &&
    (profile?.planTier === "standard" || profile?.planTier === "premium" || profile?.planTier === "admin");

  useEffect(() => {
    dismissOnboardingPrefs();
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setDbCount(scrapCount);
    setDbBytes(usageBytes);
    setUsageLoading(true);
    void loadUserDbUsage(user)
      .then(({ count, bytes }) => {
        if (cancelled) return;
        setDbCount(count);
        setDbBytes(bytes);
        setUsageSnapshot({ count, bytes });
      })
      .catch(() => {
        /* keep Plan snapshot */
      })
      .finally(() => {
        if (!cancelled) setUsageLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when the signed-in user changes
  }, [user]);

  const sessionLabel = user ? (browse ? t("browse") : user.email || "—") : "";

  const hasData = dbCount > 0 || dbBytes > 0;

  const previewBadge = [
    palette === "deckle" ? t("paletteDeckle") : t("paletteEditorial"),
    lang === "ko" ? "KO" : "EN",
    theme === "light" ? t("themeLight") : theme === "dark" ? t("themeDark") : t("themeSystem"),
  ].join(" · ");

  const previewSpine = palette === "deckle" ? t("paletteDeckle") : t("paletteEditorial");

  async function comingSoon() {
    await alert(t("settingsComingSoon"));
  }

  async function handleLogout() {
    if (signingOut || resetting) return;
    const ok = await confirm({
      body: t("logoutConfirm"),
      confirmLabel: t("logout"),
    });
    if (!ok) return;
    setSigningOut(true);
    try {
      markArriveGenie(false);
      await signOut();
      navigate("/");
    } finally {
      setSigningOut(false);
    }
  }

  async function resetDb() {
    if (!user || resetting || !hasData) return;
    const ok = await confirm({
      body: t(browse ? "guestResetConfirm" : "dbResetConfirm"),
      danger: true,
      confirmLabel: t("dbResetAction"),
    });
    if (!ok) return;
    setResetting(true);
    try {
      await clearUserScraps(user);
      setScrapsForUsage([]);
      setUsageSnapshot({ count: 0, bytes: 0 });
      setDbCount(0);
      setDbBytes(0);
      window.dispatchEvent(new Event(SCRAPS_CLEARED_EVENT));
      await alert(t("dbResetDone"));
      navigate("/");
    } catch {
      await alert(t("syncError"));
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="settings-page">
      {user ? (
        <section className="settings-arch-section" aria-labelledby="settings-sec-account">
          <h2 id="settings-sec-account" className="settings-arch-title">
            {t("settingsSecAccount")}
          </h2>

          <div className="settings-arch-identity">
            <div className="settings-arch-identity-lead">
              <div className="settings-arch-profile-main">
                <span className={"settings-arch-avatar" + (avatarUrl ? " has-photo" : "")} aria-hidden>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="settings-arch-avatar-img" referrerPolicy="no-referrer" />
                  ) : browse ? (
                    <User className="size-6" strokeWidth={1.6} />
                  ) : (
                    avatarInitials(sessionLabel)
                  )}
                </span>
                <div className="settings-arch-profile-copy">
                  <p className="settings-arch-profile-meta">{t("sessionIn")}</p>
                  <p className="settings-arch-profile-name">{sessionLabel}</p>
                </div>
              </div>

              {showPeriod ? (
                <div className="settings-trial-gauge">
                  <p className={"settings-trial-label" + (period.expired ? " is-danger" : "")}>
                    {periodLabel(t, period, lang)}
                  </p>
                  <div
                    className="storage-gauge-track"
                    role="progressbar"
                    aria-label={t("upgradeRowTrial")}
                    aria-valuenow={Math.round(period.pct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={"storage-gauge-fill" + (period.expired ? " is-empty" : "")}
                      style={{ width: `${period.pct}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <div className="settings-arch-usage">
                <p className="settings-arch-usage-line">
                  {usageCombined(t, scrapCount, usageBytes, storageLimit)}
                </p>
                <StorageGauge usageBytes={usageBytes} storageLimit={storageLimit} hideLabel />
              </div>

              <div className="settings-arch-stub-row settings-arch-stub-row--actions">
                {!browse ? (
                  <>
                    <button type="button" className="settings-arch-chip" onClick={() => void comingSoon()}>
                      <Edit3 className="size-3.5" strokeWidth={1.8} aria-hidden />
                      {t("settingsEditProfile")}
                    </button>
                    <button type="button" className="settings-arch-chip" onClick={() => void comingSoon()}>
                      <KeyRound className="size-3.5" strokeWidth={1.8} aria-hidden />
                      {t("settingsChangePassword")}
                    </button>
                    <button
                      type="button"
                      className="settings-arch-chip settings-arch-chip--danger"
                      onClick={() => void comingSoon()}
                    >
                      <UserMinus className="size-3.5" strokeWidth={1.8} aria-hidden />
                      {t("settingsWithdraw")}
                    </button>
                  </>
                ) : null}
              </div>

              <div className="settings-arch-identity-lead-foot">
                <button
                  type="button"
                  className={"protocol-modal-btn-secondary" + (signingOut ? " is-progress" : "")}
                  disabled={signingOut || resetting}
                  aria-busy={signingOut}
                  onClick={() => void handleLogout()}
                >
                  <LogOut className="size-3.5" strokeWidth={1.8} aria-hidden />
                  <span>{t("logout")}</span>
                </button>
              </div>
            </div>

            <div className="settings-arch-identity-plan">
              <div className="settings-arch-plan-head">
                <PlanTierMeta forceFree={browse} hideTrial />
                <Link to="/upgrade" className="settings-arch-upgrade">
                  {t("settingsUpgradeCta")}
                </Link>
              </div>
              <div className="settings-plan-feature-cols">
                <div className="settings-plan-feature-col">
                  <p className="settings-plan-feature-col-title">{t("planFeatColOn")}</p>
                  <ul className="settings-plan-features">
                    {featureRows
                      .filter((row) => row.ok)
                      .map((row) => (
                        <li key={row.id} className="settings-plan-feature is-ok">
                          <Check className="size-3.5 shrink-0" strokeWidth={2.4} aria-hidden />
                          <span>{row.label}</span>
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="settings-plan-feature-col">
                  <p className="settings-plan-feature-col-title">{t("planFeatColOff")}</p>
                  <ul className="settings-plan-features">
                    {featureRows
                      .filter((row) => !row.ok)
                      .map((row) => (
                        <li key={row.id} className="settings-plan-feature is-off">
                          <Minus className="size-3.5 shrink-0" strokeWidth={2.2} aria-hidden />
                          <span>{row.label}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="settings-arch-section" aria-labelledby="settings-sec-display">
        <h2 id="settings-sec-display" className="settings-arch-title">
          {t("settingsSecDisplay")}
        </h2>

        <div className="settings-arch-grid-2">
          <div className="settings-arch-field">
            <h3>{t("langSwitch")}</h3>
            <p>{t("settingsLangLead")}</p>
            <div className="settings-arch-seg" role="radiogroup" aria-label={t("langSwitch")}>
              <button
                type="button"
                className={"settings-arch-seg-btn" + (lang === "ko" ? " is-on" : "")}
                aria-pressed={lang === "ko"}
                onClick={() => setLang("ko")}
              >
                KO · 한국어
              </button>
              <button
                type="button"
                className={"settings-arch-seg-btn" + (lang === "en" ? " is-on" : "")}
                aria-pressed={lang === "en"}
                onClick={() => setLang("en")}
              >
                EN · English
              </button>
            </div>
          </div>

          <div className="settings-arch-field">
            <h3>{t("themeSwitch")}</h3>
            <p>{t("settingsThemeLead")}</p>
            <div className="settings-arch-seg" role="radiogroup" aria-label={t("themeSwitch")}>
              {(
                [
                  { choice: "light" as ThemeChoice, icon: Sun, label: t("themeLight") },
                  { choice: "system" as ThemeChoice, icon: Monitor, label: t("themeSystem") },
                  { choice: "dark" as ThemeChoice, icon: Moon, label: t("themeDark") },
                ] as const
              ).map(({ choice, icon: Icon, label }) => (
                <button
                  key={choice}
                  type="button"
                  className={"settings-arch-seg-btn" + (theme === choice ? " is-on" : "")}
                  aria-pressed={theme === choice}
                  onClick={() => setTheme(choice)}
                >
                  <Icon className="mr-1 inline size-3.5 align-text-bottom" strokeWidth={1.8} aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-arch-field">
          <h3>{t("paletteSwitch")}</h3>
          <p>{t("settingsPaletteLead")}</p>
          <div className="settings-theme-cards" role="radiogroup" aria-label={t("paletteSwitch")}>
            <button
              type="button"
              className={"settings-theme-card" + (palette === "deckle" ? " is-on" : "")}
              data-preview-palette="deckle"
              aria-pressed={palette === "deckle"}
              onClick={() => setPalette("deckle")}
            >
              <div className="settings-theme-card-top">
                <div>
                  <span className="settings-theme-card-stamp">STANDARD</span>
                  <span className="settings-theme-card-name">{t("paletteDeckleFull")}</span>
                </div>
                {palette === "deckle" ? (
                  <CheckCircle2 className="size-5 shrink-0 text-ink" strokeWidth={1.8} aria-hidden />
                ) : null}
              </div>
              <div className="settings-theme-swatch" aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <div className="settings-theme-card-foot">
                <span>{t("paletteDeckleHint")}</span>
                <span>#FAF9F6</span>
              </div>
            </button>

            <button
              type="button"
              className={"settings-theme-card" + (palette === "editorial" ? " is-on" : "")}
              data-preview-palette="editorial"
              aria-pressed={palette === "editorial"}
              onClick={() => setPalette("editorial")}
            >
              <div className="settings-theme-card-top">
                <div>
                  <span className="settings-theme-card-stamp">SWISS GRID</span>
                  <span className="settings-theme-card-name">{t("paletteEditorialFull")}</span>
                </div>
                {palette === "editorial" ? (
                  <CheckCircle2 className="size-5 shrink-0 text-ink" strokeWidth={1.8} aria-hidden />
                ) : null}
              </div>
              <div className="settings-theme-swatch" aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <div className="settings-theme-card-foot">
                <span>{t("paletteEditorialHint")}</span>
                <span>#FFFFFF</span>
              </div>
            </button>
          </div>
        </div>

        <div className="settings-live-preview">
          <span className="settings-arch-stamp">{t("settingsLivePreview")}</span>
          <span className="settings-live-preview-badge">{previewBadge}</span>
          <div className="settings-live-preview-plate">
            <div className="settings-live-preview-spine">{previewSpine}</div>
            <div className="settings-live-preview-copy">
              <strong>{t("settingsPreviewTitle")}</strong>
              <p>{t("settingsPreviewBody")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-arch-section" aria-labelledby="settings-sec-type">
        <h2 id="settings-sec-type" className="settings-arch-title">
          {t("settingsSecType")}
        </h2>
        <div className="settings-arch-field">
          <h3>{t("readingScaleTitle")}</h3>
          <p>{t("readingScaleLead")}</p>
          <div className="settings-font-grid" role="radiogroup" aria-label={t("readingScaleTitle")}>
            {READING_OPTIONS.map(({ size, labelKey }) => (
              <button
                key={size}
                type="button"
                className={"settings-font-btn" + (readingScale === size ? " is-on" : "")}
                aria-pressed={readingScale === size}
                onClick={() => setReadingScale(size)}
              >
                <span className="settings-font-aa" style={{ fontSize: size }}>
                  Aa
                </span>
                <span>{t(labelKey)}</span>
              </button>
            ))}
          </div>
          <div className="settings-font-sample">
            <div className="settings-font-sample-meta">
              <span>{t("readingScaleSample")}</span>
              <span>
                {t("readingScaleCurrent")}:{" "}
                {t(READING_OPTIONS.find((o) => o.size === readingScale)?.labelKey || "readingScaleMd")}
              </span>
            </div>
            <p className="settings-font-sample-body" style={{ fontSize: `${readingScale}px` }}>
              {t("readingScaleQuote")}
              <cite>{t("readingScaleCite")}</cite>
            </p>
          </div>
        </div>
      </section>

      {user ? (
        <section className="settings-arch-section" aria-labelledby="settings-sec-storage">
          <h2 id="settings-sec-storage" className="settings-arch-title">
            {t("settingsSecStorage")}
          </h2>

          <div className="settings-db-panel" aria-busy={usageLoading}>
            <div className="settings-db-usage">
              <p className="settings-db-summary">
                {usageCombined(t, dbCount, dbBytes, storageLimit)}
              </p>
              <StorageGauge usageBytes={dbBytes} storageLimit={storageLimit} hideLabel />
              {usageLoading ? (
                <div className="settings-db-skeleton" aria-label={t("dbUsageLoading")}>
                  <span className="sr-only">{t("dbUsageLoading")}</span>
                  <div className="classify-draft-skeleton-bar w-3/5" />
                  <div className="classify-draft-skeleton-bar w-2/5" />
                </div>
              ) : (
                <p className={"settings-db-hint" + (hasData ? "" : " settings-db-hint--ok")}>
                  {hasData
                    ? browse
                      ? t("dbUsageHasDataLocal")
                      : t("dbUsageHasData")
                    : browse
                      ? t("dbUsageEmptyLocal")
                      : t("dbUsageEmpty")}
                </p>
              )}
            </div>
            <div className="settings-arch-stub-row settings-arch-stub-row--actions">
              <button
                type="button"
                className={"protocol-modal-btn-danger" + (resetting ? " is-progress" : "")}
                disabled={resetting || usageLoading || !hasData}
                aria-busy={resetting}
                onClick={() => void resetDb()}
              >
                <Trash2 className="size-3.5" strokeWidth={1.8} aria-hidden />
                <span>{t("dbResetAction")}</span>
              </button>
            </div>
          </div>

          {paidSync ? (
            <div className="settings-stub-panel">
              <div className="settings-stub-panel-head">
                <p className="settings-stub-panel-title">{t("settingsSyncStubTitle")}</p>
                <span className="settings-coming-badge">{t("settingsComingSoonBadge")}</span>
              </div>
              <p className="settings-stub-panel-lead">{t("settingsSyncStubLead")}</p>
              <div className="settings-arch-stub-row">
                <button type="button" className="settings-arch-chip" onClick={() => void comingSoon()}>
                  <Cloud className="size-3.5" strokeWidth={1.8} aria-hidden />
                  {t("settingsSyncNow")}
                </button>
                <button type="button" className="settings-arch-chip" onClick={() => void comingSoon()}>
                  <QrCode className="size-3.5" strokeWidth={1.8} aria-hidden />
                  {t("settingsAddDevice")}
                </button>
                <button
                  type="button"
                  className="settings-arch-chip settings-arch-chip--ghost"
                  onClick={() => void comingSoon()}
                >
                  <Search className="size-3.5" strokeWidth={1.8} aria-hidden />
                  {t("settingsDevices")}
                </button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="settings-arch-section" aria-labelledby="settings-sec-security">
        <h2 id="settings-sec-security" className="settings-arch-title">
          {t("settingsSecSecurity")}
        </h2>
        <div className="settings-stub-grid">
          <div className="settings-stub-card">
            <div className="settings-stub-panel-head">
              <h3>
                <Shield className="mr-1 inline size-4 align-text-bottom" strokeWidth={1.8} aria-hidden />
                {t("settings2faTitle")}
              </h3>
              <span className="settings-coming-badge">{t("settingsComingSoonBadge")}</span>
            </div>
            <p>{t("settings2faLead")}</p>
            <div className="settings-stub-card-foot">
              <button type="button" className="settings-arch-chip" onClick={() => void comingSoon()}>
                {t("settingsConfigure")}
              </button>
            </div>
          </div>
          <div className="settings-stub-card">
            <div className="settings-stub-panel-head">
              <h3>
                <KeyRound className="mr-1 inline size-4 align-text-bottom" strokeWidth={1.8} aria-hidden />
                {t("settingsE2eeTitle")}
              </h3>
              <span className="settings-coming-badge">{t("settingsComingSoonBadge")}</span>
            </div>
            <p>{t("settingsE2eeLead")}</p>
            <div className="settings-stub-card-foot">
              <button type="button" className="settings-arch-chip" onClick={() => void comingSoon()}>
                {t("settingsViewRecovery")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
