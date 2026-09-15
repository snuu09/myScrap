import { useEffect, useLayoutEffect, useRef, useState, type AnimationEvent, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LayoutList, PanelsTopLeft, Rows3 } from "lucide-react";
import { typeLabel } from "../i18n";
import { usePrefs, type ShelfLayout } from "../context/Prefs";
import { useT } from "../lib/useT";
import { AdSlot } from "./AdSlot";
import { DocumentMark } from "./DocumentMark";
import { IconTip } from "./IconTip";
import { ScrapListSkeleton } from "./ScrapListSkeleton";
import { ScrapMedia } from "./ScrapMedia";
import { TypeBookCarousel } from "./TypeBookCarousel";
import { GlassCluster } from "./GlassCluster";
import type { Scrap, ScrapType } from "../lib/types";
import { formatWhen } from "../lib/time";
import { formatBytes, mediaKindOf } from "../lib/tagger";
import { spineColor, typeBookIds } from "../lib/typeColor";
import { scrapFaceTitle } from "../lib/scrapFace";
import { FAVICON_HOLDER } from "../lib/audioCover";
import { prefersReducedMotion } from "../lib/presence";

const TYPES: ScrapType[] = ["text", "image", "video", "audio", "link", "document"];

const LAYOUTS: { id: ShelfLayout; icon: typeof LayoutList; labelKey: "layoutList" | "layoutGallery" | "layoutAccordion" }[] = [
  { id: "gallery", icon: PanelsTopLeft, labelKey: "layoutGallery" },
  { id: "list", icon: LayoutList, labelKey: "layoutList" },
  { id: "accordion", icon: Rows3, labelKey: "layoutAccordion" },
];

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

function ScrapCardThumb({
  item,
  mediaKind,
  title,
  showFileMark,
  priority = false,
}: {
  item: Scrap;
  mediaKind: ReturnType<typeof mediaKindOf>;
  title: string;
  showFileMark: boolean;
  priority?: boolean;
}) {
  const { lang } = usePrefs();
  const candidates = thumbCandidates(item, mediaKind);
  const [exhausted, setExhausted] = useState(false);
  const primary = candidates[0] || "";
  const fallbacks = candidates.slice(1);
  const thumbIsCover = Boolean(item.posterUrl || item.og?.image);
  const candidateKey = candidates.join("|");

  useEffect(() => {
    setExhausted(false);
  }, [item.id, candidateKey]);

  const plate = (
    <span className="scrap-book-plate">
      {showFileMark ? (
        <DocumentMark
          extension={item.extension}
          mime={item.mime}
          type={item.type}
          filename={item.filename}
          size="sm"
        />
      ) : (
        <span className="scrap-book-cover-type">{typeLabel(lang, item.type)}</span>
      )}
      <span className="scrap-book-cover-title">{title}</span>
      <span className="scrap-book-cover-date">{formatWhen(item.createdAt, lang)}</span>
    </span>
  );

  if (!primary || exhausted) {
    return (
      <div className="scrap-book-cover">
        <span className="scrap-book-cover-spine" />
        <span className="scrap-book-cover-face">
          <img src={FAVICON_HOLDER} alt="" className="scrap-thumb-holder" />
          {plate}
        </span>
      </div>
    );
  }

  const media = (
    <ScrapMedia
      key={primary + fallbacks.join("|")}
      src={primary}
      fallbackSrcs={fallbacks}
      kind={thumbIsCover ? "image" : mediaKind || "image"}
      controls={false}
      priority={priority}
      onExhausted={() => setExhausted(true)}
      className="scrap-book-photo"
      frameClassName="scrap-book-photo-frame"
    />
  );

  return (
    <div className="scrap-book-cover">
      <span className="scrap-book-cover-spine" />
      <span className="scrap-book-cover-face">
        {media}
        {plate}
      </span>
    </div>
  );
}

export function ScrapBookCard({
  item,
  index,
  priority = false,
  row = false,
}: {
  item: Scrap;
  index: number;
  priority?: boolean;
  row?: boolean;
}) {
  if (row) return <ScrapRow item={item} index={index} priority={priority} />;
  return <ShelfRow item={item} index={index} gallery priority={priority} compact />;
}

