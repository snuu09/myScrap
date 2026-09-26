import { useEffect, useState, type ReactNode, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  AudioLines,
  BookOpen,
  Bookmark,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  Play,
  RectangleHorizontal,
} from "lucide-react";
import { spineLabel } from "../i18n";
import { usePrefs, type ShelfLayout } from "../context/Prefs";
import { useT } from "../lib/useT";
import { AdSlot } from "./AdSlot";
import { DocumentMark } from "./DocumentMark";
import { ScrapListSkeleton } from "./ScrapListSkeleton";
import { ScrapMedia } from "./ScrapMedia";
import { TypeBookCarousel } from "./TypeBookCarousel";
import { ShelfEmptyGuide } from "./ShelfEmptyGuide";
import { IconTip } from "./IconTip";
import type { Scrap, ScrapType } from "../lib/types";
import { formatWhen } from "../lib/time";
import { extOf, formatBytes, mediaKindOf } from "../lib/tagger";
import { coverWash, spineColor, typeBookIds } from "../lib/typeColor";
import { typeMarkIcon } from "../lib/typeMark";
import { formatMediaDuration, probeMediaDuration } from "../lib/mediaDuration";
import { scrapFaceTitle } from "../lib/scrapFace";

const TYPES: ScrapType[] = ["text", "image", "video", "audio", "link", "document"];

const LAYOUTS: {
  id: ShelfLayout;
  icon: typeof LayoutGrid;
  labelKey: "layoutMicroThumb" | "layoutVisualGallery";
  tipKey: "layoutMicro" | "layoutGallery";
}[] = [
  { id: "micro", icon: RectangleHorizontal, labelKey: "layoutMicroThumb", tipKey: "layoutMicro" },
  { id: "gallery", icon: LayoutGrid, labelKey: "layoutVisualGallery", tipKey: "layoutGallery" },
];

function hasSpecificDocMark(item: Scrap) {
  if (item.type !== "document") return false;
  const ext = String(item.extension || extOf(item.filename || "") || "")
    .toLowerCase()
    .replace(/^\./, "");
  const mime = String(item.mime || "").toLowerCase();
  if (!ext && !mime) return false;
  if (ext === "pdf" || mime === "application/pdf") return true;
  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx", "hwp", "hwpx"].includes(ext)) return true;
  if (
    mime.includes("msword") ||
    mime.includes("wordprocessingml") ||
    mime.includes("spreadsheet") ||
    mime.includes("presentation") ||
    mime.includes("haansoft")
  ) {
    return true;
  }
  return Boolean(ext);
}

/** Type symbol + KO spine label shared with the book-spine carousel. */
function TypeSpineChip({ item }: { item: Scrap }) {
  const { lang } = usePrefs();
  const Mark = typeMarkIcon(item.type);
  const label = spineLabel(lang, item.type);
  return (
    <span className="scrap-type-chip">
      {hasSpecificDocMark(item) ? (
        <DocumentMark
          extension={item.extension}
          mime={item.mime}
          type={item.type}
          filename={item.filename}
          size="sm"
          className="scrap-type-chip-doc"
        />
      ) : (
        <Mark className="scrap-type-chip-icon" size={14} strokeWidth={1.75} aria-hidden />
      )}
      <span className="scrap-type-chip-label">{label}</span>
    </span>
  );
}

function shelfThumb(url: string) {
  return url.replace(
    /\/vi\/([^/]+)\/(?:maxresdefault|sddefault|hqdefault)\.jpg/i,
    "/vi/$1/mqdefault.jpg",
  );
}

function thumbCandidates(item: Scrap, mediaKind: ReturnType<typeof mediaKindOf>) {
  const media =
    item.dataUrl && (mediaKind === "image" || mediaKind === "video") ? item.dataUrl : "";
  return [item.posterUrl, item.og?.image || "", media].filter(Boolean).map(shelfThumb);
}

function scrapBlurb(item: Scrap): string {
  return (item.previewText || item.memo || item.og?.description || item.text || "").trim();
}

function scrapMetaExtra(item: Scrap): string {
  if (item.domain) return item.domain;
  if (item.filename && item.size) return formatBytes(item.size);
  if (item.filename) return item.filename;
  return "";
}

