import { useNavigate } from "react-router-dom";
import { useT } from "../lib/useT";
import { relatedScraps } from "../lib/related";
import { scrapCover, scrapFaceTitle } from "../lib/scrapFace";
import { FAVICON_HOLDER } from "../lib/audioCover";
import type { Scrap } from "../lib/types";

type Props = {
  item: Scrap;
  scraps: Scrap[];
};

export function RelatedPages({ item, scraps }: Props) {
  const t = useT();
  const navigate = useNavigate();
  const related = relatedScraps(item, scraps);
  if (!related.length) return null;

  return (
    <section className="dashboard-panel detail-related" aria-label={t("relatedTitle")}>
      <p className="detail-section-title">{t("relatedTitle")}</p>
      <div className="detail-related-row">
        {related.map((page) => {
          const cover = scrapCover(page);
          return (
            <button key={page.id} type="button" className="detail-related-card" onClick={() => navigate("/scrap/" + page.id)}>
              {cover && cover !== FAVICON_HOLDER ? (
                <img src={cover} alt="" className="detail-related-cover" />
              ) : (
                <span className="detail-related-cover detail-related-cover--holder">
                  <img src={FAVICON_HOLDER} alt="" />
                </span>
              )}
              <span className="face-title">{scrapFaceTitle(page, t("untitled"))}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
