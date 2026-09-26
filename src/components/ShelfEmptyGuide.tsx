import { Plus } from "lucide-react";
import { useT } from "../lib/useT";
import { attachStick } from "../lib/stickBridge";
import { EmptyTemplateHints } from "./EmptyTemplateHints";

/** Archival empty shelf: hero + one primary CTA + quick onboarding templates. */
export function ShelfEmptyGuide() {
  const t = useT();

  return (
    <section className="shelf-empty-guide" aria-live="polite">
      <div className="shelf-empty-hero">
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

        <EmptyTemplateHints withCta showHead />
      </div>
    </section>
  );
}
