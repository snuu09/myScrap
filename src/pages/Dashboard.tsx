import { Link } from "react-router-dom";
import { t, typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { PlanUsageBlock } from "../components/PlanUsageBlock";
import { aggregateStats } from "../lib/scrapFilters";
import { formatWhen } from "../lib/time";
import type { Scrap, ScrapType } from "../lib/types";

type Props = { scraps: Scrap[] };

export function Dashboard({ scraps }: Props) {
  const { lang } = usePrefs();
  const stats = aggregateStats(scraps);
  const recent = [...scraps].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
  const typeEntries = [...stats.byType.entries()];

  return (
    <div className="dashboard-door">
      <div className="dashboard-head">
        <h1 className="dashboard-title">{t(lang, "dashboardTitle")}</h1>
        <Link to="/" className="auth-link-toggle min-h-10 no-underline">
          {t(lang, "backToShelf")}
        </Link>
      </div>

      <section className="dashboard-panel" aria-label={t(lang, "planLabel")}>
        <p className="list-tools-label">{t(lang, "planLabel")}</p>
        <PlanUsageBlock />
      </section>

      <section className="dashboard-panel" aria-label={t(lang, "statsByType")}>
        <p className="list-tools-label">{t(lang, "statsByType")}</p>
        {typeEntries.length ? (
          <div className="dashboard-chips">
            {typeEntries.map(([type, count]) => (
              <span key={type} className="dashboard-chip">
                {typeLabel(lang, type as ScrapType)} {count}
              </span>
            ))}
          </div>
        ) : (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">—</p>
          </div>
        )}
      </section>

      <section className="dashboard-panel" aria-label={t(lang, "statsByTag")}>
        <p className="list-tools-label">{t(lang, "statsByTag")}</p>
        {stats.byTag.length ? (
          <div className="dashboard-chips">
            {stats.byTag.map(([tag, count]) => (
              <span key={tag} className="scrap-tag">
                {tag} {count}
              </span>
            ))}
          </div>
        ) : (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">—</p>
          </div>
        )}
      </section>

      <section className="dashboard-panel" aria-label={t(lang, "statsTimeline")}>
        <p className="list-tools-label">{t(lang, "statsTimeline")}</p>
        {recent.length ? (
          <ul className="dashboard-timeline">
            {recent.map((item) => (
              <li key={item.id} className="dashboard-timeline-item">
                <p className="dashboard-timeline-title">{item.title || t(lang, "untitled")}</p>
                <p className="dashboard-timeline-meta">
                  {typeLabel(lang, item.type)} · {formatWhen(item.createdAt, lang)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">{t(lang, "empty")}</p>
          </div>
        )}
      </section>

      <section className="dashboard-panel" aria-label={t(lang, "statsByDay")}>
        <p className="list-tools-label">{t(lang, "statsByDay")}</p>
        {stats.topDays.length ? (
          <ul className="dashboard-day-list">
            {stats.topDays.map(([day, count]) => (
              <li key={day} className="dashboard-day-row">
                <span>{day}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">—</p>
          </div>
        )}
      </section>
    </div>
  );
}
