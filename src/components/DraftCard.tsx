import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Download, ExternalLink, X } from "lucide-react";
import { t, typeLabel, detectedLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { SiteIcon } from "./SiteIcon";
import { DocPreview } from "./DocPreview";
import { isImeComposing } from "../lib/ime";
import { urlCaution } from "../lib/urlRisk";
import { AiProgress } from "./AiProgress";
import { GlassCluster, TagCluster } from "./GlassCluster";
import type { Scrap, ScrapType } from "../lib/types";
import { formatBytes, isPdf, mediaKindOf } from "../lib/tagger";

const CATEGORIES: ScrapType[] = ["text", "image", "video", "audio", "link", "document"];

type Props = {
  draft: Scrap;
  uploadRatio?: number | null;
  queueLabel?: string;
  onChange: (patch: Partial<Scrap>) => void;
  onSave: () => void;
  onCancel: () => void;
  /** Hide Cancel/Save when a parent owns the batch footer. */
  hideActions?: boolean;
  saving?: boolean;
  /** 0–1 while a multi-save runs; draws a ring on Save. */
  saveRatio?: number | null;
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
        <AiProgress />
        <p className="classify-busy-label classify-busy-label--shimmer">{t(lang, "classifyRunningBusy")}</p>
        <button type="button" className="classify-busy-cancel" onClick={onCancel} aria-label={t(lang, "cancel")}>
          <X className="size-5" strokeWidth={1.8} />
          <span className="sr-only">{t(lang, "cancel")}</span>
        </button>
      </div>
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

export function DraftCard({
  draft,
  uploadRatio = null,
  queueLabel = "",
  onChange,
  onSave,
  onCancel,
  hideActions = false,
  saving = false,
  saveRatio = null,
}: Props) {
  const { lang } = usePrefs();
  const [tagDraft, setTagDraft] = useState("");
  const [typeOpen, setTypeOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!typeOpen) return;
    function onDoc(event: MouseEvent) {
      if (!typeRef.current?.contains(event.target as Node)) setTypeOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setTypeOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [typeOpen]);

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
  const caution = !draft.analyzing && draft.url ? urlCaution(draft.url) : "";
  const categories = draft.type === "unknown" ? ([...CATEGORIES, "unknown"] as ScrapType[]) : CATEGORIES;

  function commitTag(raw = tagDraft) {
    const next = raw
      .split(/[,，]/)
      .map((part) => part.trim())
      .filter(Boolean);
    setTagDraft("");
    if (!next.length) return;
    const merged = [...draft.tags];
    for (const tag of next) {
      if (!merged.includes(tag)) merged.push(tag);
    }
    onChange({ tags: merged });
  }

  const previewBlock =
    showMedia || showDocCover || draft.url ? (
      <>
        {draft.url ? (
          <div className="inline-action-row">
            <a href={draft.url} className="scrap-card-link scrap-card-link--full min-w-0 flex-1" target="_blank" rel="noreferrer">
              {draft.url}
            </a>
            <GlassCluster className="liquid-hit">
              <a
                href={draft.url}
                className="inline-action"
                target="_blank"
                rel="noreferrer"
                aria-label={t(lang, "openLink")}
              >
                <ExternalLink className="size-4" strokeWidth={1.8} />
              </a>
            </GlassCluster>
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
      <div className="grid gap-1" ref={typeRef}>
        <span className="list-tools-label">{t(lang, "classifyCategory")}</span>
        <button
          type="button"
          className="classify-type-trigger"
          disabled={draft.analyzing || saving}
          aria-expanded={typeOpen}
          aria-haspopup="listbox"
          onClick={() => setTypeOpen((open) => !open)}
        >
          <span>{typeLabel(lang, draft.type)}</span>
          <ChevronDown className={"size-4" + (typeOpen ? " is-open" : "")} strokeWidth={1.8} />
        </button>
        {typeOpen ? (
          <ul className="classify-type-menu" role="listbox">
            {categories.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={draft.type === id}
                  className="classify-type-option"
                  onClick={() => {
                    onChange({ type: id });
                    setTypeOpen(false);
                  }}
                >
                  {typeLabel(lang, id)}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="grid gap-1">
        <span className="list-tools-label">{t(lang, "addTag")}</span>
        <div className="scrap-card-tags">
          {draft.tags.length ? <TagCluster>
          {draft.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="scrap-tag scrap-tag--btn detail-tag-chip"
              disabled={draft.analyzing}
              onClick={() => onChange({ tags: draft.tags.filter((row) => row !== tag) })}
            >
              {tag}
              <X className="ml-1 inline size-3" strokeWidth={2} />
            </button>
          ))}
          </TagCluster> : null}
        </div>
        <input
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          onKeyDown={(e) => {
            if (isImeComposing(e)) return;
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commitTag();
            }
          }}
          onBlur={() => commitTag()}
          placeholder={t(lang, "addTag")}
          className="list-tools-search"
          aria-label={t(lang, "addTag")}
          disabled={draft.analyzing}
        />
      </div>
      {draft.filename ? (
        <div className="inline-action-row">
          <p className="scrap-card-file min-w-0 flex-1">
            <span className="scrap-source-full">
              {draft.filename}
              {draft.size ? ` · ${formatBytes(draft.size)}` : ""}
            </span>
          </p>
          {draft.dataUrl ? (
            <GlassCluster className="liquid-hit">
              <a
                href={draft.dataUrl}
                className="inline-action"
                download={draft.filename || undefined}
                aria-label={t(lang, "downloadFile")}
              >
                <Download className="size-4" strokeWidth={1.8} />
              </a>
            </GlassCluster>
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
      {hideActions ? null : (
        <div className="classify-draft-actions">
          <button type="button" className="auth-link-utility" onClick={onCancel} disabled={saving}>
            {t(lang, "cancel")}
          </button>
          <button
            type="submit"
            className={"auth-btn-primary classify-save-btn px-4" + (saving ? " is-saving" : "")}
            disabled={draft.analyzing || saving}
          >
            {saving && saveRatio != null ? (
              <span className="classify-save-ring" aria-hidden>
                <svg viewBox="0 0 36 36">
                  <circle className="classify-save-ring-track" cx="18" cy="18" r="15" fill="none" />
                  <circle
                    className="classify-save-ring-fill"
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    style={{ strokeDashoffset: `${94.2 * (1 - Math.min(1, Math.max(0, saveRatio)))}` }}
                  />
                </svg>
              </span>
            ) : null}
            <span>{t(lang, "save")}</span>
          </button>
        </div>
      )}
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
      {hideActions ? null : queueLabel || !draft.analyzing ? (
        <div className="list-tools-head">
          {!draft.analyzing ? <p className="list-tools-label">{t(lang, "classifyDone")}</p> : <span />}
          {queueLabel ? <p className="list-tools-label">{queueLabel}</p> : null}
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
          {draft.classifyMiss === "missing" ? (
            <p className="classify-draft-fallback">{t(lang, "classifyServerMissing")}</p>
          ) : null}
          {draft.classifyMiss === "auth" ? (
            <p className="classify-draft-fallback">{t(lang, "classifyAuthMissed")}</p>
          ) : null}
          {draft.classifyFallback ? <p className="classify-draft-fallback">{t(lang, "classifyFallback")}</p> : null}
          {draft.ogStatus === "error" && draft.url ? (
            <p className="classify-draft-fallback">{t(lang, "ogPreviewMissed")}</p>
          ) : null}
          {caution === "http" ? <p className="classify-draft-fallback">{t(lang, "urlCautionHttp")}</p> : null}
          {caution === "punycode" ? <p className="classify-draft-fallback">{t(lang, "urlCautionPuny")}</p> : null}
          {caution === "login" ? <p className="classify-draft-fallback">{t(lang, "urlCautionLogin")}</p> : null}
          {resultBlock}
        </>
      )}
    </form>
  );
}