function TypePlaceholder({ type, domain }: { type: string; domain?: string }) {
  const icon =
    type === "video" ? (
      <Play className="size-8" strokeWidth={1.6} />
    ) : type === "audio" ? (
      <AudioLines className="size-8" strokeWidth={1.6} />
    ) : type === "link" ? (
      <Link2 className="size-8" strokeWidth={1.6} />
    ) : type === "document" ? (
      <FileText className="size-8" strokeWidth={1.6} />
    ) : type === "image" ? (
      <ImageIcon className="size-8" strokeWidth={1.6} />
    ) : (
      <BookOpen className="size-8" strokeWidth={1.6} />
    );

  return (
    <span className="scrap-type-placeholder">
      {icon}
      {type === "link" && domain ? <span className="scrap-type-placeholder-meta">{domain}</span> : null}
      {type === "audio" ? (
        <span className="scrap-type-placeholder-wave" aria-hidden>
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} style={{ ["--h" as string]: `${30 + ((i * 37) % 70)}%` }} />
          ))}
        </span>
      ) : null}
    </span>
  );
}

function mediaDurationSrc(item: Scrap, mediaKind: ReturnType<typeof mediaKindOf>) {
  if (mediaKind !== "video" && mediaKind !== "audio") return "";
  if (item.dataUrl) return item.dataUrl;
  if (item.url && /\.(mp4|webm|mov|m4v|mp3|wav|m4a|aac|ogg|flac)(\?|$)/i.test(item.url)) {
    return item.url;
  }
  return "";
}

function useMediaDurationLabel(item: Scrap, mediaKind: ReturnType<typeof mediaKindOf>) {
  const [label, setLabel] = useState("");
  const src = mediaDurationSrc(item, mediaKind);

  useEffect(() => {
    let cancelled = false;
    setLabel("");
    if (!src || (mediaKind !== "video" && mediaKind !== "audio")) return;
    void probeMediaDuration(src, mediaKind).then((seconds) => {
      if (cancelled || seconds == null) return;
      setLabel(formatMediaDuration(seconds));
    });
    return () => {
      cancelled = true;
    };
  }, [src, mediaKind, item.id]);

  return label;
}

function MediaThumb({
  item,
  mediaKind,
  priority,
  variant,
}: {
  item: Scrap;
  mediaKind: ReturnType<typeof mediaKindOf>;
  priority?: boolean;
  variant: "row" | "gallery";
}) {
  const { lang } = usePrefs();
  const candidates = thumbCandidates(item, mediaKind);
  const [exhausted, setExhausted] = useState(false);
  const primary = candidates[0] || "";
  const candidateKey = candidates.join("|");
  const durationLabel = useMediaDurationLabel(item, mediaKind);
  const TypeIcon = typeMarkIcon(item.type);
  const typeName = spineLabel(lang, item.type);

  useEffect(() => {
    setExhausted(false);
  }, [item.id, candidateKey]);

  const showPhoto = Boolean(primary) && !exhausted;
  const frameClass = variant === "row" ? "scrap-row-photo" : "scrap-gallery-photo";
  const showDuration = (item.type === "video" || item.type === "audio") && durationLabel;

  return (
    <span className={variant === "row" ? "scrap-row-thumb" : "scrap-gallery-plate"}>
      {showPhoto ? (
        <ScrapMedia
          key={primary}
          src={primary}
          fallbackSrcs={candidates.slice(1)}
          kind={item.posterUrl || item.og?.image ? "image" : mediaKind || "image"}
          controls={false}
          priority={priority}
          onExhausted={() => setExhausted(true)}
          className="scrap-book-photo"
          frameClassName={frameClass}
        />
      ) : (
        <TypePlaceholder type={item.type} domain={item.domain} />
      )}
      {showPhoto && item.type === "video" ? (
        <span className="scrap-media-play" aria-hidden>
          <Play className="size-4" strokeWidth={2} fill="currentColor" />
        </span>
      ) : null}
      <span className="scrap-media-type-badge">
        <TypeIcon className="scrap-media-type-badge-icon" size={12} strokeWidth={1.85} aria-hidden />
        <span>{typeName}</span>
      </span>
      {showDuration ? (
        <span className="scrap-media-duration font-mono" aria-label={durationLabel}>
          {durationLabel}
        </span>
      ) : null}
      {item.bookmarked ? (
        <span className="scrap-bookmark-mark" aria-hidden>
          <Bookmark className="size-3.5" strokeWidth={2} fill="currentColor" />
        </span>
      ) : null}
    </span>
  );
}

