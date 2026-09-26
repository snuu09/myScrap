import { Plus } from "lucide-react";

type Props = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  onCta: () => void;
};

/** Compact Soft Deckle empty card (no spines / onboarding). Shared by Explore and Stats. */
export function PageEmptyGuide({ eyebrow, title, body, ctaLabel, onCta }: Props) {
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
      </div>
    </section>
  );
}
