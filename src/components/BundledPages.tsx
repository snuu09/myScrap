import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useT } from "../lib/useT";
import { resolveLinked } from "../lib/links";
import { scrapCover, scrapFaceTitle } from "../lib/scrapFace";
import { FAVICON_HOLDER } from "../lib/audioCover";
import type { Scrap } from "../lib/types";

type Props = {
  item: Scrap;
  scraps: Scrap[];
  busy?: boolean;
  onUnlink?: (peerId: string) => void;
};

export function BundledPages({ item, scraps, busy, onUnlink }: Props) {
  const t = useT();
  const navigate = useNavigate();
  const linked = resolveLinked(item, scraps);
  if (!linked.length) return null;

  return (
    <section id="detail-bundled" className="dashboard-panel detail-related detail-bundled" aria-label={t("bundledTitle")}>
      <p className="detail-section-title">{t("bundledTitle")}</p>
      <div className="detail-related-row">
        {linked.map((page) => {
          const cover = scrapCover(page);
          return (
            <div key={page.id} className="detail-related-card detail-related-card--row">
              <button type="button" className="detail-related-card-main" onClick={() => navigate("/scrap/" + page.id)}>
                {cover && cover !== FAVICON_HOLDER ? (
                  <img src={cover} alt="" className="detail-related-cover" />
                ) : (
                  <span className="detail-related-cover detail-related-cover--holder">
                    <img src={FAVICON_HOLDER} alt="" />
                  </span>
                )}
                <span className="face-title">{scrapFaceTitle(page, t("untitled"))}</span>
              </button>
              {onUnlink ? (
                <button
                  type="button"
                  className="detail-related-unlink"
                  aria-label={t("bundledUnlink")}
                  disabled={busy}
                  onClick={() => onUnlink(page.id)}
                >
                  <X className="size-4" strokeWidth={1.8} />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
