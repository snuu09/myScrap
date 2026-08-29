import { useEffect, useRef } from "react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { usePlan } from "../context/Plan";
import { admobBannerSlot, admobConfigured, admobPublisherId, loadAdMobScript, pushAdMobBanner } from "../lib/admob";

export function AdSlot() {
  const { lang } = usePrefs();
  const { showAds } = usePlan();
  const pushed = useRef(false);
  const configured = admobConfigured();

  useEffect(() => {
    if (!showAds || !configured || pushed.current) return;
    pushed.current = true;
    void loadAdMobScript()
      .then(() => pushAdMobBanner())
      .catch(() => {
        pushed.current = false;
      });
  }, [showAds, configured]);

  if (!showAds) return null;

  return (
    <aside className="ad-slot" role="complementary" aria-label={t(lang, "adPlaceholder")}>
      {configured ? (
        <ins
          className="adsbygoogle block min-h-[50px] w-full"
          data-ad-client={admobPublisherId()}
          data-ad-slot={admobBannerSlot()}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      ) : (
        <p className="ad-slot-dev">{t(lang, "adMobSetupHint")}</p>
      )}
    </aside>
  );
}
