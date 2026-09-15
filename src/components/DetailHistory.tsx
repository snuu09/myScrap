import { useState, type ReactNode } from "react";
import { typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import { formatWhen } from "../lib/time";
import { renderAiHighlight, stripAiMarks } from "../lib/aiHighlight";
import { TagCluster } from "./GlassCluster";
import type { Scrap, ScrapRevision } from "../lib/types";

type Props = {
  item: Scrap;
  busy?: boolean;
  onRevert: (revision: ScrapRevision) => void;
  onDelete: (revision: ScrapRevision) => void;
};

/** Highlight tokens present on `side` that are missing from the other side. */
function DiffText({ before, after, side }: { before: string; after: string; side: "before" | "after" }) {
  const left = stripAiMarks(before || "").trim();
  const right = stripAiMarks(after || "").trim();
  const source = side === "before" ? left : right;
  const other = side === "before" ? right : left;
  const raw = side === "before" ? before : after;
  if (!source) return <span className="detail-history-empty">·</span>;
  if (source === other) return <>{renderAiHighlight(raw || source)}</>;

  const otherSet = new Set(other.split(/\s+/).filter(Boolean));
  const nodes: ReactNode[] = [];
  source.split(/(\s+)/).forEach((token, i) => {
    if (!token) return;
    if (/^\s+$/.test(token)) {
      nodes.push(token);
      return;
    }
    const changed = !otherSet.has(token);
    nodes.push(
      changed ? (
        <mark key={`${side}-${i}`} className={"detail-diff-mark detail-diff-mark--" + side}>
          {token}
        </mark>
      ) : (
        <span key={`${side}-${i}`}>{token}</span>
      ),
    );
  });
  return <>{nodes}</>;
}

function SnapshotCard({
  label,
  when,
  title,
  type,
  tags,
  memo,
  text,
  previewText,
  otherTitle,
  otherType,
  otherTags,
  otherMemo,
  otherText,
  otherPreview,
  side,
}: {
  label: string;
  when?: string;
  title: string;
  type: string;
  tags: string[];
  memo: string;
  text: string;
  previewText: string;
  otherTitle: string;
  otherType: string;
  otherTags: string[];
  otherMemo: string;
  otherText: string;
  otherPreview: string;
  side: "before" | "after";
}) {
  const t = useT();
  const { lang } = usePrefs();
  const otherTagSet = new Set(otherTags);
  return (
    <article className={"detail-history-snap detail-history-snap--" + side}>
      <header className="detail-history-snap-head">
        <p className="detail-section-title">{label}</p>
        {when ? <p className="detail-history-snap-when">{when}</p> : null}
      </header>
      <h3 className="dashboard-title m-0">
        <DiffText before={side === "before" ? title : otherTitle} after={side === "before" ? otherTitle : title} side={side} />
      </h3>
      <p className="m-0 text-[0.75rem] text-muted">
        <span className={type !== otherType ? "detail-diff-inline detail-diff-inline--" + side : undefined}>
          {typeLabel(lang, type)}
        </span>
      </p>
      {text || otherText ? (
        <div className="detail-ai-block">
          <p className="detail-section-title">{t("aiSummary")}</p>
          <p className="detail-ai-text">
            <DiffText before={side === "before" ? text : otherText} after={side === "before" ? otherText : text} side={side} />
          </p>
        </div>
      ) : null}
      {previewText || otherPreview ? (
        <div className="detail-ai-block">
          <p className="detail-section-title">{t("aiAnalysis")}</p>
          <p className="detail-ai-text">
            <DiffText
              before={side === "before" ? previewText : otherPreview}
              after={side === "before" ? otherPreview : previewText}
              side={side}
            />
          </p>
        </div>
      ) : null}
      {memo || otherMemo ? (
        <div className="detail-ai-block">
          <p className="detail-section-title">{t("historyMemo")}</p>
          <p className="detail-ai-text">
            <DiffText before={side === "before" ? memo : otherMemo} after={side === "before" ? otherMemo : memo} side={side} />
          </p>
        </div>
      ) : null}
      {tags.length ? (
        <p className="scrap-card-tags">
          <TagCluster>
            {tags.map((tag) => (
              <span key={tag} className={"scrap-tag" + (otherTagSet.has(tag) ? "" : " scrap-tag--diff")}>
                {tag}
              </span>
            ))}
          </TagCluster>
        </p>
      ) : null}
    </article>
  );
}

export function DetailHistory({ item, busy, onRevert, onDelete }: Props) {
  const { lang } = usePrefs();
  const t = useT();
  const [compareId, setCompareId] = useState("");
  const revisions = item.revisions || [];
  if (!revisions.length) return null;
  const compared = revisions.find((row) => row.id === compareId) || null;

  return (
    <section className="dashboard-panel detail-history" aria-label={t("historyTitle")}>
      <p className="detail-section-title">{t("historyTitle")}</p>
      <ul className="detail-history-list">
        {revisions.map((revision) => (
          <li key={revision.id} className="detail-history-row">
            <div className="detail-history-meta">
              <strong>{t(revision.kind === "ai" ? "historyAi" : "historyEdit")}</strong>
              <span>{formatWhen(revision.at, lang)}</span>
            </div>
            <div className="detail-history-actions">
              <button type="button" disabled={busy} onClick={() => setCompareId((id) => (id === revision.id ? "" : revision.id))}>
                {t("historyCompare")}
              </button>
              <button type="button" disabled={busy} onClick={() => onRevert(revision)}>
                {t("historyRevert")}
              </button>
              <button type="button" disabled={busy} onClick={() => onDelete(revision)}>
                {t("historyDelete")}
              </button>
            </div>
            {compared?.id === revision.id ? (
              <div className="detail-history-compare">
                <SnapshotCard
                  label={t("historyThen")}
                  when={formatWhen(revision.at, lang)}
                  title={revision.title}
                  type={revision.type}
                  tags={revision.tags}
                  memo={revision.memo}
                  text={revision.text}
                  previewText={revision.previewText || ""}
                  otherTitle={item.title}
                  otherType={item.type}
                  otherTags={item.tags}
                  otherMemo={item.memo}
                  otherText={item.text}
                  otherPreview={item.previewText}
                  side="before"
                />
                <SnapshotCard
                  label={t("historyNow")}
                  title={item.title}
                  type={item.type}
                  tags={item.tags}
                  memo={item.memo}
                  text={item.text}
                  previewText={item.previewText}
                  otherTitle={revision.title}
                  otherType={revision.type}
                  otherTags={revision.tags}
                  otherMemo={revision.memo}
                  otherText={revision.text}
                  otherPreview={revision.previewText || ""}
                  side="after"
                />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
