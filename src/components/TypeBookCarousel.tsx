import { useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { typeLabel } from "../i18n";
import { spineColor } from "../lib/typeColor";
import { DocumentMark } from "./DocumentMark";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
type Props = {
  types: string[];
  counts: Record<string, number>;
  active: string;
  loading?: boolean;
  contained?: boolean;
  onSelect: (value: string) => void;
};

/** Horizontal type books. Default breaks out of the 40rem column; `contained` stays in the door. */
export function TypeBookCarousel({ types, counts, active, loading, contained, onSelect }: Props) {
  const { lang } = usePrefs();
  const t = useT();
  const trackRef = useRef<HTMLDivElement>(null);
  const [ends, setEnds] = useState({ left: false, right: false });
  const [fit, setFit] = useState(false);
  const books: { id: string; label: string; count: number }[] = [
    { id: "all", label: t("filterAll"), count: counts.all || 0 },
    ...(counts.bookmarked
      ? [{ id: "bookmarked", label: t("filterBookmark"), count: counts.bookmarked }]
      : []),
    ...types.map((type) => ({
      id: type,
      label: typeLabel(lang, type),
      count: counts[type] || 0,
    })),
  ];

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    function sync() {
      const node = trackRef.current;
      if (!node) return;
      const left = node.scrollLeft > 8;
      const right = node.scrollLeft + node.clientWidth < node.scrollWidth - 8;
      setEnds({ left, right });
      const door = node.closest(".shelf-door");
      const gap = parseFloat(getComputedStyle(node).columnGap) || 0;
      const bookEls = [...node.querySelectorAll(".type-book")];
      const needed = bookEls.reduce((sum, book, index) => {
        return sum + book.getBoundingClientRect().width + (index ? gap : 0);
      }, 0);
      let content = node.clientWidth;
      if (!contained && door instanceof HTMLElement) {
        const doorStyle = getComputedStyle(door);
        content =
          door.clientWidth - parseFloat(doorStyle.paddingLeft) - parseFloat(doorStyle.paddingRight);
      }
      setFit(needed > 0 && needed + 8 <= content);
    }
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    const door = el.closest(".shelf-door");
    if (door) observer.observe(door);
    return () => {
      el.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [books.length, loading, contained]);

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
    <section
      className={
        "type-book-carousel" +
        (contained ? " type-book-carousel--contained" : "") +
        (fit ? " type-book-carousel--fit" : "")
      }
      aria-label={t("filterAll")}
    >
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
              style={{ ["--spine" as string]: spineColor(book.id) }}
              aria-pressed={pressed}
              disabled={loading}
              onClick={() => onSelect(book.id)}
            >
              <span className="type-book-spine" aria-hidden />
              <span className="type-book-cover">
                {book.id === "bookmarked" ? (
                  <span className="type-book-bookmark scrap-bookmark-ribbon" aria-hidden />
                ) : book.id !== "all" ? (
                  <DocumentMark type={book.id} size="sm" />
                ) : null}
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
