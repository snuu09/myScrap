import { Link, useNavigate } from "react-router-dom";
import { typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import { PlanUsageBlock } from "../components/PlanUsageBlock";
import { aggregateStats } from "../lib/scrapFilters";
import { spineColor } from "../lib/typeColor";
import { formatWhen } from "../lib/time";
import type { Scrap } from "../lib/types";

type Props = { scraps: Scrap[]; onScrapsChange: (next: Scrap[]) => void };

function TypeBubbles({
  rows,
  onSelect,
}: {
  rows: { id: string; label: string; count: number; color: string }[];
  onSelect: (id: string) => void;
}) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  const width = 320;
  const height = 220;
  const placed = rows.map((row, i) => {
    const r = 18 + (row.count / max) * 36;
    const angle = (i / Math.max(rows.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const orbit = 28 + (i % 3) * 22;
    return {
      ...row,
      r,
      x: width / 2 + Math.cos(angle) * orbit,
      y: height / 2 + Math.sin(angle) * (orbit * 0.72),
    };
  });

  return (
    <svg className="dashboard-chart" viewBox={`0 0 ${width} ${height}`} role="img">
      {placed.map((row) => (
        <g key={row.id} className="dashboard-bubble" onClick={() => onSelect(row.id)} style={{ cursor: "pointer" }}>
          <circle cx={row.x} cy={row.y} r={row.r} fill={row.color} opacity={0.88} />
          <text x={row.x} y={row.y - 2} textAnchor="middle" className="dashboard-bubble-count">
            {row.count}
          </text>
          <text x={row.x} y={row.y + 12} textAnchor="middle" className="dashboard-bubble-label">
            {row.label.length > 8 ? row.label.slice(0, 7) + "…" : row.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function TagBars({
  rows,
  onSelect,
}: {
  rows: { id: string; label: string; count: number }[];
  onSelect: (id: string) => void;
}) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <ul className="dashboard-tag-bars">
      {rows.map((row) => (
        <li key={row.id}>
          <button type="button" className="dashboard-tag-bar" onClick={() => onSelect(row.id)}>
            <span className="dashboard-tag-bar-label">{row.label}</span>
            <span className="dashboard-tag-bar-track" aria-hidden>
              <span className="dashboard-tag-bar-fill" style={{ width: `${(row.count / max) * 100}%` }} />
            </span>
            <strong>{row.count}</strong>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Dashboard({ scraps }: Props) {
  const { lang } = usePrefs();
  const t = useT();
  const navigate = useNavigate();
  const stats = aggregateStats(scraps);
  const recent = [...scraps].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
  const typeRows = [...stats.byType.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([id, count]) => ({
      id,
      label: typeLabel(lang, id),
      count,
      color: spineColor(id),
    }));
  const tagRows = stats.byTag.slice(0, 10).map(([id, count]) => ({ id, label: id, count }));

  return (
    <div className="dashboard-door">
      <div className="dashboard-head">
        <h1 className="dashboard-title">{t("dashboardTitle")}</h1>
      </div>

      <section className="dashboard-panel" aria-label={t("planLabel")}>
        <p className="list-tools-label">{t("planLabel")}</p>
        <PlanUsageBlock planUpgradeHint={false} />
      </section>

      <section className="dashboard-panel" aria-label={t("statsByType")}>
        <div className="dashboard-panel-head">
          <p className="list-tools-label">{t("statsByType")}</p>
          <Link to="/dashboard/types" className="auth-link-utility no-underline">
            {t("manageTypes")}
          </Link>
        </div>
        {typeRows.length ? (
          <TypeBubbles rows={typeRows} onSelect={(id) => navigate("/search?type=" + encodeURIComponent(id))} />
        ) : (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">—</p>
          </div>
        )}
      </section>

      <section className="dashboard-panel" aria-label={t("statsByTag")}>
        <div className="dashboard-panel-head">
          <p className="list-tools-label">{t("statsByTag")}</p>
          <Link to="/dashboard/tags" className="auth-link-utility no-underline">
            {t("manageTags")}
          </Link>
        </div>
        {tagRows.length ? (
          <TagBars rows={tagRows} onSelect={(id) => navigate("/search?tag=" + encodeURIComponent(id))} />
        ) : (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">—</p>
          </div>
        )}
      </section>

      <section className="dashboard-panel" aria-label={t("statsTimeline")}>
        <p className="list-tools-label">{t("statsTimeline")}</p>
        {recent.length ? (
          <ul className="dashboard-timeline">
            {recent.map((item) => (
              <li key={item.id}>
                <Link to={"/scrap/" + item.id} className="dashboard-timeline-item no-underline">
                  <p className="dashboard-timeline-title">{item.title || t("untitled")}</p>
                  <p className="dashboard-timeline-meta">
                    {typeLabel(lang, item.type)} · {formatWhen(item.createdAt, lang)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">{t("empty")}</p>
          </div>
        )}
      </section>

      <section className="dashboard-panel" aria-label={t("statsByDay")}>
        <p className="list-tools-label">{t("statsByDay")}</p>
        {stats.topDays.length ? (
          <ul className="dashboard-day-list">
            {stats.topDays.map(([day, count]) => (
              <li key={day}>
                <button
                  type="button"
                  className="dashboard-day-row"
                  onClick={() => navigate("/search?day=" + encodeURIComponent(day))}
                >
                  <span>{day}</span>
                  <strong>{count}</strong>
                </button>
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
