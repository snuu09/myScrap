import { BookOpen, Globe, Video, type LucideIcon } from "lucide-react";
import { useT } from "../lib/useT";
import { seedStick } from "../lib/stickBridge";

export const EMPTY_TEMPLATES = [
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
] as const satisfies ReadonlyArray<{
  key: string;
  icon: LucideIcon;
  labelKey: string;
  titleKey: string;
  descKey: string;
  ctaKey: string;
  seedKey: string;
}>;

type Props = {
  /** When false, cards are static hints (search empty). When true, seed CTAs (shelf). */
  withCta?: boolean;
  /** Optional onboard heading block above the grid. */
  showHead?: boolean;
};

/** Shared Soft Deckle template cards: memo / link / video. */
export function EmptyTemplateHints({ withCta = false, showHead = false }: Props) {
  const t = useT();

  return (
    <div className={"shelf-empty-onboard" + (withCta ? "" : " shelf-empty-onboard--hints")}>
      {showHead ? (
        <div className="shelf-empty-onboard-head">
          <h3 className="shelf-empty-onboard-title">{t("emptyOnboarding")}</h3>
        </div>
      ) : null}
      <ul className="shelf-empty-onboard-grid">
        {EMPTY_TEMPLATES.map(({ key, icon: Icon, labelKey, titleKey, descKey, ctaKey, seedKey }) => (
          <li key={key} className="shelf-empty-card">
            <Icon className="shelf-empty-card-icon size-5" strokeWidth={1.6} aria-hidden />
            <p className="shelf-empty-card-label">{t(labelKey)}</p>
            <h4 className="shelf-empty-card-title">{t(titleKey)}</h4>
            <p className="shelf-empty-card-desc">{t(descKey)}</p>
            {withCta ? (
              <button
                type="button"
                className="shelf-empty-card-cta"
                onClick={() => seedStick(t(seedKey))}
              >
                {t(ctaKey)}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
