import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { t, typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useDialog } from "../lib/dialog";
import { AdSlot } from "./AdSlot";
import { DayFilterChip, DayFilterPanel } from "./DayFilter";
import { IconTip } from "./IconTip";
import type { Scrap, ScrapType } from "../lib/types";
import { formatWhen } from "../lib/time";
import { formatBytes } from "../lib/tagger";

const TYPES: ScrapType[] = ["text", "image", "video", "audio", "link", "document"];

type Props = {
  scraps: Scrap[];
  visible: Scrap[];
  query: string;
  typeFilter: ScrapType | "all";
  dayFilter: string | null;
  calendarOpen: boolean;
  onQuery: (value: string) => void;
  onType: (value: ScrapType | "all") => void;
  onDayFilter: (value: string | null) => void;
  onCalendarOpen: (open: boolean) => void;
  onClearFilters: () => void;
  onPeel: (scrap: Scrap) => void;
};

export function ScrapList({
  scraps,
  visible,
  query,
  typeFilter,
  dayFilter,
  calendarOpen,
  onQuery,
  onType,
  onDayFilter,
  onCalendarOpen,
  onClearFilters,
  onPeel,
}: Props) {
  const { lang } = usePrefs();
  const navigate = useNavigate();
  const { confirm } = useDialog();
  const filtersActive = Boolean(query.trim()) || typeFilter !== "all" || Boolean(dayFilter) || calendarOpen;

  const typeCounts = (() => {
    const counts: Record<string, number> = { all: scraps.length };
    for (const type of TYPES) counts[type] = 0;
    for (const item of scraps) {
      counts[item.type] = (counts[item.type] || 0) + 1;
    }
    return counts;
  })();

  async function askPeel(item: Scrap) {
    if (await confirm({ body: t(lang, "peelConfirm"), danger: true, confirmLabel: t(lang, "deleteItem") })) {
      onPeel(item);
    }
  }

  return (
    <div className="shelf-door">
      <section className="list-tools" aria-label={t(lang, "searchLabel")}>
        <div className="list-tools-head">
          <p className="list-tools-label">{t(lang, "searchLabel")}</p>
          {filtersActive ? (
            <button type="button" className="auth-link-utility" onClick={onClearFilters}>
              {t(lang, "clearFilters")}
            </button>
          ) : null}
        </div>
        <div className="list-tools-search-wrap">
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={t(lang, "searchPlaceholder")}
            className="list-tools-search"
            aria-label={t(lang, "searchLabel")}
          />
          {query ? (
            <IconTip label={t(lang, "clearSearch")}>
              <button
                type="button"
                className="list-tools-search-clear"
                aria-label={t(lang, "clearSearch")}
                onClick={() => onQuery("")}
              >
                <X className="size-[18px]" strokeWidth={1.8} />
              </button>
            </IconTip>
          ) : null}
        </div>
        <div className="list-tools-chips" role="group" aria-label={t(lang, "filterAll")}>
          <button type="button" className="chip-filter" aria-pressed={typeFilter === "all"} onClick={() => onType("all")}>
            {t(lang, "filterAll")}
            <span className="chip-filter-count">{typeCounts.all}</span>
          </button>
          {TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className="chip-filter"
              aria-pressed={typeFilter === type}
              onClick={() => onType(type)}
            >
              {typeLabel(lang, type)}
              <span className="chip-filter-count">{typeCounts[type] || 0}</span>
            </button>
          ))}
          <DayFilterChip dayFilter={dayFilter} open={calendarOpen} onOpenChange={onCalendarOpen} />
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
        {!scraps.length ? (
          <div className="shelf-empty">
            <p className="shelf-empty-title">{t(lang, "empty")}</p>
            <p className="shelf-empty-hint">{t(lang, "emptyHint")}</p>
          </div>
        ) : !visible.length ? (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">{t(lang, "noMatches")}</p>
          </div>
        ) : (
          <ul className="scrap-list">
            {visible.map((item) => {
              const thumb = item.og?.image || (item.dataUrl && item.type === "image" ? item.dataUrl : "");
              const unread = !item.readAt;
              return (
              <li key={item.id} className={"scrap-card" + (unread ? " scrap-card--unread" : "")}>
                <button type="button" className="scrap-card-hit" onClick={() => navigate(`/scrap/${item.id}`)}>
                  {thumb ? (
                    <img src={thumb} alt="" className="scrap-card-media" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : null}
                  <div className="scrap-card-body">
                    <div className="scrap-card-head">
                      <div className="min-w-0 flex-1">
                        <p className="scrap-card-title">
                          {unread ? <span className="scrap-unread-dot" aria-hidden /> : null}
                          {item.bookmarked ? <span className="scrap-bookmark-mark" aria-hidden>★</span> : null}
                          {item.title || item.og?.title || t(lang, "untitled")}
                        </p>
                        <p className="scrap-card-meta">
                          {typeLabel(lang, item.type)} · {formatWhen(item.createdAt, lang)}
                        </p>
                      </div>
                      <IconTip label={t(lang, "deleteItem")}>
                        <span
                          role="button"
                          tabIndex={0}
                          className="scrap-card-peel"
                          aria-label={t(lang, "deleteItem")}
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
                    {item.og?.description ? <p className="scrap-card-text">{item.og.description}</p> : null}
                    {item.text && item.type !== "image" && !item.og?.description ? (
                      <p className="scrap-card-text">{item.text}</p>
                    ) : null}
                    {item.url ? <span className="scrap-card-link">{t(lang, "openLink")}</span> : null}
                    {item.filename ? (
                      <p className="scrap-card-file">
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
