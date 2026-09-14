import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import type { ScrapType } from "../lib/types";

type Props = {
  types: ScrapType[];
  counts: Record<string, number>;
  active: ScrapType | "all";
  loading?: boolean;
  contained?: boolean;
  onSelect: (value: ScrapType | "all") => void;
};

/** Horizontal type books. Breaks out of the 40rem column; page scroll stays vertical. */
export function TypeBookCarousel({ types, counts, active, loading, contained, onSelect }: Props) {
  const { lang } = usePrefs();
  const t = useT();
  const trackRef = useRef<HTMLDivElement>(null);
  const [ends, setEnds] = useState({ left: false, right: false });
  const books: { id: ScrapType | "all"; label: string; count: number }[] = [
    { id: "all", label: t("filterAll"), count: counts.all || 0 },
    ...types.map((type) => ({
      id: type as ScrapType | "all",
      label: typeLabel(lang, type),
      count: counts[type] || 0,
    })),
  ];

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    function sync() {
      const node = trackRef.current;
      if (!node) return;
      const left = node.scrollLeft > 8;
      const right = node.scrollLeft + node.clientWidth < node.scrollWidth - 8;
      setEnds({ left, right });
    }
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [books.length, loading]);

  function scrollByDir(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: dir * Math.max(el.clientWidth * 0.72, 160),
      behavior: reduce ? "auto" : "smooth",
    });
  }

  return (
    <section className={"type-book-carousel" + (contained ? " type-book-carousel--contained" : "")} aria-label={t("filterAll")}>
      {ends.left ? (
        <button
          type="button"
          className="type-book-nav type-book-nav--prev"
          aria-label={t("typeBooksPrev")}
          onClick={() => scrollByDir(-1)}
        >
          <ChevronLeft className="size-5" strokeWidth={1.8} />
        </button>
      ) : null}
      <div className="type-book-track" role="list" ref={trackRef}>
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
      {ends.right ? (
        <button
          type="button"
          className="type-book-nav type-book-nav--next"
          aria-label={t("typeBooksNext")}
          onClick={() => scrollByDir(1)}
        >
          <ChevronRight className="size-5" strokeWidth={1.8} />
        </button>
      ) : null}
    </section>
  );
}
