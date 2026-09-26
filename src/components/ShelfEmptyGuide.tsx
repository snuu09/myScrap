import { BookOpen, Globe, Plus, Video } from "lucide-react";
import { useT } from "../lib/useT";
import { attachStick, seedStick } from "../lib/stickBridge";

const TEMPLATES = [
  {
    key: "memo" as const,
    icon: BookOpen,
    labelKey: "emptyTplMemoLabel",
    titleKey: "emptyTplMemoTitle",
    descKey: "emptyTplMemoDesc",
    ctaKey: "emptyTplMemoCta",
    seedKey: "emptyTplMemoSeed",
  },
  {
    key: "link" as const,
    icon: Globe,
    labelKey: "emptyTplLinkLabel",
    titleKey: "emptyTplLinkTitle",
    descKey: "emptyTplLinkDesc",
    ctaKey: "emptyTplLinkCta",
    seedKey: "emptyTplLinkSeed",
  },
  {
    key: "video" as const,
    icon: Video,
    labelKey: "emptyTplVideoLabel",
    titleKey: "emptyTplVideoTitle",
    descKey: "emptyTplVideoDesc",
    ctaKey: "emptyTplVideoCta",
    seedKey: "emptyTplVideoSeed",
  },
] as const;

/** Archival empty shelf: hero + one primary CTA + quick onboarding templates. */
export function ShelfEmptyGuide() {
  const t = useT();

  return (
    <section className="shelf-empty-guide" aria-live="polite">
      <div className="shelf-empty-hero">
        <p className="shelf-empty-awaiting">{t("emptyAwaiting")}</p>

        <div className="shelf-empty-spines" aria-hidden>
          <span className="shelf-empty-spine shelf-empty-spine--a">
            <span className="shelf-empty-spine-mark">MEMO</span>
          </span>
          <span className="shelf-empty-spine shelf-empty-spine--b">
            <span className="shelf-empty-spine-mark">WEB</span>
          </span>
          <span className="shelf-empty-spine shelf-empty-spine--center">
            <span className="shelf-empty-spine-badge">1st</span>
            <span className="shelf-empty-spine-bookmark" />
            <span className="shelf-empty-spine-title">{t("emptySpineCenter")}</span>
          </span>
          <span className="shelf-empty-spine shelf-empty-spine--c">
            <span className="shelf-empty-spine-mark">ESSAY</span>
          </span>
          <span className="shelf-empty-spine shelf-empty-spine--d">
            <span className="shelf-empty-spine-mark">ARCHIVE</span>
          </span>
          <div className="shelf-empty-rail">
            <span className="shelf-empty-rail-label">{t("emptyShelfLabel")}</span>
          </div>
        </div>

        <h2 className="shelf-empty-quiet-title">{t("emptyQuietTitle")}</h2>
        <p className="shelf-empty-quiet-body">{t("emptyQuietBody")}</p>

        <button type="button" className="shelf-empty-cta" onClick={() => attachStick()}>
          <Plus className="size-4 shrink-0" strokeWidth={2.2} aria-hidden />
          {t("emptyOpenCta")}
        </button>

        <div className="shelf-empty-onboard">
          <div className="shelf-empty-onboard-head">
            <h3 className="shelf-empty-onboard-title">{t("emptyOnboarding")}</h3>
            <p className="shelf-empty-onboard-eyebrow">{t("emptyOnboardingEyebrow")}</p>
          </div>
          <ul className="shelf-empty-onboard-grid">
            {TEMPLATES.map(({ key, icon: Icon, labelKey, titleKey, descKey, ctaKey, seedKey }) => (
              <li key={key} className="shelf-empty-card">
                <Icon className="shelf-empty-card-icon size-5" strokeWidth={1.6} aria-hidden />
                <p className="shelf-empty-card-label">{t(labelKey)}</p>
                <h4 className="shelf-empty-card-title">{t(titleKey)}</h4>
                <p className="shelf-empty-card-desc">{t(descKey)}</p>
                <button
                  type="button"
                  className="shelf-empty-card-cta"
                  onClick={() => seedStick(t(seedKey))}
                >
                  {t(ctaKey)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