function ScrapRow({ item, index, priority = false }: { item: Scrap; index: number; priority?: boolean }) {
  const { lang } = usePrefs();
  const t = useT();
  const navigate = useNavigate();
  const mediaKind = mediaKindOf(item.type, item.mime);
  const title = scrapFaceTitle(item, t("untitled"));
  const candidates = thumbCandidates(item, mediaKind);
  const [exhausted, setExhausted] = useState(false);
  const primary = candidates[0] || "";
  const candidateKey = candidates.join("|");

  useEffect(() => {
    setExhausted(false);
  }, [item.id, candidateKey]);

  const showPhoto = Boolean(primary) && !exhausted;

  return (
    <li className="scrap-card scrap-card--row" style={{ ["--spine" as string]: spineColor(item.type) }}>
      {item.bookmarked ? <span className="scrap-bookmark-ribbon" aria-hidden /> : null}
      <span className="scrap-row-pages" aria-hidden />
      <button type="button" className="scrap-card-hit" onClick={() => navigate(`/scrap/${item.id}`)}>
        <span className="scrap-row-book">
          <span className="scrap-row-face">
            {showPhoto ? (
              <ScrapMedia
                key={primary}
                src={primary}
                fallbackSrcs={candidates.slice(1)}
                kind={item.posterUrl || item.og?.image ? "image" : mediaKind || "image"}
                controls={false}
                priority={priority || index < 9}
                onExhausted={() => setExhausted(true)}
                className="scrap-book-photo"
                frameClassName="scrap-row-photo"
              />
            ) : (
              <img src={FAVICON_HOLDER} alt="" className="scrap-thumb-holder scrap-thumb-holder--row" />
            )}
          </span>
        </span>
        <span className="scrap-row-copy">
          <span className="scrap-row-title">{title}</span>
          <span className="scrap-row-meta">
            <DocumentMark
              extension={item.extension}
              mime={item.mime}
              type={item.type}
              filename={item.filename}
              size="sm"
            />
            <span className="scrap-book-cover-date">{formatWhen(item.createdAt, lang)}</span>
          </span>
        </span>
      </button>
    </li>
  );
}

function ShelfRow({
  item,
  index,
  gallery,
  compact,
  priority = false,
}: {
  item: Scrap;
  index: number;
  gallery: boolean;
  compact: boolean;
  priority?: boolean;
}) {
  const { lang } = usePrefs();
  const t = useT();
  const navigate = useNavigate();
  const mediaKind = mediaKindOf(item.type, item.mime);
  const unread = !item.readAt;
  const title = scrapFaceTitle(item, t("untitled"));
  const showFileMark = Boolean(item.type);

  return (
    <li
      className={
        "scrap-card" +
        (unread ? " scrap-card--unread" : "") +
        (item.bookmarked ? " scrap-card--bookmarked" : "") +
        " scrap-card--book"
      }
      style={{ ["--spine" as string]: spineColor(item.type) }}
    >
      {item.bookmarked ? <span className="scrap-bookmark-ribbon" aria-hidden /> : null}
      <button type="button" className="scrap-card-hit" onClick={() => navigate(`/scrap/${item.id}`)}>
        <ScrapCardThumb
          item={item}
          mediaKind={mediaKind}
          title={title}
          showFileMark={showFileMark}
          priority={priority || index < 9}
        />
        <div className="scrap-card-body">
          <div className="scrap-card-head">
            <div className="min-w-0 flex-1">
              {!gallery ? (
                <div className="scrap-card-doc-row">
                  <div className="min-w-0">
                    <p className="scrap-card-title">
                      {unread ? <span className="scrap-unread-dot" aria-hidden /> : null}
                      {title}
                    </p>
                    <p className="scrap-card-meta">
                      {typeLabel(lang, item.type)} · {formatWhen(item.createdAt, lang)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="scrap-card-title">
                  {unread ? <span className="scrap-unread-dot" aria-hidden /> : null}
                  {title}
                </p>
              )}
            </div>
          </div>
          {!compact ? (
            <>
              {item.og?.description ? <p className="scrap-card-text">{item.og.description}</p> : null}
              {item.text && item.type !== "image" && !item.og?.description ? (
                <p className="scrap-card-text">{item.text}</p>
              ) : null}
              {item.filename ? (
                <p className="scrap-card-file">
                  {showFileMark ? (
                    <DocumentMark
                      extension={item.extension}
                      mime={item.mime}
                      type={item.type}
                      filename={item.filename}
                      size="sm"
                      className="scrap-card-file-mark"
                    />
                  ) : null}
                  {item.filename} · {formatBytes(item.size)}
                </p>
              ) : null}
              {item.memo ? <p className="scrap-card-memo">{item.memo}</p> : null}
              <p className="scrap-card-tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="scrap-tag detail-tag-chip">
                    {tag}
                  </span>
                ))}
              </p>
            </>
          ) : null}
        </div>
      </button>
    </li>
  );
}

export function LayoutSwitch() {
  const { shelfLayout, setShelfLayout } = usePrefs();
  const t = useT();
  return (
    <section className="list-tools list-tools--slim" aria-label={t("layoutSwitch")}>
      <div className="list-tools-head">
        <div className="list-tools-head-actions">
          <GlassCluster className="layout-seg" label={t("layoutSwitch")} restOnPressed>
            {LAYOUTS.map(({ id, icon: Icon, labelKey }) => (
              <IconTip key={id} label={t(labelKey)}>
                <button
                  type="button"
                  className="layout-seg-btn"
                  aria-pressed={shelfLayout === id}
                  aria-label={t(labelKey)}
                  onClick={() => setShelfLayout(id)}
                >
                  <Icon className="size-[18px]" strokeWidth={1.8} />
                </button>
              </IconTip>
            ))}
          </GlassCluster>
        </div>
      </div>
    </section>
  );
}

