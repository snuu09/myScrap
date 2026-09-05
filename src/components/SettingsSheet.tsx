import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { t } from "../i18n";
import { usePrefs, type Look, type Palette, type ThemeChoice } from "../context/Prefs";
import { isBrowseUser, useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import { clearUserScraps, loadUserDbUsage, SCRAPS_CLEARED_EVENT } from "../lib/scraps";
import { useDialog } from "../lib/dialog";
import { formatBytes } from "../lib/tagger";
import { PlanUsageBlock, StorageGauge } from "./PlanUsageBlock";
import { IconTip } from "./IconTip";

type Props = { open: boolean; onClose: () => void };

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

function SettingsSection({
  label,
  groupLabel,
  children,
}: {
  label: string;
  groupLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="settings-section" aria-label={groupLabel}>
      <p className="settings-section-label">{label}</p>
      <div className="settings-seg-track" role="group" aria-label={groupLabel}>
        {children}
      </div>
    </section>
  );
}

export function SettingsSheet({ open, onClose }: Props) {
  const { lang, theme, palette, look, setLang, setTheme, setPalette, setLook } = usePrefs();
  const { user, signOut } = useAuth();
  const { setScrapsForUsage, setUsageSnapshot, scrapCount, usageBytes, storageLimit } = usePlan();
  const { alert, confirm } = useDialog();
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const [usageLoading, setUsageLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [dbCount, setDbCount] = useState(scrapCount);
  const [dbBytes, setDbBytes] = useState(usageBytes);

  useEffect(() => {
    if (!open || !user) return;
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
    // Only refetch when the sheet opens for this user
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open/user gate
  }, [open, user]);

  if (!open) return null;

  const sessionLabel = user
    ? isBrowseUser(user)
      ? t(lang, "browse")
      : user.email || "—"
    : "";

  const hasData = dbCount > 0 || dbBytes > 0;

  async function resetDb() {
    if (!user || resetting || !hasData) return;
    const ok = await confirm({
      body: t(lang, isBrowseUser(user) ? "guestResetConfirm" : "dbResetConfirm"),
      danger: true,
      confirmLabel: t(lang, "dbReset"),
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
      await alert(t(lang, "dbResetDone"));
      onClose();
      navigate("/");
    } catch {
      await alert(t(lang, "syncError"));
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 bg-[color-mix(in_srgb,var(--color-ink)_24%,transparent)]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="absolute top-[60px] right-[var(--gutter,clamp(16px,4vw,40px))] flex max-h-[calc(100dvh-80px)] w-[min(22rem,calc(100vw-24px))] flex-col gap-3 overflow-y-auto rounded-[32px] border border-paper-line bg-login-wall p-3.5 shadow-[var(--shadow-sheet)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-0 flex items-center justify-between">
          <h2 id="settings-title" className="m-0 min-w-0 flex-1 text-[1.0625rem] font-bold">
            {t(lang, "settings")}
          </h2>
          <IconTip label={t(lang, "close")}>
            <button type="button" className="grid size-12 shrink-0 place-items-center" onClick={onClose} aria-label={t(lang, "close")}>
              <X className="size-[22px]" strokeWidth={1.8} />
            </button>
          </IconTip>
        </div>

        {user ? (
          <p className="settings-session-chip">
            {t(lang, "sessionIn")}
            <strong>{sessionLabel}</strong>
          </p>
        ) : null}

        {user ? (
          <section className="settings-section" aria-label={t(lang, "planLabel")}>
            <p className="settings-section-label">{t(lang, "planLabel")}</p>
            <div className="settings-session-chip">
              <PlanUsageBlock showAdsNote />
            </div>
          </section>
        ) : null}

        <SettingsSection label={t(lang, "langSwitch")} groupLabel={t(lang, "langSwitch")}>
          <Seg pressed={lang === "ko"} onClick={() => setLang("ko")}>
            KO
          </Seg>
          <Seg pressed={lang === "en"} onClick={() => setLang("en")}>
            EN
          </Seg>
        </SettingsSection>

        <SettingsSection label={t(lang, "paletteSwitch")} groupLabel={t(lang, "paletteSwitch")}>
          <Seg pressed={palette === "kitchen"} onClick={() => setPalette("kitchen" as Palette)}>
            {t(lang, "paletteKitchen")}
          </Seg>
          <Seg pressed={palette === "basalt"} onClick={() => setPalette("basalt")}>
            {t(lang, "paletteBasalt")}
          </Seg>
        </SettingsSection>

        <SettingsSection label={t(lang, "lookSwitch")} groupLabel={t(lang, "lookSwitch")}>
          <Seg pressed={look === "fridge"} onClick={() => setLook("fridge" as Look)}>
            {t(lang, "lookFridge")}
          </Seg>
          <Seg pressed={look === "library"} onClick={() => setLook("library")}>
            {t(lang, "lookLibrary")}
          </Seg>
        </SettingsSection>

        <SettingsSection label={t(lang, "themeSwitch")} groupLabel={t(lang, "themeSwitch")}>
          {(["light", "system", "dark"] as ThemeChoice[]).map((choice) => (
            <Seg key={choice} pressed={theme === choice} onClick={() => setTheme(choice)}>
              {t(lang, choice === "light" ? "themeLight" : choice === "dark" ? "themeDark" : "themeSystem")}
            </Seg>
          ))}
        </SettingsSection>

        {user ? (
          <>
            <section className="settings-section" aria-label={t(lang, "dbUsageLabel")}>
              <p className="settings-section-label">{t(lang, "dbUsageLabel")}</p>
              <div className="settings-db-panel" aria-busy={usageLoading}>
                <div className="settings-db-usage">
                  <p className="settings-db-summary">
                    {t(lang, "dbUsageSummary", {
                      count: dbCount,
                      bytes: formatBytes(dbBytes),
                    })}
                  </p>
                  <StorageGauge usageBytes={dbBytes} storageLimit={storageLimit} />
                  {usageLoading ? (
                    <div className="settings-db-skeleton" aria-label={t(lang, "dbUsageLoading")}>
                      <span className="sr-only">{t(lang, "dbUsageLoading")}</span>
                      <div className="classify-draft-skeleton-bar w-3/5" />
                      <div className="classify-draft-skeleton-bar w-2/5" />
                    </div>
                  ) : (
                    <p className={"settings-db-hint" + (hasData ? "" : " settings-db-hint--ok")}>
                      {hasData ? t(lang, "dbUsageHasData") : t(lang, "dbUsageEmpty")}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="settings-btn-reset"
                  disabled={resetting || usageLoading || !hasData}
                  onClick={() => void resetDb()}
                >
                  {t(lang, "dbReset")}
                </button>
              </div>
            </section>
            <button
              type="button"
              className={"settings-btn-leave" + (signingOut ? " is-progress" : "")}
              disabled={signingOut || resetting}
              aria-busy={signingOut}
              onClick={async () => {
                setSigningOut(true);
                try {
                  await signOut();
                  onClose();
                } finally {
                  setSigningOut(false);
                }
              }}
            >
              {t(lang, "logout")}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
