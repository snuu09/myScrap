import { BookmarkPlus, RefreshCw } from "lucide-react";
import { typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import { formatBytes } from "../lib/tagger";
import { coverWash, spineColor } from "../lib/typeColor";
import type { Scrap } from "../lib/types";
import { DraftCard } from "./DraftCard";

type Props = {
  draft: Scrap;
  uploadRatio?: number | null;
  queueLabel?: string;
  saving?: boolean;
  onChange: (patch: Partial<Scrap>) => void;
  onSave: () => void;
  onCancel: () => void;
  onReanalyze: () => void;
};

/**
 * Single-draft classify review: Soft Deckle 2-col workbench.
 * Left = DraftCard fields; right = hardcover preview + shelve CTA.
 */
export function Workbench({
  draft,
  uploadRatio = null,
  queueLabel = "",
  saving = false,
  onChange,
  onSave,
  onCancel,
  onReanalyze,
}: Props) {
  const { lang } = usePrefs();
  const t = useT();
  const step = draft.analyzing ? 2 : 3;
  const title = draft.title || draft.filename || t("untitled");
  const typeName = typeLabel(lang, draft.type);
  const fileMeta = draft.filename
    ? draft.size
      ? `${draft.filename} · ${formatBytes(draft.size)}`
      : draft.filename
    : "";

  return (
    <div className="workbench">
      <section className="workbench-progress" aria-label={t("classifyTitle")}>
        <div className="workbench-progress-head">
          <p className="workbench-progress-status">
            <span className="workbench-progress-step-label font-mono">
              {step === 2 ? "STEP 02" : "STEP 03"}
            </span>
            <span>{step === 2 ? t("workbenchStep2") : t("workbenchStep3")}</span>
          </p>
        </div>
        <div className="workbench-progress-track">
          <div className="workbench-progress-cell">
            <div className={"workbench-progress-bar" + (step >= 1 ? " is-full" : "")} />
            <p className={"workbench-progress-caption" + (step >= 1 ? " is-on" : "")}>
              {t("workbenchStep1")}
            </p>
          </div>
          <div className="workbench-progress-cell">
            <div
              className={
                "workbench-progress-bar" +
                (step > 2 ? " is-full" : "") +
                (step === 2 ? " is-active" : "")
              }
            />
            <p className={"workbench-progress-caption" + (step >= 2 ? " is-on" : "")}>
              {t("workbenchStep2")}
            </p>
          </div>
          <div className="workbench-progress-cell">
            <div className={"workbench-progress-bar" + (step >= 3 && !draft.analyzing ? " is-full" : "")} />
            <p className={"workbench-progress-caption" + (step >= 3 && !draft.analyzing ? " is-on" : "")}>
              {t("workbenchStep3")}
            </p>
          </div>
        </div>
      </section>

      <div className="workbench-type-chip" aria-hidden={!typeName}>
        <span className="workbench-type-chip-label font-mono">{t("workbenchFormat")}</span>
        <span className="workbench-type-chip-value">{typeName}</span>
      </div>

      <div className="workbench-body">
        <div className="workbench-main">
          <DraftCard
            draft={draft}
            uploadRatio={uploadRatio}
            queueLabel={queueLabel}
            hideActions
            quietBusy
            saving={saving}
            onChange={onChange}
            onSave={onSave}
            onCancel={onCancel}
          />
        </div>

        <aside className="workbench-cover-slot">
          <div className="workbench-folio">
            <div className="workbench-folio-head font-mono">
              <span>{t("workbenchCoverLabel")}</span>
              <span className="workbench-folio-bind">{t("workbenchHardcover")}</span>
            </div>

            <div
              className={"workbench-cover" + (!draft.analyzing ? " is-shelved" : "")}
              style={{
                ["--spine" as string]: spineColor(draft.type),
                ["--cover" as string]: coverWash(draft.type),
              }}
              aria-hidden
            >
              <span className="workbench-cover-plate">
                <span className="workbench-cover-type">{typeName}</span>
                <span className="workbench-cover-title">{title}</span>
              </span>
            </div>

            {(typeName || fileMeta) && (
              <div className="workbench-folio-meta">
                {typeName ? (
                  <div className="workbench-folio-meta-cell">
                    <span className="workbench-folio-meta-label">{t("classifyCategory")}</span>
                    <span className="workbench-folio-meta-value">{typeName}</span>
                  </div>
                ) : null}
                {fileMeta ? (
                  <div className="workbench-folio-meta-cell">
                    <span className="workbench-folio-meta-label">{t("workbenchSource")}</span>
                    <span className="workbench-folio-meta-value">{fileMeta}</span>
                  </div>
                ) : null}
              </div>
            )}

            <div className="workbench-folio-actions">
              <button
                type="button"
                className={"workbench-shelve-btn" + (saving ? " is-progress" : "")}
                disabled={draft.analyzing || saving}
                onClick={onSave}
              >
                <BookmarkPlus className="size-5" strokeWidth={1.8} aria-hidden />
                <span>{t("workbenchShelve")}</span>
              </button>
              <div className="workbench-folio-secondary">
                <button
                  type="button"
                  className="workbench-secondary-btn"
                  onClick={onReanalyze}
                  disabled={draft.analyzing || saving}
                >
                  <RefreshCw className="size-4" strokeWidth={1.8} aria-hidden />
                  <span>{t("workbenchReanalyze")}</span>
                </button>
                <button type="button" className="workbench-secondary-btn" onClick={onCancel} disabled={saving}>
                  {t("cancel")}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
