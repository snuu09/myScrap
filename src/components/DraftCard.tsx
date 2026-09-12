import { useState, type ReactNode } from "react";
import { Download, ExternalLink, Sparkles } from "lucide-react";
import { t, typeLabel, detectedLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { SiteIcon } from "./SiteIcon";
import { DocPreview } from "./DocPreview";
import type { Scrap } from "../lib/types";
import { formatBytes, isPdf, mediaKindOf } from "../lib/tagger";

type Props = {
  draft: Scrap;
  uploadRatio?: number | null;
  onChange: (patch: Partial<Scrap>) => void;
  onSave: () => void;
  onCancel: () => void;
};

function ClassifyBusyOverlay({
  children,
  onCancel,
}: {
  children?: ReactNode;
  onCancel: () => void;
}) {
  const { lang } = usePrefs();
  return (
    <div className="classify-busy" aria-busy="true" aria-live="polite">
      {children ? <div className="classify-busy-content">{children}</div> : null}
      <div className="classify-busy-dim" aria-hidden />
      <div className="classify-busy-status">
        <Sparkles className="classify-busy-icon size-8" strokeWidth={1.6} aria-hidden />
        <p className="classify-busy-label">{t(lang, "classifyRunningBusy")}</p>
      </div>
      <button type="button" className="auth-link-utility classify-busy-cancel" onClick={onCancel}>
        {t(lang, "cancel")}
      </button>
    </div>
  );
}

export function AnalyzeSkeleton({
  filename,
  size,
  uploadRatio,
  onCancel,
  preview,
}: {
  filename?: string;
  size?: number;
  uploadRatio?: number | null;
  onCancel: () => void;
  preview?: ReactNode;
}) {
  const { lang } = usePrefs();
  const ratio =
    uploadRatio != null && Number.isFinite(uploadRatio)
      ? Math.min(100, Math.max(0, Math.round(uploadRatio * 100)))
      : null;
  const uploadLabel = `${t(lang, "uploadingFile")} · ${ratio ?? 0}%`;
  return (
    <div className="classify-draft-skeleton">
      {filename ? (
        <p className="scrap-card-file m-0">
          {filename}
          {size ? ` · ${formatBytes(size)}` : ""}
        </p>
      ) : null}
      {ratio != null ? (
        <div
          className="upload-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={ratio}
          aria-valuetext={uploadLabel}
        >
          <div className="upload-progress-track">
            <div className="upload-progress-fill" style={{ width: `${ratio}%` }} />
            <span className="upload-progress-label">{uploadLabel}</span>
          </div>
        </div>
      ) : null}
      {preview ? <div className="classify-draft-preview">{preview}</div> : null}
      <ClassifyBusyOverlay onCancel={onCancel}>
        {ratio == null && !preview ? (
          <>
            <div className="classify-draft-skeleton-bar w-2/5" />
            <div className="classify-draft-skeleton-bar w-4/5" />
            <div className="classify-draft-skeleton-block" />
          </>
        ) : null}
      </ClassifyBusyOverlay>
    </div>
  );
}

function DraftMedia({
  src,
  kind = "image",
  siteName,
  domain,
  favicon,
  description,
}: {
  src: string;
  kind?: "image" | "video" | "audio";
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
      {src && !failed ? (
        <div className={"draft-media-frame" + (kind === "audio" ? " draft-media-frame--audio" : "")}>
          {!loaded ? <div className="draft-media-skeleton" aria-hidden /> : null}
          {kind === "video" ? (
            <video
              src={src}
              className={"draft-media-img" + (loaded ? " is-loaded" : "")}
              controls
              playsInline
              preload="metadata"
              onLoadedData={() => setLoaded(true)}
              onError={() => setFailed(true)}
            />
          ) : kind === "audio" ? (
            <audio
              src={src}
              className={"draft-media-audio" + (loaded ? " is-loaded" : "")}
              controls
              preload="metadata"
              onLoadedData={() => setLoaded(true)}
              onError={() => setFailed(true)}
            />
          ) : (
            <img
              src={src}
              alt=""
              className={"draft-media-img" + (loaded ? " is-loaded" : "")}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

export function DraftCard({ draft, uploadRatio = null, onChange, onSave, onCancel }: Props) {
  const { lang } = usePrefs();
  const og = draft.og;
  const mediaKind = mediaKindOf(draft.type, draft.mime);
  const visual = mediaKind === "image" || mediaKind === "video";
  const thumb =
    (visual ? draft.posterUrl || draft.dataUrl : "") ||
    og?.image ||
    (draft.dataUrl && (mediaKind === "image" || mediaKind === "video" || mediaKind === "audio")
      ? draft.dataUrl
      : "") ||
    "";
  const showMedia = Boolean(thumb) || Boolean(og && (og.siteName || og.description));
  /** Canvas/PDF covers for non-visual files; images & video use DraftMedia. */
  const showDocCover = Boolean(draft.posterUrl) && !visual;
  const ratio =
    uploadRatio != null && Number.isFinite(uploadRatio)
      ? Math.min(100, Math.max(0, Math.round(uploadRatio * 100)))
      : null;
  const uploadLabel = ratio != null ? `${t(lang, "uploadingFile")} · ${ratio}%` : "";

  const previewBlock =
    showMedia || showDocCover || draft.url ? (
      <>
        {draft.url ? (
          <div className="inline-action-row">
            <a href={draft.url} className="scrap-card-link min-w-0 flex-1 truncate" target="_blank" rel="noreferrer">
              {draft.url}
            </a>
            <a href={draft.url} className="inline-action" target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" strokeWidth={1.8} />
              {t(lang, "openLink")}
            </a>
          </div>
        ) : null}
        {showDocCover ? (
          <DocPreview
            src={draft.posterUrl}
            pages={draft.posterUrls}
            filename={draft.filename}
            limitedNote={!isPdf(draft.mime, draft.filename) && draft.type === "document" ? t(lang, "previewPagesLimited") : ""}
          />
        ) : null}
        {!showDocCover && showMedia ? (
          <DraftMedia
            src={thumb || draft.posterUrl || ""}
            kind={og?.image || draft.posterUrl ? "image" : mediaKind || "image"}
            siteName={og?.siteName}
            domain={draft.domain}
            favicon={og?.favicon}
            description={og?.description}
          />
        ) : null}
        {showDocCover && og && (og.siteName || og.description) ? (
          <DraftMedia
            src=""
            siteName={og.siteName}
            domain={draft.domain}
            favicon={og.favicon}
            description={og.description}
          />
        ) : null}
      </>
    ) : null;

  if (draft.analyzing && !showMedia && !showDocCover) {
    return (
      <AnalyzeSkeleton
        filename={draft.filename}
        size={draft.size}
        uploadRatio={uploadRatio}
        onCancel={onCancel}
        preview={
          draft.url ? (
            <a href={draft.url} className="scrap-card-link" target="_blank" rel="noreferrer">
              {draft.url}
            </a>
          ) : null
        }
      />
    );
  }

  const resultBlock = (
    <>
      {previewBlock}
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
          <span key={tag} className="scrap-tag detail-tag-chip">
            {tag === draft.type ? typeLabel(lang, tag) : tag}
          </span>
        ))}
      </p>
      {draft.filename ? (
        <div className="inline-action-row">
          <p className="scrap-card-file min-w-0 flex-1">
            <span className="truncate">
              {draft.filename}
              {draft.size ? ` · ${formatBytes(draft.size)}` : ""}
            </span>
          </p>
          {draft.dataUrl ? (
            <a href={draft.dataUrl} className="inline-action" download={draft.filename || undefined}>
              <Download className="size-4" strokeWidth={1.8} />
              {t(lang, "downloadFile")}
            </a>
          ) : null}
        </div>
      ) : null}
      {!draft.analyzing && draft.text ? (
        <div className="draft-ai-block">
          <p className="list-tools-label">{t(lang, "aiSummary")}</p>
          <p className="draft-ai-text">{draft.text}</p>
        </div>
      ) : null}
      {!draft.analyzing && draft.previewText ? (
        <div className="draft-ai-block">
          <p className="list-tools-label">{t(lang, "aiAnalysis")}</p>
          <p className="draft-ai-text">{draft.previewText}</p>
        </div>
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
    </>
  );

  return (
    <form
      className="classify-draft-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!draft.analyzing) onSave();
      }}
    >
      {!draft.analyzing ? (
        <div className="list-tools-head">
          <p className="list-tools-label">{t(lang, "classifyDone")}</p>
        </div>
      ) : null}
      {draft.analyzing ? (
        <>
          {draft.filename ? (
            <p className="scrap-card-file m-0">
              {draft.filename} · {formatBytes(draft.size)}
            </p>
          ) : null}
          {ratio != null ? (
            <div
              className="upload-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={ratio}
              aria-valuetext={uploadLabel}
            >
              <div className="upload-progress-track">
                <div className="upload-progress-fill" style={{ width: `${ratio}%` }} />
                <span className="upload-progress-label">{uploadLabel}</span>
              </div>
            </div>
          ) : null}
          {previewBlock ? <div className="classify-draft-preview">{previewBlock}</div> : null}
          <ClassifyBusyOverlay onCancel={onCancel} />
        </>
      ) : (
        <>
          <p className="classify-draft-detected">{detectedLabel(lang, draft.type)}</p>
          {draft.classifyFallback ? <p className="classify-draft-fallback">{t(lang, "classifyFallback")}</p> : null}
          {resultBlock}
        </>
      )}
    </form>
  );
}