function AccordionGroup({
  type,
  items,
  start,
  open,
  onOpen,
  onClose,
}: {
  type: string;
  items: Scrap[];
  start: number;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const { lang } = usePrefs();
  const [slotOpen, setSlotOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const shown = open || closing;

  useLayoutEffect(() => {
    if (!open) {
      setSlotOpen(false);
      return;
    }
    if (prefersReducedMotion()) {
      setSlotOpen(true);
      return;
    }
    const id = requestAnimationFrame(() => setSlotOpen(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  function finishClose() {
    setClosing(false);
    closeRef.current();
  }

  function toggle() {
    if (!open) {
      setClosing(false);
      onOpen();
      return;
    }
    if (prefersReducedMotion()) {
      onClose();
      return;
    }
    setClosing(true);
  }

  function onFoldEnd(event: AnimationEvent<HTMLUListElement>) {
    if (event.target !== event.currentTarget) return;
    if (!closing || event.animationName !== "accordion-fold") return;
    finishClose();
  }

  useEffect(() => {
    if (!closing) return;
    const id = window.setTimeout(finishClose, 420);
    return () => window.clearTimeout(id);
  }, [closing]);

  return (
    <section className="shelf-accordion-group">
      <button
        type="button"
        className="shelf-accordion-head"
        aria-expanded={open && !closing}
        onClick={toggle}
      >
        <span>{typeLabel(lang, type)}</span>
        <span className="shelf-accordion-count">{items.length}</span>
        <ChevronDown className={"size-[18px] shelf-accordion-chevron" + (open && !closing ? " is-open" : "")} strokeWidth={1.8} />
      </button>
      {shown ? (
        <div className={"shelf-accordion-slot" + (slotOpen && !closing ? " is-open" : "")}>
          <div className="shelf-accordion-slot-inner">
            <ul
              className={"scrap-list scrap-list--list shelf-accordion-body" + (closing ? " is-closing" : "")}
              onAnimationEnd={onFoldEnd}
            >
              {items.map((item, i) => (
                <ScrapBookCard key={item.id} item={item} index={start + i} row />
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function ShelfAccordion({ visible }: { visible: Scrap[] }) {
  const [opened, setOpened] = useState<ReadonlySet<string>>(() => new Set());
  const extras = [...new Set(visible.map((item) => item.type))].filter((type) => !TYPES.includes(type as ScrapType)).sort();
  const groups = [...TYPES, ...extras]
    .map((type) => ({
      type,
      items: visible.filter((item) => item.type === type),
    }))
    .filter((group) => group.items.length > 0);

  function setGroup(type: string, nextOpen: boolean) {
    setOpened((cur) => {
      const has = cur.has(type);
      if (has === nextOpen) return cur;
      const next = new Set(cur);
      if (nextOpen) next.add(type);
      else next.delete(type);
      return next;
    });
  }

  let index = 0;
  return (
    <div className="shelf-accordion">
      {groups.map((group) => {
        const start = index;
        index += group.items.length;
        return (
          <AccordionGroup
            key={group.type}
            type={group.type}
            items={group.items}
            start={start}
            open={opened.has(group.type)}
            onOpen={() => setGroup(group.type, true)}
            onClose={() => setGroup(group.type, false)}
          />
        );
      })}
    </div>
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
}: Props) {
  const { shelfLayout } = usePrefs();
  const t = useT();
  const gallery = shelfLayout === "gallery";

  const typeCounts = (() => {
    const counts: Record<string, number> = { all: scraps.length };
    for (const type of TYPES) counts[type] = 0;
    for (const item of scraps) {
      counts[item.type] = (counts[item.type] || 0) + 1;
    }
    return counts;
  })();

  const visibleTypes = typeBookIds(typeCounts, TYPES, loading);

  useEffect(() => {
    if (loading || typeFilter === "all") return;
    const count = scraps.filter((item) => item.type === typeFilter).length;
    if (count === 0) onType("all");
  }, [loading, typeFilter, scraps, onType]);

  const shelfEmpty = !loading && !scraps.length;

  if (shelfEmpty) {
    return (
      <div className="shelf-door">
        <section className="list-body" aria-live="polite">
          <div className="shelf-empty">
            <p className="shelf-empty-title">{t("empty")}</p>
            <p className="shelf-empty-hint">{t("emptyHint")}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="shelf-door">
      <TypeBookCarousel
        types={visibleTypes}
        counts={typeCounts}
        active={typeFilter}
        loading={loading}
        onSelect={onType}
      />

      <LayoutSwitch />

      <AdSlot />

      <section className="list-body" aria-live="polite">
        {loading ? (
          <ScrapListSkeleton layout={shelfLayout} />
        ) : !visible.length ? (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">{t("noMatches")}</p>
          </div>
        ) : shelfLayout === "accordion" ? (
          <ShelfAccordion visible={visible} />
        ) : (
          <ul className={"scrap-list scrap-list--" + shelfLayout}>
            {visible.map((item, index) => (
              <ScrapBookCard key={item.id} item={item} index={index} row={!gallery} />
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
      </section>
    </div>
  );
}
