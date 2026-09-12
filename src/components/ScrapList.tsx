import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutList, PanelsTopLeft } from "lucide-react";
import { typeLabel } from "../i18n";
import { usePrefs, type ShelfLayout } from "../context/Prefs";
import { useT } from "../lib/useT";
import { AdSlot } from "./AdSlot";
import { DayFilterChip, DayFilterPanel } from "./DayFilter";
import { DocumentMark } from "./DocumentMark";
import { IconTip } from "./IconTip";
import { ScrapListSkeleton } from "./ScrapListSkeleton";
import { ScrapMedia } from "./ScrapMedia";
import { TypeBookCarousel } from "./TypeBookCarousel";
import type { Scrap, ScrapType } from "../lib/types";
import { formatWhen } from "../lib/time";
import { formatBytes, mediaKindOf } from "../lib/tagger";

const TYPES: ScrapType[] = ["text", "image", "video", "audio", "link", "document"];

const LAYOUTS: { id: ShelfLayout; icon: typeof LayoutList; labelKey: "layoutList" | "layoutGallery" }[] = [
  { id: "list", icon: LayoutList, labelKey: "layoutList" },
  { id: "gallery", icon: PanelsTopLeft, labelKey: "layoutGallery" },
];

function thumbCandidates(item: Scrap, mediaKind: ReturnType<typeof mediaKindOf>) {
  const media =
    item.dataUrl && (mediaKind === "image" || mediaKind === "video") ? item.dataUrl : "";
  return [item.posterUrl, item.og?.image || "", media].filter(Boolean);
}

function ScrapCardThumb({
  item,
  mediaKind,
  title,
  showFileMark,
  gallery,
}: {
  item: Scrap;
  mediaKind: ReturnType<typeof mediaKindOf>;
  title: string;
  showFileMark: boolean;
  gallery: boolean;
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
      <div className="scrap-book-cover" aria-hidden>
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
          <span className="scrap-book-cover-title">{title}</span>
        </span>
      </div>
    );
  }

  return (
    <ScrapMedia
      key={primary + fallbacks.join("|")}
      src={primary}
      fallbackSrcs={fallbacks}
      kind={thumbIsCover ? "image" : mediaKind || "image"}
      controls={false}
      onExhausted={() => setExhausted(true)}
    />
  );
}

type Props = {
  scraps: Scrap[];
  visible: Scrap[];
  loading?: boolean;
  typeFilter: ScrapType | "all";
  dayFilter: string | null;
  calendarOpen: boolean;
  onType: (value: ScrapType | "all") => void;
  onDayFilter: (value: string | null) => void;
  onCalendarOpen: (open: boolean) => void;
  onClearFilters: () => void;
};

export function ScrapList({
  scraps,
  visible,
  loading = false,
  typeFilter,
  dayFilter,
  calendarOpen,
  onType,
  onDayFilter,
  onCalendarOpen,
  onClearFilters,
}: Props) {
  const { lang, shelfLayout, setShelfLayout } = usePrefs();
  const t = useT();
  const navigate = useNavigate();
  const filtersActive = typeFilter !== "all" || Boolean(dayFilter) || calendarOpen;
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
          <div className="list-tools-chips list-tools-chips--slim" role="group" aria-label={t("filterByDay")}>
            <DayFilterChip dayFilter={dayFilter} open={calendarOpen} onOpenChange={onCalendarOpen} />
          </div>
          <div className="list-tools-head-actions">
            <div className="layout-seg" role="group" aria-label={t("layoutSwitch")}>
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
            </div>
            {filtersActive ? (
              <button type="button" className="auth-link-utility" onClick={onClearFilters}>
                {t("clearFilters")}
              </button>
            ) : null}
          </div>
        </div>
        <DayFilterPanel
          scraps={scraps}
          dayFilter={dayFilter}
          open={calendarOpen}
          onOpenChange={onCalendarOpen}
          onDayChange={onDayFilter}
        />
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
            {visible.map((item) => {
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
                    (!thumb && shelfLayout === "gallery" ? " scrap-card--no-media" : "")
                  }
                >
                  {item.bookmarked ? <span className="scrap-bookmark-ribbon" aria-hidden /> : null}
                  <button type="button" className="scrap-card-hit" onClick={() => navigate(`/scrap/${item.id}`)}>
                    <ScrapCardThumb
                      item={item}
                      mediaKind={mediaKind}
                      title={title}
                      showFileMark={showFileMark}
                      gallery={shelfLayout === "gallery"}
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
      </section>
    </div>
  );
}
