import { typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import { DraftCard } from "./DraftCard";
import { coverWash, spineColor } from "../lib/typeColor";
import type { Scrap } from "../lib/types";

type Props = {
  draft: Scrap;
  uploadRatio?: number | null;
  queueLabel?: string;
  saving?: boolean;
  onChange: (patch: Partial<Scrap>) => void;
  onSave: () => void;
  onCancel: () => void;
};

/**
 * Single-draft classify review as a 3-step bench: capture → AI structure → add to shelf.
 * Wraps DraftCard (hidden actions) with a step rail and a CSS 3D book-cover preview.
 */
export function Workbench({ draft, uploadRatio = null, queueLabel = "", saving = false, onChange, onSave, onCancel }: Props) {
  const { lang } = usePrefs();
  const t = useT();
  const step = draft.analyzing ? 2 : 3;
  const title = draft.title || draft.filename || t("untitled");

  return (
    <div className="workbench">
      <div className="workbench-steps" aria-label={t("classifyTitle")}>
        <span className={"workbench-step" + (step >= 1 ? " is-done" : "")}>{t("workbenchStep1")}</span>
        <span className="workbench-step-rule" aria-hidden />
        <span className={"workbench-step" + (step >= 2 ? " is-done" : "") + (step === 2 ? " is-active" : "")}>
          {t("workbenchStep2")}
        </span>
        <span className="workbench-step-rule" aria-hidden />
        <span className={"workbench-step" + (step >= 3 ? " is-done is-active" : "")}>{t("workbenchStep3")}</span>
      </div>
      <div className="workbench-body">
        <div className="workbench-main">
          <DraftCard
            draft={draft}
            uploadRatio={uploadRatio}
            queueLabel={queueLabel}
            hideActions
            saving={saving}
            onChange={onChange}
            onSave={onSave}
            onCancel={onCancel}
          />
        </div>
        <div className="workbench-cover-slot">
          <div
            className={"workbench-cover" + (!draft.analyzing ? " is-shelved" : "")}
            style={{
              ["--spine" as string]: spineColor(draft.type),
              ["--cover" as string]: coverWash(draft.type),
            }}
            aria-hidden
          >
            <span className="workbench-cover-plate">
              <span className="workbench-cover-type">{typeLabel(lang, draft.type)}</span>
              <span className="workbench-cover-title">{title}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="classify-draft-actions">
        <button type="button" className="auth-link-utility" onClick={onCancel} disabled={saving}>
          {t("cancel")}
        </button>
        <button
          type="button"
          className={"protocol-modal-btn-primary classify-save-btn px-4" + (saving ? " is-progress" : "")}
          disabled={draft.analyzing || saving}
          onClick={onSave}
        >
          <span>{t("workbenchShelve")}</span>
        </button>
      </div>
    </div>
  );
}
