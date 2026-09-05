import type { ShelfLayout } from "../context/Prefs";
import { useT } from "../lib/useT";

/** Placeholder scrap cards while the shelf list loads after sign-in. */
export function ScrapListSkeleton({ count = 3, layout = "list" }: { count?: number; layout?: ShelfLayout }) {
  const t = useT();
  const n = layout === "list" ? count : Math.max(count, 4);
  return (
    <ul className={"scrap-list scrap-list--" + layout} aria-busy="true" aria-label={t("shelfLoading")}>
      {Array.from({ length: n }, (_, i) => (
        <li key={i} className="scrap-card scrap-card--skeleton" aria-hidden>
          <div className="scrap-card-media-frame scrap-card-media-frame--skeleton">
            <div className="scrap-card-media-skeleton" />
          </div>
          {layout !== "gallery" ? (
            <div className="scrap-card-body">
              <div className="classify-draft-skeleton-bar w-3/5" />
              <div className="classify-draft-skeleton-bar w-2/5" />
              {layout === "list" ? (
                <>
                  <div className="classify-draft-skeleton-bar w-4/5" />
                  <div className="mt-1 flex gap-2">
                    <div className="classify-draft-skeleton-bar w-16" />
                    <div className="classify-draft-skeleton-bar w-20" />
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
