import { Plus } from "lucide-react";
import { EmptyTemplateHints } from "./EmptyTemplateHints";

type Props = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  onCta: () => void;
  /** Search empty: show shelf template cards without seed/담기 CTAs. */
  showTemplateHints?: boolean;
};

/** Compact Soft Deckle empty card. Optional static template hints (search). */
export function PageEmptyGuide({ eyebrow, title, body, ctaLabel, onCta, showTemplateHints = false }: Props) {
  return (
    <section className="shelf-empty-guide page-empty-guide" aria-live="polite">
      <div className="shelf-empty-hero">
        <p className="shelf-empty-awaiting">{eyebrow}</p>
        <h2 className="shelf-empty-quiet-title">{title}</h2>
        <p className="shelf-empty-quiet-body">{body}</p>
        <button type="button" className="shelf-empty-cta" onClick={onCta}>
          <Plus className="size-4 shrink-0" strokeWidth={2.2} aria-hidden />
          {ctaLabel}
        </button>
        {showTemplateHints ? <EmptyTemplateHints /> : null}
      </div>
    </section>
  );
}
