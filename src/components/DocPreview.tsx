import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "../lib/useT";

type Props = {
  src?: string;
  pages?: string[];
  filename?: string;
  /** Shown when the browser cannot rasterize every page (non-PDF docs). */
  limitedNote?: string;
};

/** Captured page images. Film strip and under-strip pager share one index. */
export function DocPreview({ src, pages, filename, limitedNote }: Props) {
  const t = useT();
  const urls = (pages?.length ? pages : src ? [src] : []).filter(Boolean);
  const [index, setIndex] = useState(0);
  const [shift, setShift] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const wheelLock = useRef(0);
  const page = Math.min(index, Math.max(0, urls.length - 1));
  const current = urls[page] || "";
  const multi = urls.length > 1;

  useLayoutEffect(() => {
    const strip = stripRef.current;
    const el = thumbRefs.current[page];
    if (!strip || !el) return;
    const left = el.offsetLeft + el.offsetWidth / 2 - strip.clientWidth / 2;
    setShift(-left);
  }, [page, urls.length]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !multi) return;
    function onWheel(ev: WheelEvent) {
      const delta = Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY;
      if (Math.abs(delta) < 4) return;
      ev.preventDefault();
      const now = Date.now();
      if (now - wheelLock.current < 180) return;
      wheelLock.current = now;
      setIndex((n) => Math.min(urls.length - 1, Math.max(0, n + (delta > 0 ? 1 : -1))));
    }
    strip.addEventListener("wheel", onWheel, { passive: false });
    return () => strip.removeEventListener("wheel", onWheel);
  }, [multi, urls.length]);

  function thumbClass(i: number) {
    const dist = Math.abs(i - page);
    if (dist === 0) return " is-current";
    if (dist === 1) return " is-near";
    return " is-far";
  }

  if (!current) return null;

  return (
    <div className="doc-preview">
      <div className="doc-preview-stage">
        <img className="doc-preview-img" src={current} alt={filename || ""} />
      </div>
      {multi ? (
        <div
          ref={stripRef}
          className="doc-preview-thumbs"
          role="tablist"
          aria-label={filename || ""}
        >
          <div className="doc-preview-track" style={{ transform: `translateX(${shift}px)` }}>
            {urls.map((url, i) => {
              const near = Math.abs(i - page) <= 4;
              if (!near) return null;
              return (
                <button
                  key={url + i}
                  ref={(el) => {
                    thumbRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={i === page}
                  className={"doc-preview-thumb" + thumbClass(i)}
                  onClick={() => setIndex(i)}
                >
                  <img src={url} alt="" loading={i === page ? "eager" : "lazy"} decoding="async" />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {multi ? (
        <div className="doc-preview-pager">
          <button
            type="button"
            className="doc-preview-pager-btn"
            aria-label={t("prevPage")}
            disabled={page <= 0}
            onClick={() => setIndex((n) => Math.max(0, n - 1))}
          >
            <ChevronLeft className="size-4" strokeWidth={1.8} />
          </button>
          <p className="doc-preview-count">{t("pageCount", { n: page + 1, total: urls.length })}</p>
          <button
            type="button"
            className="doc-preview-pager-btn"
            aria-label={t("nextPage")}
            disabled={page >= urls.length - 1}
            onClick={() => setIndex((n) => Math.min(urls.length - 1, n + 1))}
          >
            <ChevronRight className="size-4" strokeWidth={1.8} />
          </button>
        </div>
      ) : null}
      {limitedNote ? <p className="doc-preview-note">{limitedNote}</p> : null}
    </div>
  );
}
