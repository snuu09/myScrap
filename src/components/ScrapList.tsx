import { useEffect, useState, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutList } from "lucide-react";
import { typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import { AdSlot } from "./AdSlot";
import { DocumentMark } from "./DocumentMark";
import { IconTip } from "./IconTip";
import { ScrapListSkeleton } from "./ScrapListSkeleton";
import { ScrapMedia } from "./ScrapMedia";
import { TypeBookCarousel } from "./TypeBookCarousel";
import type { Scrap, ScrapType } from "../lib/types";
import { formatWhen } from "../lib/time";
import { formatBytes, mediaKindOf } from "../lib/tagger";

const TYPES: ScrapType[] = ["text", "image", "video", "audio", "link", "document"];

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
  unread,
  showFileMark,
  gallery,
  priority = false,
}: {
  item: Scrap;
  mediaKind: ReturnType<typeof mediaKindOf>;
  title: string;
  unread: boolean;
  showFileMark: boolean;
  gallery: boolean;
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

  if (!primary || exhausted) {
    if (!gallery) return null;
    return (
      <div className="scrap-book-cover">
        <span className="scrap-book-cover-spine" />
        <span className="scrap-book-cover-face">
          {showFileMark ? (
            <DocumentMark
              extension={item.extension}
              mime={item.mime}
              type={item.type}
              filename={item.filename}
              size="lg"
            />
          ) : (
            <span className="scrap-book-cover-type">{typeLabel(lang, item.type)}</span>
          )}
          <span className="scrap-book-cover-title">
            {unread ? <span className="scrap-unread-dot" aria-hidden /> : null}
            {title}
          </span>
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

  if (!gallery) {
    return (
      <div className="scrap-book-cover scrap-book-cover--compact">
        <span className="scrap-book-cover-spine" />
        <span className="scrap-book-cover-face">{media}</span>
      </div>
    );
  }

  return (
    <div className="scrap-book-cover">
      <span className="scrap-book-cover-spine" />
      <span className="scrap-book-cover-face">
        {media}
        <span className="scrap-book-cover-title">
          {unread ? <span className="scrap-unread-dot" aria-hidden /> : null}
          {title}
        </span>
      </span>
    </div>
  );
}

type Props = {
  scraps: Scrap[];
  visible: Scrap[];
  loading?: boolean;
  typeFilter: ScrapType | "all";
  onType: (value: ScrapType | "all") => void;
  onClearFilters: () => void;
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
  onClearFilters,
  hasMore = false,
  onLoadMore,
  sentinelRef,
}: Props) {
  const { lang, shelfLayout, setShelfLayout } = usePrefs();
  const t = useT();
  const navigate = useNavigate();
  const filtersActive = typeFilter !== "all";
  const compact = shelfLayout !== "list";

  const typeCounts = (() => {
    const counts: Record<string, number> = { all: scraps.length };
    for (const type of TYPES) counts[type] = 0;
    for (const item of scraps) {
      counts[item.type] = (counts[item.type] || 0) + 1;
    }
    return counts;
  })();

  const visibleTypes = loading ? TYPES : TYPES.filter((type) => (typeCounts[type] || 0) > 0);

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

      <section className="list-tools list-tools--slim" aria-label={t("layoutSwitch")}>
        <div className="list-tools-head">
          <div className="list-tools-head-actions">
            <div className="layout-seg" role="group" aria-label={t("layoutSwitch")}>
              <IconTip label={t("layoutList")}>
                <button
                  type="button"
                  className="layout-seg-btn"
                  aria-pressed={shelfLayout === "list"}
                  aria-label={t("layoutList")}
                  onClick={() => setShelfLayout("list")}
                >
                  <LayoutList className="size-[18px]" strokeWidth={1.8} />
                </button>
              </IconTip>
            </div>
            {filtersActive ? (
              <button type="button" className="auth-link-utility" onClick={onClearFilters}>
                {t("clearFilters")}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <AdSlot />

      <section className="list-body" aria-live="polite">
        {loading ? (
          <ScrapListSkeleton layout={shelfLayout} />
        ) : !visible.length ? (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">{t("noMatches")}</p>
          </div>
        ) : (
          <ul className={"scrap-list scrap-list--" + shelfLayout}>
            {visible.map((item, index) => {
              const mediaKind = mediaKindOf(item.type, item.mime);
              const candidates = thumbCandidates(item, mediaKind);
              const thumb = candidates[0] || "";
              const unread = !item.readAt;
              const title = item.title || item.og?.title || t("untitled");
              const isDoc = item.type === "document";
              const showFileMark = isDoc || item.type === "image" || item.type === "video" || item.type === "audio";
              return (
                <li
                  key={item.id}
                  className={
                    "scrap-card" +
                    (unread ? " scrap-card--unread" : "") +
                    (item.bookmarked ? " scrap-card--bookmarked" : "") +
                    (shelfLayout === "gallery" ? " scrap-card--book" : "")
                  }
                >
                  {item.bookmarked ? <span className="scrap-bookmark-ribbon" aria-hidden /> : null}
                  <button type="button" className="scrap-card-hit" onClick={() => navigate(`/scrap/${item.id}`)}>
                    <ScrapCardThumb
                      item={item}
                      mediaKind={mediaKind}
                      title={title}
                      unread={unread}
                      showFileMark={showFileMark}
                      gallery={shelfLayout === "gallery"}
                      priority={shelfLayout === "gallery" && index < 9}
                    />
                    <div className="scrap-card-body">
                      <div className="scrap-card-head">
                        <div className="min-w-0 flex-1">
                          {shelfLayout === "list" && !thumb && showFileMark ? (
                            <div className="scrap-card-doc-row">
                              <DocumentMark
                                extension={item.extension}
                                mime={item.mime}
                                type={item.type}
                                filename={item.filename}
                                size="sm"
                              />
                              <p className="scrap-card-title">
                                {unread ? <span className="scrap-unread-dot" aria-hidden /> : null}
                                {title}
                              </p>
                            </div>
                          ) : (
                            <p className="scrap-card-title">
                              {unread ? <span className="scrap-unread-dot" aria-hidden /> : null}
                              {title}
                            </p>
                          )}
                          {shelfLayout !== "gallery" ? (
                            <p className="scrap-card-meta">
                              {typeLabel(lang, item.type)} · {formatWhen(item.createdAt, lang)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {!compact ? (
                        <>
                          {item.og?.description ? <p className="scrap-card-text">{item.og.description}</p> : null}
                          {item.text && item.type !== "image" && !item.og?.description ? (
                            <p className="scrap-card-text">{item.text}</p>
                          ) : null}
                          {item.url ? <span className="scrap-card-link">{t("openLink")}</span> : null}
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
                      ) : item.type === "image" && item.tags.length ? (
                        <p className="scrap-card-tags">
                          {item.tags.map((tag) => (
                            <span key={tag} className="scrap-tag detail-tag-chip">
                              {tag}
                            </span>
                          ))}
                        </p>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
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
