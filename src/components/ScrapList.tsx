import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, LayoutList, PanelsTopLeft, X } from "lucide-react";
import { typeLabel } from "../i18n";
import { usePrefs, type ShelfLayout } from "../context/Prefs";
import { useDialog } from "../lib/dialog";
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
  onPeel: (scrap: Scrap) => void;
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
  onPeel,
}: Props) {
  const { lang, shelfLayout, setShelfLayout } = usePrefs();
  const t = useT();
  const navigate = useNavigate();
  const { confirm } = useDialog();
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

  async function askPeel(item: Scrap) {
    if (await confirm({ body: t("peelConfirm"), danger: true, confirmLabel: t("deleteItem") })) {
      onPeel(item);
    }
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
        ) : !scraps.length ? (
          <div className="shelf-empty">
            <p className="shelf-empty-title">{t("empty")}</p>
            <p className="shelf-empty-hint">{t("emptyHint")}</p>
          </div>
        ) : !visible.length ? (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">{t("noMatches")}</p>
          </div>
        ) : (
          <ul className={"scrap-list scrap-list--" + shelfLayout}>
            {visible.map((item) => {
              const mediaKind = mediaKindOf(item.type, item.mime);
              const thumb =
                item.og?.image ||
                (item.dataUrl && (mediaKind === "image" || mediaKind === "video") ? item.dataUrl : "");
              const unread = !item.readAt;
              const title = item.title || item.og?.title || t("untitled");
              const isDoc = item.type === "document" || Boolean(item.filename);
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
                  {item.bookmarked ? (
                    <span className="scrap-bookmark-ribbon" aria-hidden>
                      <Bookmark className="size-3.5" strokeWidth={2.2} fill="currentColor" />
                    </span>
                  ) : null}
                  <button type="button" className="scrap-card-hit" onClick={() => navigate(`/scrap/${item.id}`)}>
                    {thumb ? (
                      <ScrapMedia
                        key={thumb}
                        src={thumb}
                        kind={item.og?.image ? "image" : mediaKind || "image"}
                        controls={false}
                      />
                    ) : shelfLayout === "gallery" ? (
                      <div className="scrap-book-cover" aria-hidden>
                        <span className="scrap-book-cover-spine" />
                        <span className="scrap-book-cover-face">
                          {isDoc ? (
                            <DocumentMark extension={item.extension} mime={item.mime} type={item.type} size="lg" />
                          ) : (
                            <span className="scrap-book-cover-type">{typeLabel(lang, item.type)}</span>
                          )}
                          <span className="scrap-book-cover-title">{title}</span>
                        </span>
                      </div>
                    ) : null}
                    <div className="scrap-card-body">
                      <div className="scrap-card-head">
                        <div className="min-w-0 flex-1">
                          {shelfLayout === "list" && !thumb && isDoc ? (
                            <div className="scrap-card-doc-row">
                              <DocumentMark extension={item.extension} mime={item.mime} type={item.type} size="sm" />
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
                        <IconTip label={t("deleteItem")} placement="below">
                          <span
                            role="button"
                            tabIndex={0}
                            className="scrap-card-peel"
                            aria-label={t("deleteItem")}
                            onClick={(e) => {
                              e.stopPropagation();
                              void askPeel(item);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                void askPeel(item);
                              }
                            }}
                          >
                            <X className="size-[18px]" strokeWidth={1.8} />
                          </span>
                        </IconTip>
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
                              {isDoc ? (
                                <DocumentMark
                                  extension={item.extension}
                                  mime={item.mime}
                                  type={item.type}
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
                              <span key={tag} className="scrap-tag">
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
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