export function ScrapBookCard({
  item,
  index,
  priority = false,
  row = false,
  selected = false,
  onSelect,
}: {
  item: Scrap;
  index: number;
  priority?: boolean;
  row?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  if (row) return <ScrapRow item={item} index={index} priority={priority} selected={selected} onSelect={onSelect} />;
  return <GalleryCard item={item} index={index} priority={priority} selected={selected} onSelect={onSelect} />;
}

function openScrap(
  id: string,
  navigate: ReturnType<typeof useNavigate>,
  onSelect?: (id: string) => void,
) {
  if (onSelect) {
    onSelect(id);
    return;
  }
  navigate(`/scrap/${id}`);
}

function ScrapRow({
  item,
  index,
  priority = false,
  selected = false,
  onSelect,
}: {
  item: Scrap;
  index: number;
  priority?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  const { lang } = usePrefs();
  const t = useT();
  const navigate = useNavigate();
  const mediaKind = mediaKindOf(item.type, item.mime);
  const title = scrapFaceTitle(item, t("untitled"));
  const blurb = scrapBlurb(item);
  const extra = scrapMetaExtra(item);
  const tags = item.tags.slice(0, 3);

  return (
    <li
      className={"scrap-card scrap-card--row" + (selected ? " scrap-card--selected" : "")}
      style={{
        ["--spine" as string]: spineColor(item.type),
        ["--cover" as string]: coverWash(item.type),
      }}
    >
      <button
        type="button"
        className="scrap-card-hit"
        aria-pressed={selected || undefined}
        onClick={() => openScrap(item.id, navigate, onSelect)}
      >
        <MediaThumb item={item} mediaKind={mediaKind} priority={priority || index < 9} variant="row" />
        <span className="scrap-row-copy">
          <span className="scrap-row-meta">
            <TypeSpineChip item={item} />
            <span className="scrap-book-cover-date">{formatWhen(item.createdAt, lang)}</span>
            {extra ? <span className="scrap-row-extra">{extra}</span> : null}
          </span>
          <span className="scrap-row-title">{title}</span>
          {blurb ? <span className="scrap-row-blurb">{blurb}</span> : null}
          {tags.length ? (
            <span className="scrap-row-tags">
              {tags.map((tag) => (
                <span key={tag} className="scrap-row-tag">
                  {tag}
                </span>
              ))}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

function GalleryCard({
  item,
  index,
  priority = false,
  selected = false,
  onSelect,
}: {
  item: Scrap;
  index: number;
  priority?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  const t = useT();
  const navigate = useNavigate();
  const mediaKind = mediaKindOf(item.type, item.mime);
  const unread = !item.readAt;
  const title = scrapFaceTitle(item, t("untitled"));
  const blurb = scrapBlurb(item);

  return (
    <li
      className={
        "scrap-card scrap-card--gallery" +
        (unread ? " scrap-card--unread" : "") +
        (item.bookmarked ? " scrap-card--bookmarked" : "") +
        (selected ? " scrap-card--selected" : "")
      }
      style={{
        ["--spine" as string]: spineColor(item.type),
        ["--cover" as string]: coverWash(item.type),
      }}
    >
      <button
        type="button"
        className="scrap-card-hit"
        aria-pressed={selected || undefined}
        onClick={() => openScrap(item.id, navigate, onSelect)}
      >
        <MediaThumb item={item} mediaKind={mediaKind} priority={priority || index < 9} variant="gallery" />
        <span className="scrap-gallery-caption">
          <span className="scrap-gallery-title-block">
            {unread ? <span className="scrap-unread-dot" aria-hidden /> : null}
            <span className="scrap-gallery-title">{title}</span>
          </span>
          {blurb ? <span className="scrap-gallery-blurb">{blurb}</span> : null}
          <span className="scrap-gallery-foot">
            <TypeSpineChip item={item} />
            <span className="scrap-gallery-open">
              <ArrowRight className="size-3.5" strokeWidth={2} />
              {t("galleryOpenIndex")}
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}

function ShelfToolbar({
  types,
  counts,
  active,
  loading,
  onSelect,
}: {
  types: string[];
  counts: Record<string, number>;
  active: string;
  loading?: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="shelf-toolbar shelf-toolbar--sticky">
      <div className="shelf-toolbar-spines">
        <TypeBookCarousel
          types={types}
          counts={counts}
          active={active}
          loading={loading}
          contained
          sticky
          onSelect={onSelect}
        />
      </div>
      <div className="shelf-toolbar-actions">
        <LayoutSwitch />
      </div>
    </div>
  );
}

export function LayoutSwitch() {
  const { shelfLayout, setShelfLayout } = usePrefs();
  const t = useT();
  return (
    <section className="list-tools list-tools--slim" aria-label={t("layoutSwitch")}>
      <div className="list-tools-head">
        <div className="list-tools-head-actions">
          <div className="layout-seg" role="group" aria-label={t("layoutSwitch")}>
            {LAYOUTS.map(({ id, icon: Icon, tipKey }) => (
              <IconTip key={id} label={t(tipKey)}>
                <button
                  type="button"
                  className="icon-quiet-btn layout-seg-btn"
                  aria-pressed={shelfLayout === id}
                  aria-label={t(tipKey)}
                  onClick={() => setShelfLayout(id)}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={1.8} />
                </button>
              </IconTip>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type Props = {
  scraps: Scrap[];
  visible: Scrap[];
  loading?: boolean;
  typeFilter: string;
  onType: (value: string) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  sentinelRef?: RefObject<HTMLDivElement | null>;
  selectedId?: string | null;
  onSelectScrap?: (id: string) => void;
};

export function ScrapList({
  scraps,
  visible,
  loading = false,
  typeFilter,
  onType,
  hasMore = false,
  onLoadMore,
  sentinelRef,
  selectedId = null,
  onSelectScrap,
}: Props) {
  const { shelfLayout } = usePrefs();
  const t = useT();
  const gallery = shelfLayout === "gallery";

  const typeCounts = (() => {
    const counts: Record<string, number> = { all: scraps.length, bookmarked: 0 };
    for (const type of TYPES) counts[type] = 0;
    for (const item of scraps) {
      counts[item.type] = (counts[item.type] || 0) + 1;
      if (item.bookmarked) counts.bookmarked += 1;
    }
    return counts;
  })();

  // Built-in types with count > 0 once loaded; while loading show all built-ins.
  const visibleTypes = typeBookIds(typeCounts, TYPES, loading);

  useEffect(() => {
    if (loading || typeFilter === "all") return;
    if (typeFilter === "bookmarked") {
      if (!scraps.some((item) => item.bookmarked)) onType("all");
      return;
    }
    const count = scraps.filter((item) => item.type === typeFilter).length;
    if (count === 0) onType("all");
  }, [loading, typeFilter, scraps, onType]);

  const shelfEmpty = !loading && !scraps.length;

  const listBody: ReactNode = shelfEmpty ? (
    <ShelfEmptyGuide />
  ) : (
    <>
      {loading ? (
        <ScrapListSkeleton layout={shelfLayout} />
      ) : !visible.length ? (
        <div className="shelf-empty shelf-empty--compact">
          <p className="shelf-empty-title">{t("noMatches")}</p>
        </div>
      ) : (
        <ul className={"scrap-list scrap-list--" + (gallery ? "gallery" : "micro")}>
          {visible.map((item, index) => (
            <ScrapBookCard
              key={item.id}
              item={item}
              index={index}
              row={!gallery}
              selected={selectedId === item.id}
              onSelect={onSelectScrap}
            />
          ))}
        </ul>
      )}
      {hasMore ? (
        <div ref={sentinelRef} className="list-page-more">
          <button type="button" className="auth-link-utility" onClick={onLoadMore}>
            {t("loadMore")}
          </button>
        </div>
      ) : null}
    </>
  );

  return (
    <div className="shelf-door">
      {!shelfEmpty ? (
        <ShelfToolbar
          types={visibleTypes}
          counts={typeCounts}
          active={typeFilter}
          loading={loading}
          onSelect={onType}
        />
      ) : null}

      {shelfEmpty ? null : <AdSlot />}

      <section className="list-body" aria-live="polite">
        {listBody}
      </section>
    </div>
  );
}
