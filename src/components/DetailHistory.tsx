import { useState } from "react";
import { typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import { formatWhen } from "../lib/time";
import type { Scrap, ScrapRevision } from "../lib/types";

type Props = {
  item: Scrap;
  busy?: boolean;
  onRevert: (revision: ScrapRevision) => void;
  onDelete: (revision: ScrapRevision) => void;
};

function Field({ label, then, now }: { label: string; then: string; now: string }) {
  if (then === now) return null;
  return (
    <div className="detail-history-field">
      <p className="detail-history-field-label">{label}</p>
      <p className="detail-history-then">{then || "·"}</p>
      <p className="detail-history-now">{now || "·"}</p>
    </div>
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
                <p className="detail-history-compare-legend">
                  <span>{t("historyThen")}</span>
                  <span>{t("historyNow")}</span>
                </p>
                <Field label={t("untitled")} then={revision.title} now={item.title} />
                <Field label={t("statsByType")} then={typeLabel(lang, revision.type)} now={typeLabel(lang, item.type)} />
                <Field label={t("historyTags")} then={revision.tags.join(", ")} now={item.tags.join(", ")} />
                <Field label={t("historyMemo")} then={revision.memo} now={item.memo} />
                <Field label={t("historyBody")} then={revision.text} now={item.text} />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
