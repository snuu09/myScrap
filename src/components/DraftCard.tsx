import { t, typeLabel, detectedLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { SiteIcon } from "./SiteIcon";
import type { Scrap } from "../lib/types";
import { formatBytes } from "../lib/tagger";

type Props = {
  draft: Scrap;
  onChange: (patch: Partial<Scrap>) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function AnalyzeSkeleton() {
  const { lang } = usePrefs();
  return (
    <div className="classify-draft-skeleton" aria-busy="true">
      <p className="list-tools-label">{t(lang, "analyzing")}</p>
      <div className="classify-draft-skeleton-bar w-2/5" />
      <div className="classify-draft-skeleton-bar w-4/5" />
      <div className="classify-draft-skeleton-block" />
    </div>
  );
}

export function DraftCard({ draft, onChange, onSave, onCancel }: Props) {
  const { lang } = usePrefs();
  if (draft.analyzing) return <AnalyzeSkeleton />;

  const og = draft.og;
  const thumb = og?.image || (draft.dataUrl && draft.type === "image" ? draft.dataUrl : "");

  return (
    <form
      className="classify-draft-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="list-tools-head">
        <p className="list-tools-label">{t(lang, "classifyTitle")}</p>
      </div>
      <p className="classify-draft-detected">{detectedLabel(lang, draft.type)}</p>
      {og && (og.image || og.siteName || og.description) ? (
        <div className="og-card">
          {thumb ? (
            <img
              src={thumb}
              alt=""
              className="og-card-media"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : null}
          <div className="og-card-body">
            {og.siteName || draft.domain ? (
              <p className="og-card-site">
                <SiteIcon domain={draft.domain} favicon={og.favicon} className="og-card-icon" size={14} />
                {og.siteName || draft.domain}
              </p>
            ) : null}
            {og.description ? <p className="og-card-desc">{og.description}</p> : null}
          </div>
        </div>
      ) : thumb && draft.type === "image" ? (
        <img src={thumb} alt="" className="max-h-48 rounded-[14px] object-cover" />
      ) : null}
      {draft.url ? (
        <a href={draft.url} className="scrap-card-link" target="_blank" rel="noreferrer">
          {draft.url}
        </a>
      ) : null}
      <label className="grid gap-1">
        <span className="list-tools-label">{t(lang, "untitled")}</span>
        <input
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="list-tools-search"
        />
      </label>
      <p className="scrap-card-tags">
        {(draft.tags.length ? draft.tags : [draft.type]).map((tag) => (
          <span key={tag} className="scrap-tag">
            {tag === draft.type ? typeLabel(lang, tag) : tag}
          </span>
        ))}
      </p>
      {draft.filename ? (
        <p className="scrap-card-file">
          {draft.filename} · {formatBytes(draft.size)}
        </p>
      ) : null}
      <textarea
        value={draft.memo}
        onChange={(e) => onChange({ memo: e.target.value })}
        placeholder={t(lang, "memoPlaceholder")}
        rows={2}
        className="classify-draft-memo"
      />
      <div className="classify-draft-actions">
        <button type="button" className="auth-link-utility" onClick={onCancel}>
          {t(lang, "cancel")}
        </button>
        <button type="submit" className="auth-btn-primary px-4">
          {t(lang, "save")}
        </button>
      </div>
    </form>
  );
}
