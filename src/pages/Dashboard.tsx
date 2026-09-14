import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, X } from "lucide-react";
import { typeLabel } from "../i18n";
import { useAuth } from "../context/Auth";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import { PlanUsageBlock } from "../components/PlanUsageBlock";
import { IconTip } from "../components/IconTip";
import { aggregateStats } from "../lib/scrapFilters";
import { saveScrap } from "../lib/scraps";
import { useDialog } from "../lib/dialog";
import { formatWhen } from "../lib/time";
import type { Scrap, ScrapType } from "../lib/types";

type Props = { scraps: Scrap[]; onScrapsChange: (next: Scrap[]) => void };

function replaceTag(tags: string[], from: string, to: string) {
  const next: string[] = [];
  for (const tag of tags) {
    const value = tag === from ? to : tag;
    if (!value || next.includes(value)) continue;
    next.push(value);
  }
  return next;
}

export function Dashboard({ scraps, onScrapsChange }: Props) {
  const { lang } = usePrefs();
  const t = useT();
  const { user } = useAuth();
  const { alert, confirm } = useDialog();
  const navigate = useNavigate();
  const stats = aggregateStats(scraps);
  const recent = [...scraps].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
  const typeEntries = [...stats.byType.entries()];
  const [editingTag, setEditingTag] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function persistTag(from: string, to: string) {
    if (!user || busy) return;
    const changed = scraps.filter((item) => item.tags.includes(from));
    if (!changed.length) return;
    setBusy(true);
    const next = scraps.map((item) =>
      item.tags.includes(from) ? { ...item, tags: replaceTag(item.tags, from, to) } : item,
    );
    try {
      for (const item of next) {
        const prev = scraps.find((scrap) => scrap.id === item.id);
        if (!prev || prev.tags.join("\0") === item.tags.join("\0")) continue;
        await saveScrap(user, item);
      }
      onScrapsChange(next);
      setEditingTag("");
      setTagDraft("");
    } catch {
      await alert(t("syncError"));
    } finally {
      setBusy(false);
    }
  }

  async function removeTag(tag: string) {
    const ok = await confirm({ body: t("tagDeleteConfirm"), danger: true, confirmLabel: t("deleteTag") });
    if (!ok) return;
    await persistTag(tag, "");
  }

  function commitRename() {
    const next = tagDraft.trim();
    if (!editingTag || !next || next === editingTag) {
      setEditingTag("");
      setTagDraft("");
      return;
    }
    void persistTag(editingTag, next);
  }

  return (
    <div className="dashboard-door">
      <div className="dashboard-head">
        <h1 className="dashboard-title">{t("dashboardTitle")}</h1>
      </div>

      <section className="dashboard-panel" aria-label={t("planLabel")}>
        <p className="list-tools-label">{t("planLabel")}</p>
        <PlanUsageBlock />
      </section>

      <section className="dashboard-panel" aria-label={t("statsByType")}>
        <p className="list-tools-label">{t("statsByType")}</p>
        {typeEntries.length ? (
          <div className="dashboard-chips">
            {typeEntries.map(([type, count]) => (
              <button
                key={type}
                type="button"
                className="dashboard-chip"
                onClick={() => navigate("/search?type=" + encodeURIComponent(type))}
              >
                {typeLabel(lang, type as ScrapType)} {count}
              </button>
            ))}
          </div>
        ) : (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">—</p>
          </div>
        )}
      </section>

      <section className="dashboard-panel" aria-label={t("statsByTag")}>
        <p className="list-tools-label">{t("statsByTag")}</p>
        {stats.byTag.length ? (
          <div className="dashboard-chips">
            {stats.byTag.map(([tag, count]) =>
              editingTag === tag ? (
                <form
                  key={tag}
                  className="dashboard-tag-edit"
                  onSubmit={(e) => {
                    e.preventDefault();
                    commitRename();
                  }}
                >
                  <input
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    className="dashboard-tag-input"
                    aria-label={t("renameTag")}
                    disabled={busy}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setEditingTag("");
                        setTagDraft("");
                      }
                    }}
                  />
                </form>
              ) : (
                <span key={tag} className="dashboard-tag-manage">
                  <button
                    type="button"
                    className="dashboard-chip"
                    onClick={() => navigate("/search?tag=" + encodeURIComponent(tag))}
                  >
                    {tag} {count}
                  </button>
                  <IconTip label={t("renameTag")}>
                    <button
                      type="button"
                      className="dashboard-tag-action"
                      aria-label={t("renameTag")}
                      disabled={busy}
                      onClick={() => {
                        setEditingTag(tag);
                        setTagDraft(tag);
                      }}
                    >
                      <Pencil className="size-3.5" strokeWidth={1.8} />
                    </button>
                  </IconTip>
                  <IconTip label={t("deleteTag")}>
                    <button
                      type="button"
                      className="dashboard-tag-action"
                      aria-label={t("deleteTag")}
                      disabled={busy}
                      onClick={() => void removeTag(tag)}
                    >
                      <X className="size-3.5" strokeWidth={1.8} />
                    </button>
                  </IconTip>
                </span>
              ),
            )}
          </div>
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
