import type { ShelfLayout } from "../context/Prefs";
import { useT } from "../lib/useT";

/** Placeholder scrap cards while the shelf list loads after sign-in. */
export function ScrapListSkeleton({ count = 3, layout = "micro" }: { count?: number; layout?: ShelfLayout }) {
  const t = useT();
  const row = layout === "gallery" ? "gallery" : "micro";
  const n = row === "micro" ? count : Math.max(count, 4);
  return (
    <ul className={"scrap-list scrap-list--" + row} aria-busy="true" aria-label={t("shelfLoading")}>
      {Array.from({ length: n }, (_, i) => (
        <li
          key={i}
          className={"scrap-card scrap-card--skeleton" + (row === "gallery" ? " scrap-card--gallery" : " scrap-card--row")}
          aria-hidden
        >
          {row === "gallery" ? (
            <>
              <div className="scrap-gallery-plate scrap-gallery-plate--skeleton">
                <div className="scrap-card-media-skeleton" />
              </div>
              <div className="scrap-gallery-caption">
                <div className="classify-draft-skeleton-bar w-4/5" />
                <div className="classify-draft-skeleton-bar w-3/5" />
              </div>
            </>
          ) : (
            <div className="scrap-card-hit scrap-card-hit--skeleton">
              <div className="scrap-row-thumb scrap-row-thumb--skeleton">
                <div className="scrap-card-media-skeleton" />
              </div>
              <div className="scrap-row-copy">
                <div className="classify-draft-skeleton-bar w-2/5" />
                <div className="classify-draft-skeleton-bar w-4/5" />
                <div className="classify-draft-skeleton-bar w-3/5" />
                <div className="mt-1 flex gap-2">
                  <div className="classify-draft-skeleton-bar w-16" />
                  <div className="classify-draft-skeleton-bar w-20" />
                </div>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
