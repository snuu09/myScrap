import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "../lib/useT";

type Props = {
  src?: string;
  pages?: string[];
  filename?: string;
  /** Shown when the browser cannot rasterize every page (non-PDF docs). */
  limitedNote?: string;
};

/** Captured page images. Buttons, film strip, and the large page share one index. */
export function DocPreview({ src, pages, filename, limitedNote }: Props) {
  const t = useT();
  const urls = (pages?.length ? pages : src ? [src] : []).filter(Boolean);
  const [index, setIndex] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ignoreScroll = useRef(false);
  const page = Math.min(index, Math.max(0, urls.length - 1));
  const current = urls[page] || "";
  const multi = urls.length > 1;

  function scrollThumb(i: number) {
    const strip = stripRef.current;
    const el = thumbRefs.current[i];
    if (!strip || !el) return;
    ignoreScroll.current = true;
    const left = el.offsetLeft - (strip.clientWidth - el.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }

  useEffect(() => {
    if (!multi) return;
    scrollThumb(page);
    const timer =     window.setTimeout(() => {
      ignoreScroll.current = false;
    }, 500);
    return () => window.clearTimeout(timer);
  }, [page, multi, urls.length]);

  function nearestThumb() {
    const strip = stripRef.current;
    if (!strip) return page;
    const mid = strip.scrollLeft + strip.clientWidth / 2;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    thumbRefs.current.forEach((el, i) => {
      if (!el) return;
      const center = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }

  function onStripScrollEnd() {
    if (ignoreScroll.current) return;
    const next = nearestThumb();
    if (next !== page) setIndex(next);
  }

  if (!current) return null;

  return (
    <div className="doc-preview">
      <div className="doc-preview-stage">
        {multi ? (
          <button
            type="button"
            className="doc-preview-nav doc-preview-nav--prev"
            aria-label={t("prevPage")}
            disabled={page <= 0}
            onClick={() => setIndex((n) => Math.max(0, n - 1))}
          >
            <ChevronLeft className="size-5" strokeWidth={1.8} />
          </button>
        ) : null}
        <img className="doc-preview-img" src={current} alt={filename || ""} />
        {multi ? (
          <button
            type="button"
            className="doc-preview-nav doc-preview-nav--next"
            aria-label={t("nextPage")}
            disabled={page >= urls.length - 1}
            onClick={() => setIndex((n) => Math.min(urls.length - 1, n + 1))}
          >
            <ChevronRight className="size-5" strokeWidth={1.8} />
          </button>
        ) : null}
        {multi ? (
          <p className="doc-preview-count">
            {t("pageCount", { n: page + 1, total: urls.length })}
          </p>
        ) : null}
        {multi ? (
          <div
            ref={stripRef}
            className="doc-preview-thumbs"
            role="tablist"
            aria-label={filename || ""}
            onScrollEnd={onStripScrollEnd}
          >
            {urls.map((url, i) => (
              <button
                key={url + i}
                ref={(el) => {
                  thumbRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={i === page}
                className={"doc-preview-thumb" + (i === page ? " is-current" : "")}
                onClick={() => setIndex(i)}
              >
                <img src={url} alt="" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {limitedNote ? <p className="doc-preview-note">{limitedNote}</p> : null}
    </div>
  );
}
