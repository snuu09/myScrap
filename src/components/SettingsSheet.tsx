import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { usePrefs, type ThemeChoice } from "../context/Prefs";
import { isBrowseUser, useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import { clearUserScraps, loadScraps, loadUserDbUsage, SCRAPS_CLEARED_EVENT } from "../lib/scraps";
import { useDialog } from "../lib/dialog";
import { useT } from "../lib/useT";
import { formatBytes } from "../lib/tagger";
import { markArriveGenie } from "../lib/pageGenie";
import { scrapsToMarkdown } from "../lib/exportMarkdown";
import { triggerAnchorDownload } from "../lib/fileDownload";
import { PlanTierMeta, StorageGauge } from "./PlanUsageBlock";
import { GlassCluster } from "./GlassCluster";
import { IconTip } from "./IconTip";

function Seg({
  pressed,
  children,
  onClick,
}: {
  pressed: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className="settings-seg">
      {children}
    </button>
  );
}

function PrefRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="settings-pref-row">
      <p className="settings-section-label">{label}</p>
      <GlassCluster className="settings-seg-track" label={label} restOnPressed>
        {children}
      </GlassCluster>
    </div>
  );
}

export function SettingsPage() {
  const { lang, theme, palette, setLang, setTheme, setPalette } = usePrefs();
  const t = useT();
  const { user, signOut } = useAuth();
  const { setScrapsForUsage, setUsageSnapshot, scrapCount, usageBytes, storageLimit, showAds } = usePlan();
  const { alert, confirm } = useDialog();
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const [usageLoading, setUsageLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [dbCount, setDbCount] = useState(scrapCount);
  const [dbBytes, setDbBytes] = useState(usageBytes);
  const [exporting, setExporting] = useState(false);

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

  const sessionLabel = user
    ? isBrowseUser(user)
      ? t("browse")
      : user.email || "—"
    : "";

  const hasData = dbCount > 0 || dbBytes > 0;

  async function exportMarkdown() {
    if (!user || exporting) return;
    setExporting(true);
    try {
      const rows = await loadScraps(user);
      const md = scrapsToMarkdown(rows, t("appName"));
      const stamp = new Date().toISOString().slice(0, 10);
      triggerAnchorDownload(new Blob([md], { type: "text/markdown;charset=utf-8" }), `mybrary-export-${stamp}.md`);
      await alert(t("exportDone"));
    } catch {
      await alert(t("syncError"));
    } finally {
      setExporting(false);
    }
  }

  async function resetDb() {
    if (!user || resetting || !hasData) return;
    const ok = await confirm({
      body: t(isBrowseUser(user) ? "guestResetConfirm" : "dbResetConfirm"),
      danger: true,
      confirmLabel: t("dbReset"),
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
      <h1 id="settings-title" className="dashboard-title">
        {t("settings")}
      </h1>

      {user ? (
        <section className="settings-card" aria-label={t("settingsAccount")}>
          <p className="settings-card-label">{t("settingsAccount")}</p>
          <div className="settings-pref-row settings-account-row">
            <p className="settings-section-label">{t("sessionIn")}</p>
            <strong className="settings-account-value">{sessionLabel}</strong>
          </div>
          <div className="settings-pref-row settings-account-row">
            <p className="settings-section-label">{t("planLabel")}</p>
            <div className="settings-plan-value">
              <PlanTierMeta />
              <IconTip label={t("upgradeOpen")}>
                <Link to="/upgrade" className="settings-upgrade-icon" aria-label={t("upgradeOpen")}>
                  <ChevronRight className="size-5" strokeWidth={1.8} />
                </Link>
              </IconTip>
            </div>
          </div>
          <StorageGauge usageBytes={usageBytes} storageLimit={storageLimit} />
          {showAds ? <span className="plan-ads-note">{t("adPlaceholder")}</span> : null}
          <GlassCluster className="liquid-solo" label={t("logout")} ripple>
            <button
              type="button"
              className={"settings-btn-leave" + (signingOut ? " is-progress" : "")}
              disabled={signingOut || resetting}
              aria-busy={signingOut}
              onClick={async () => {
                setSigningOut(true);
                try {
                  markArriveGenie(false);
                  await signOut();
                  navigate("/");
                } finally {
                  setSigningOut(false);
                }
              }}
            >
              {t("logout")}
            </button>
          </GlassCluster>
        </section>
      ) : null}

      <section className="settings-card" aria-label={t("settingsLookGroup")}>
        <p className="settings-card-label">{t("settingsLookGroup")}</p>
        <PrefRow label={t("langSwitch")}>
          <Seg pressed={lang === "ko"} onClick={() => setLang("ko")}>
            KO
          </Seg>
          <Seg pressed={lang === "en"} onClick={() => setLang("en")}>
            EN
          </Seg>
        </PrefRow>
        <PrefRow label={t("paletteSwitch")}>
          <Seg pressed={palette === "editorial"} onClick={() => setPalette("editorial")}>
            {t("paletteEditorial")}
          </Seg>
          <Seg pressed={palette === "deckle"} onClick={() => setPalette("deckle")}>
            {t("paletteDeckle")}
          </Seg>
        </PrefRow>
        <PrefRow label={t("themeSwitch")}>
          {(["light", "system", "dark"] as ThemeChoice[]).map((choice) => (
            <Seg key={choice} pressed={theme === choice} onClick={() => setTheme(choice)}>
              {t(choice === "light" ? "themeLight" : choice === "dark" ? "themeDark" : "themeSystem")}
            </Seg>
          ))}
        </PrefRow>
      </section>

      {user ? (
        <section className="settings-card" aria-label={t("exportMarkdown")}>
          <p className="settings-card-label">{t("exportMarkdown")}</p>
          <div className="settings-export-row">
            <p className="settings-export-hint">{t("dbUsageSummary", { count: dbCount, bytes: formatBytes(dbBytes) })}</p>
            <GlassCluster className="liquid-solo" label={t("exportMarkdown")} ripple>
              <button
                type="button"
                className={"settings-btn-reset" + (exporting ? " is-progress" : "")}
                disabled={exporting || !hasData}
                onClick={() => void exportMarkdown()}
              >
                {t("exportMarkdown")}
              </button>
            </GlassCluster>
          </div>
        </section>
      ) : null}

      {user ? (
        <section className="settings-card" aria-label={t("dbUsageLabel")}>
          <p className="settings-card-label">{t("dbUsageLabel")}</p>
          <div className="settings-db-panel" aria-busy={usageLoading}>
                <div className="settings-db-usage">
                  <p className="settings-db-summary">
                    {t("dbUsageSummary", {
                      count: dbCount,
                      bytes: formatBytes(dbBytes),
                    })}
                  </p>
                  <StorageGauge usageBytes={dbBytes} storageLimit={storageLimit} />
                  {usageLoading ? (
                    <div className="settings-db-skeleton" aria-label={t("dbUsageLoading")}>
                      <span className="sr-only">{t("dbUsageLoading")}</span>
                      <div className="classify-draft-skeleton-bar w-3/5" />
                      <div className="classify-draft-skeleton-bar w-2/5" />
                    </div>
                  ) : (
                    <p className={"settings-db-hint" + (hasData ? "" : " settings-db-hint--ok")}>
                      {hasData ? t("dbUsageHasData") : t("dbUsageEmpty")}
                    </p>
                  )}
                </div>
                <GlassCluster className="liquid-solo" label={t("dbReset")} ripple>
                  <button
                    type="button"
                    className="settings-btn-reset"
                    disabled={resetting || usageLoading || !hasData}
                    onClick={() => void resetDb()}
                  >
                    {t("dbReset")}
                  </button>
                </GlassCluster>
          </div>
        </section>
      ) : null}
    </div>
  );
}
