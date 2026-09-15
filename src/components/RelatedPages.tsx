import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import { relatedScraps } from "../lib/related";
import { ScrapBookCard } from "./ScrapList";
import type { Scrap } from "../lib/types";

type Props = {
  item: Scrap;
  scraps: Scrap[];
};

export function RelatedPages({ item, scraps }: Props) {
  const t = useT();
  const { shelfLayout } = usePrefs();
  const related = relatedScraps(item, scraps, item.linkedIds || []);
  if (!related.length) return null;

  const asList = shelfLayout !== "gallery";
  const listClass = asList ? "scrap-list scrap-list--list" : "scrap-list scrap-list--gallery";

  return (
    <section className="dashboard-panel detail-related" aria-label={t("relatedTitle")}>
      <p className="detail-section-title">{t("relatedTitle")}</p>
      <ul className={listClass}>
        {related.map((page, index) => (
          <ScrapBookCard key={page.id} item={page} index={index} row={asList} />
        ))}
      </ul>
    </section>
  );
}
