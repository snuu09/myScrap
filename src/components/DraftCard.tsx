import { useState } from "react";
import { t, typeLabel, detectedLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { SiteIcon } from "./SiteIcon";
import type { Scrap } from "../lib/types";
import { formatBytes } from "../lib/tagger";

type Props = {
  draft: Scrap;
  uploadRatio?: number | null;
  onChange: (patch: Partial<Scrap>) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function AnalyzeSkeleton({
  filename,
  size,
  uploadRatio,
}: {
  filename?: string;
  size?: number;
  uploadRatio?: number | null;
}) {
  const { lang } = usePrefs();
  const pct =
    uploadRatio != null && Number.isFinite(uploadRatio)
      ? ` · ${Math.min(100, Math.max(0, Math.round(uploadRatio * 100)))}%`
      : "";
  return (
    <div className="classify-draft-skeleton" aria-busy="true">
      <p className="list-tools-label">
        {t(lang, filename ? "uploadingFile" : "analyzing")}
        {pct}
      </p>
      {filename ? (
        <p className="scrap-card-file m-0">
          {filename}
          {size ? ` · ${formatBytes(size)}` : ""}
        </p>
      ) : null}
      <div className="classify-draft-skeleton-bar w-2/5" />
      <div className="classify-draft-skeleton-bar w-4/5" />
      <div className="classify-draft-skeleton-block" />
    </div>
  );
}

function DraftMedia({ src, siteName, domain, favicon, description }: {
  src: string;
  siteName?: string;
  domain?: string;
  favicon?: string;
  description?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="draft-media">
      {siteName || domain || description ? (
        <div className="og-card-body draft-media-meta">
          {siteName || domain ? (
            <p className="og-card-site">
              <SiteIcon domain={domain || ""} favicon={favicon} className="og-card-icon" size={14} />
              {siteName || domain}
            </p>
          ) : null}
          {description ? <p className="og-card-desc">{description}</p> : null}
        </div>
      ) : null}
      <div className="draft-media-frame">
        {!loaded && !failed ? <div className="draft-media-skeleton" aria-hidden /> : null}
        {src && !failed ? (
          <img
            src={src}
            alt=""
            className={"draft-media-img" + (loaded ? " is-loaded" : "")}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        ) : null}
      </div>
    </div>
  );
}

export function DraftCard({ draft, uploadRatio = null, onChange, onSave, onCancel }: Props) {
  const { lang } = usePrefs();
  const og = draft.og;
  const thumb = og?.image || (draft.dataUrl && (draft.type === "image" || draft.mime.startsWith("image/")) ? draft.dataUrl : "");
  const showMedia = Boolean(thumb) || Boolean(og && (og.siteName || og.description));
  const pct =
    uploadRatio != null && Number.isFinite(uploadRatio)
      ? ` · ${Math.min(100, Math.max(0, Math.round(uploadRatio * 100)))}%`
      : "";

  if (draft.analyzing && !thumb) {
    return <AnalyzeSkeleton filename={draft.filename} size={draft.size} uploadRatio={uploadRatio} />;
  }

  return (
    <form
      className="classify-draft-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!draft.analyzing) onSave();
      }}
    >
      <div className="list-tools-head">
        <p className="list-tools-label">
          {draft.analyzing
            ? `${t(lang, draft.filename ? "uploadingFile" : "analyzing")}${pct}`
            : t(lang, "classifyTitle")}
        </p>
      </div>
      {draft.analyzing ? (
        <>
          {draft.filename ? (
            <p className="scrap-card-file m-0">
              {draft.filename} · {formatBytes(draft.size)}
            </p>
          ) : null}
          <div className="classify-draft-skeleton-bar w-2/5" />
          <div className="classify-draft-skeleton-bar w-4/5" />
        </>
      ) : (
        <p className="classify-draft-detected">{detectedLabel(lang, draft.type)}</p>
      )}
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
          disabled={draft.analyzing}
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
        disabled={draft.analyzing}
      />
      <div className="classify-draft-actions">
        <button type="button" className="auth-link-utility" onClick={onCancel}>
          {t(lang, "cancel")}
        </button>
        <button type="submit" className="auth-btn-primary px-4" disabled={draft.analyzing}>
          {t(lang, "save")}
        </button>
      </div>
      {showMedia ? (
        <DraftMedia
          src={thumb}
          siteName={og?.siteName}
          domain={draft.domain}
          favicon={og?.favicon}
          description={og?.description}
        />
      ) : null}
    </form>
  );
}
