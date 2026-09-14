import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type AnimationEvent } from "react";
import { createPortal } from "react-dom";
import { Navigate, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useAuth } from "../context/Auth";
import { usePrefs } from "../context/Prefs";
import { usePlan } from "../context/Plan";
import { useT } from "../lib/useT";
import { AuthWaiting } from "../components/AuthWaiting";
import { IconTip } from "../components/IconTip";
import { DayFilterChip, DayFilterPanel } from "../components/DayFilter";
import { TypeBookCarousel } from "../components/TypeBookCarousel";
import { LayoutSwitch, ScrapBookCard, ShelfAccordion } from "../components/ScrapList";
import { TagCluster } from "../components/GlassCluster";
import { loadScraps, SCRAPS_CHANGED_EVENT, SCRAPS_CLEARED_EVENT } from "../lib/scraps";
import { usePagedSlice } from "../lib/usePagedSlice";
import { filterScraps } from "../lib/scrapFilters";
import { typeBookIds } from "../lib/typeColor";
import type { Scrap, ScrapType } from "../lib/types";

const TYPES: ScrapType[] = ["text", "image", "video", "audio", "link", "document"];

export function SearchPage() {
  const t = useT();
  const { shelfLayout } = usePrefs();
  const { user, ready } = useAuth();
  const { setScrapsForUsage } = usePlan();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState<string>(() => searchParams.get("type") || "all");
  const [dayFilter, setDayFilter] = useState<string | null>(() => searchParams.get("day"));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarClosing, setCalendarClosing] = useState(false);
  const [calSlide, setCalSlide] = useState(false);
  const [tagFilter, setTagFilter] = useState<string[]>(() => searchParams.getAll("tag"));
  const [tagsOpen, setTagsOpen] = useState(false);
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);

  const typeParam = searchParams.get("type") || "";
  const dayParam = searchParams.get("day") || "";
  const tagParam = searchParams.getAll("tag").join("\n");

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    setTypeFilter(typeParam || "all");
  }, [typeParam]);

  useEffect(() => {
    setDayFilter(dayParam || null);
  }, [dayParam]);

  useEffect(() => {
    setTagFilter(tagParam ? tagParam.split("\n") : []);
  }, [tagParam]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useLayoutEffect(() => {
    setHeaderSlot(document.getElementById("search-header-slot"));
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const next = await loadScraps(user);
      setScraps(next);
      setScrapsForUsage(next);
    } catch {
      setScraps([]);
    } finally {
      setLoading(false);
    }
  }, [user, setScrapsForUsage]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function onChange() {
      void refresh();
    }
    window.addEventListener(SCRAPS_CHANGED_EVENT, onChange);
    window.addEventListener(SCRAPS_CLEARED_EVENT, onChange);
    return () => {
      window.removeEventListener(SCRAPS_CHANGED_EVENT, onChange);
      window.removeEventListener(SCRAPS_CLEARED_EVENT, onChange);
    };
  }, [refresh]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: scraps.length };
    for (const type of TYPES) counts[type] = 0;
    for (const item of scraps) counts[item.type] = (counts[item.type] || 0) + 1;
    return counts;
  }, [scraps]);

  const visibleTypes = typeBookIds(typeCounts, TYPES, loading);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of scraps) {
      for (const tag of item.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [scraps]);

  const orderedTags = [
    ...tagCounts.filter(([tag]) => tagFilter.includes(tag)),
    ...tagCounts.filter(([tag]) => !tagFilter.includes(tag)),
  ];
  const shownTags = tagsOpen ? orderedTags : orderedTags.slice(0, 8);

  const visible = useMemo(
    () => filterScraps(scraps, { query, type: typeFilter, day: dayFilter, tags: tagFilter }),
    [scraps, query, typeFilter, dayFilter, tagFilter],
  );
  const paged = usePagedSlice(visible);

  function writeParams(patch: { q?: string; type?: string; day?: string | null; tags?: string[] }) {
    const next = new URLSearchParams(searchParams);
    if (patch.q !== undefined) {
      if (patch.q) next.set("q", patch.q);
      else next.delete("q");
    }
    if (patch.type !== undefined) {
      if (patch.type === "all") next.delete("type");
      else next.set("type", patch.type);
    }
    if (patch.day !== undefined) {
      if (patch.day) next.set("day", patch.day);
      else next.delete("day");
    }
    if (patch.tags !== undefined) {
      next.delete("tag");
      for (const tag of patch.tags) next.append("tag", tag);
    }
    setSearchParams(next, { replace: true });
  }

  function toggleTag(tag: string) {
    const next = tagFilter.includes(tag) ? tagFilter.filter((item) => item !== tag) : [...tagFilter, tag];
    writeParams({ tags: next });
  }

  function updateQuery(value: string) {
    setQuery(value);
    writeParams({ q: value });
  }

  function selectType(value: string) {
    setTypeFilter(value);
    writeParams({ type: value });
  }

  useLayoutEffect(() => {
    if (!calendarOpen || calendarClosing) {
      setCalSlide(false);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCalSlide(true);
      return;
    }
    const id = requestAnimationFrame(() => setCalSlide(true));
    return () => cancelAnimationFrame(id);
  }, [calendarOpen, calendarClosing]);

  function setCalendar(open: boolean) {
    if (open) {
      setCalendarClosing(false);
      setCalendarOpen(true);
      return;
    }
    if (!calendarOpen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCalendarOpen(false);
      setCalendarClosing(false);
      return;
    }
    setCalendarClosing(true);
  }

  function onCalendarEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (!calendarClosing || event.animationName !== "search-cal-out") return;
    setCalendarOpen(false);
    setCalendarClosing(false);
  }

  if (!ready) return <AuthWaiting />;
  if (!user) return <Navigate to="/" replace />;

  const searchBar = (
      <div className="search-page-bar">
        <div className="list-tools-search-wrap search-page-field">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="list-tools-search"
            aria-label={t("searchLabel")}
          />
          {query ? (
            <IconTip label={t("clearSearch")}>
              <button
                type="button"
                className="list-tools-search-clear"
                aria-label={t("clearSearch")}
                onClick={() => updateQuery("")}
              >
                <X className="size-[18px]" strokeWidth={1.8} />
              </button>
            </IconTip>
          ) : null}
        </div>
        <DayFilterChip dayFilter={dayFilter} open={calendarOpen} onOpenChange={setCalendar} />
      </div>
  );

  return (
    <div className="search-page">
      {headerSlot ? createPortal(searchBar, headerSlot) : searchBar}

      {calendarOpen || calendarClosing ? (
        <div className={"search-cal-slot" + (calSlide && !calendarClosing ? " is-open" : "")}>
          <div className="search-cal-slot-inner">
            <div className={"search-page-day" + (calendarClosing ? " is-closing" : "")} onAnimationEnd={onCalendarEnd}>
              <DayFilterPanel
                scraps={scraps}
                dayFilter={dayFilter}
                open
                onOpenChange={setCalendar}
                onDayChange={(day) => {
                  setDayFilter(day);
                  writeParams({ day });
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <TypeBookCarousel
        types={visibleTypes}
        counts={typeCounts}
        active={typeFilter}
        loading={loading}
        contained
        onSelect={selectType}
      />

      {tagCounts.length ? (
        <div className="search-tag-row">
          <TagCluster>
            {shownTags.map(([tag, count]) => (
              <button
                key={tag}
                type="button"
                className="scrap-tag scrap-tag--btn detail-tag-chip search-tag-chip"
                aria-pressed={tagFilter.includes(tag)}
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <span className="search-tag-count">{count}</span>
              </button>
            ))}
          </TagCluster>
          {tagFilter.length > 1 ? (
            <IconTip label={t("clearTags")}>
              <button
                type="button"
                className="search-tag-more"
                aria-label={t("clearTags")}
                onClick={() => writeParams({ tags: [] })}
              >
                <X className="size-[18px]" strokeWidth={1.8} />
              </button>
            </IconTip>
          ) : null}
          {tagCounts.length > 8 ? (
            <IconTip label={t(tagsOpen ? "tagsLess" : "tagsMore")}>
              <button
                type="button"
                className="search-tag-more"
                aria-expanded={tagsOpen}
                aria-label={t(tagsOpen ? "tagsLess" : "tagsMore")}
                onClick={() => setTagsOpen((open) => !open)}
              >
                {tagsOpen ? (
                  <ChevronUp className="size-[18px]" strokeWidth={1.8} />
                ) : (
                  <ChevronDown className="size-[18px]" strokeWidth={1.8} />
                )}
              </button>
            </IconTip>
          ) : null}
        </div>
      ) : null}

      <LayoutSwitch />

      <section className="list-body search-page-results" aria-live="polite">
        {loading ? (
          <p className="shelf-empty-hint">{t("shelfLoading")}</p>
        ) : !visible.length ? (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">{t("noMatches")}</p>
          </div>
        ) : shelfLayout === "accordion" ? (
          <ShelfAccordion visible={paged.slice} />
        ) : (
          <ul className={"scrap-list scrap-list--" + shelfLayout}>
            {paged.slice.map((item, index) => (
              <ScrapBookCard key={item.id} item={item} index={index} priority={index < 6} row={shelfLayout !== "gallery"} />
            ))}
          </ul>
        )}
        {paged.hasMore ? (
          <div ref={paged.sentinelRef} className="list-page-more">
            <button type="button" className="auth-link-utility" onClick={paged.loadMore}>
              {t("loadMore")}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
