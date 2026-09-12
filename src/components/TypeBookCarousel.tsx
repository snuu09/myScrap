import { typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import type { ScrapType } from "../lib/types";

type Props = {
  types: ScrapType[];
  counts: Record<string, number>;
  active: ScrapType | "all";
  loading?: boolean;
  onSelect: (value: ScrapType | "all") => void;
};

/** Horizontal Millie-like type books (MyBrary tokens, not a Millie clone). */
export function TypeBookCarousel({ types, counts, active, loading, onSelect }: Props) {
  const { lang } = usePrefs();
  const t = useT();
  const books: { id: ScrapType | "all"; label: string; count: number }[] = [
    { id: "all", label: t("filterAll"), count: counts.all || 0 },
    ...types.map((type) => ({
      id: type as ScrapType | "all",
      label: typeLabel(lang, type),
      count: counts[type] || 0,
    })),
  ];

  return (
    <section className="type-book-carousel" aria-label={t("filterAll")}>
      <div className="type-book-track" role="list">
        {books.map((book) => {
          const pressed = active === book.id;
          return (
            <button
              key={book.id}
              type="button"
              role="listitem"
              className={"type-book" + (pressed ? " type-book--active" : "")}
              aria-pressed={pressed}
              disabled={loading}
              onClick={() => onSelect(book.id)}
            >
              <span className="type-book-spine" aria-hidden />
              <span className="type-book-cover">
                <span className="type-book-title">{book.label}</span>
                <span className="type-book-count">{loading ? "…" : book.count}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
