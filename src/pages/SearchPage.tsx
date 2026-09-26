import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type AnimationEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { RotateCcw, Search } from "lucide-react";
import { useAuth } from "../context/Auth";
import { usePrefs } from "../context/Prefs";
import { usePlan } from "../context/Plan";
import { useT } from "../lib/useT";
import { AuthWaiting } from "../components/AuthWaiting";
import { IconTip } from "../components/IconTip";
import { CalendarFilterPanel, CalendarFilterTrigger } from "../components/CalendarFilter";
import { LayoutSwitch, ScrapBookCard } from "../components/ScrapList";
import { PageEmptyGuide } from "../components/PageEmptyGuide";
import { SearchFacets } from "../components/SearchFacets";
import { loadScraps, SCRAPS_CHANGED_EVENT, SCRAPS_CLEARED_EVENT } from "../lib/scraps";
import { usePagedSlice } from "../lib/usePagedSlice";
import {
  countInRange,
  filterScraps,
  resolveDateBounds,
} from "../lib/scrapFilters";
import type { Scrap } from "../lib/types";

function readTypes(params: URLSearchParams): string[] {
  const all = params.getAll("type");
  if (!all.length) return [];
  if (all.length === 1 && all[0].includes(",")) {
    return all[0].split(",").map((s) => s.trim()).filter(Boolean);
  }
  return all.filter((t) => t && t !== "all");
}

function readDateBounds(params: URLSearchParams) {
  const from = params.get("from");
  const to = params.get("to");
  const day = params.get("day");
  return resolveDateBounds({ from, to, day });
}

export function SearchPage() {
  const t = useT();
  const navigate = useNavigate();
  const { shelfLayout } = usePrefs();
  const { user, ready } = useAuth();
  const { setScrapsForUsage } = usePlan();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [types, setTypes] = useState<string[]>(() => readTypes(searchParams));
  const initialBounds = readDateBounds(searchParams);
  const [from, setFrom] = useState<string | null>(initialBounds.from);
  const [to, setTo] = useState<string | null>(initialBounds.to);
  const [calendarFrom, setCalendarFrom] = useState<string | null>(initialBounds.from);
  const [calendarTo, setCalendarTo] = useState<string | null>(initialBounds.to);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarClosing, setCalendarClosing] = useState(false);
  const [calSlide, setCalSlide] = useState(false);
  const [tagFilter, setTagFilter] = useState<string[]>(() => searchParams.getAll("tag"));
  const scrapsLoaded = useRef<string | null>(null);

  const typeParam = searchParams.getAll("type").join(",");
  const fromParam = searchParams.get("from") || "";
  const toParam = searchParams.get("to") || "";
  const dayParam = searchParams.get("day") || "";
  const tagParam = searchParams.getAll("tag").join("\n");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    setTypes(readTypes(searchParams));
  }, [typeParam]);

  useEffect(() => {
    const bounds = resolveDateBounds({
      from: fromParam || null,
      to: toParam || null,
      day: dayParam || null,
    });
    setFrom(bounds.from);
    setTo(bounds.to);
    setCalendarFrom(bounds.from);
    setCalendarTo(bounds.to);
  }, [fromParam, toParam, dayParam]);

  useEffect(() => {
    setTagFilter(tagParam ? tagParam.split("\n") : []);
  }, [tagParam]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    const quiet = scrapsLoaded.current && scrapsLoaded.current === user.id;
    if (!quiet) setLoading(true);
    try {
      const next = await loadScraps(user);
      setScraps(next);
      setScrapsForUsage(next);
      scrapsLoaded.current = user.id;
    } catch {
      if (!quiet) setScraps([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user, setScrapsForUsage]);

  useEffect(() => {
    if (scrapsLoaded.current !== user?.id) {
      scrapsLoaded.current = null;
    }
    void refresh();
  }, [refresh, user?.id]);

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

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of scraps) {
      for (const tag of item.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [scraps]);

  const recommendedTags = tagCounts.slice(0, 5);

  const visible = useMemo(
    () =>
      filterScraps(scraps, {
        query,
        types: types.length ? types : ["all"],
        from,
        to,
        tags: tagFilter,
      }),
    [scraps, query, types, from, to, tagFilter],
  );
  const paged = usePagedSlice(visible);
  const rangeCount = countInRange(scraps, from, to);

  function writeParams(patch: {
    q?: string;
    types?: string[];
    from?: string | null;
    to?: string | null;
    tags?: string[];
  }) {
    const next = new URLSearchParams(searchParams);
    if (patch.q !== undefined) {
      if (patch.q) next.set("q", patch.q);
      else next.delete("q");
    }
    if (patch.types !== undefined) {
      next.delete("type");
      const list = patch.types.filter((x) => x && x !== "all");
      for (const type of list) next.append("type", type);
    }
    if (patch.from !== undefined || patch.to !== undefined) {
      next.delete("day");
      const f = patch.from !== undefined ? patch.from : from;
      const tt = patch.to !== undefined ? patch.to : to;
      if (f) next.set("from", f);
      else next.delete("from");
      if (tt) next.set("to", tt);
      else next.delete("to");
    }
    if (patch.tags !== undefined) {
      next.delete("tag");
      for (const tag of patch.tags) next.append("tag", tag);
    }
    setSearchParams(next, { replace: true });
  }

  function updateQuery(value: string) {
    setQuery(value);
    writeParams({ q: value });
  }

  function resetAll() {
    setQuery("");
    setTypes([]);
    setFrom(null);
    setTo(null);
    setCalendarFrom(null);
    setCalendarTo(null);
    setTagFilter([]);
    setSearchParams(new URLSearchParams(), { replace: true });
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

  const libraryEmpty = !loading && scraps.length === 0;

  return (
    <div className="search-page">
      {scraps.length > 0 ? (
      <div className={"search-command" + (calendarOpen || calendarClosing ? " is-cal-open" : "")}>
        <div className="search-command-bar">
          <div className="search-command-field">
            <Search className="search-command-icon size-[18px]" strokeWidth={1.8} aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && query) {
                  e.preventDefault();
                  updateQuery("");
                }
              }}
              placeholder={t("searchPlaceholder")}
              className="search-command-input"
              aria-label={t("searchLabel")}
            />
            {query ? (
              <button
                type="button"
                className="search-command-esc"
                aria-label={t("clearSearch")}
                onClick={() => updateQuery("")}
              >
                ESC
              </button>
            ) : null}
          </div>
          <div className="search-command-actions">
            <CalendarFilterTrigger
              from={from}
              to={to}
              count={rangeCount}
              open={calendarOpen}
              onOpenChange={setCalendar}
            />
            <button
              type="button"
              className="search-command-submit"
              onClick={() => inputRef.current?.blur()}
            >
              <Search className="size-4" strokeWidth={1.8} aria-hidden />
              <span className="search-command-submit-label">{t("searchSubmit")}</span>
            </button>
            <IconTip label={t("clearFilters")}>
              <button
                type="button"
                className="search-command-reset"
                aria-label={t("clearFilters")}
                onClick={resetAll}
              >
                <RotateCcw className="size-[18px]" strokeWidth={1.8} />
              </button>
            </IconTip>
          </div>
        </div>

        {recommendedTags.length ? (
          <div className="search-command-tags">
            <span className="search-command-tags-label">{t("searchRecommendedTags")}</span>
            {recommendedTags.map(([tag]) => (
              <button
                key={tag}
                type="button"
                className={"search-command-tag" + (tagFilter.includes(tag) ? " is-active" : "")}
                aria-pressed={tagFilter.includes(tag)}
                onClick={() => {
                  const next = tagFilter.includes(tag)
                    ? tagFilter.filter((x) => x !== tag)
                    : [...tagFilter, tag];
                  setTagFilter(next);
                  writeParams({ tags: next });
                }}
              >
                #{tag}
              </button>
            ))}
            <span className="search-command-match">
              {t("searchMatchRatio", { n: visible.length, total: scraps.length })}
            </span>
          </div>
        ) : null}

        {calendarOpen || calendarClosing ? (
          <div className={"search-cal-slot" + (calSlide && !calendarClosing ? " is-open" : "")}>
            <div className="search-cal-slot-inner">
              <div
                className={"search-cal-tray" + (calendarClosing ? " is-closing" : "")}
                onAnimationEnd={onCalendarEnd}
              >
                <CalendarFilterPanel
                  scraps={scraps}
                  from={calendarFrom}
                  to={calendarTo}
                  open
                  onOpenChange={setCalendar}
                  onApply={({ from: f, to: tt }) => {
                    setFrom(f);
                    setTo(tt);
                    setCalendarFrom(f);
                    setCalendarTo(tt);
                    writeParams({ from: f, to: tt });
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
      ) : null}

      {libraryEmpty ? (
        <PageEmptyGuide
          eyebrow={t("exploreEmptyAwaiting")}
          title={t("exploreEmptyTitle")}
          body={t("exploreEmptyBody")}
          ctaLabel={t("exploreEmptyCta")}
          onCta={() => navigate("/")}
          showTemplateHints
        />
      ) : (
        <>
          <SearchFacets
            scraps={scraps}
            query={query}
            from={from}
            to={to}
            calendarFrom={calendarFrom}
            calendarTo={calendarTo}
            types={types}
            tags={tagFilter}
            onTypesChange={(next) => {
              setTypes(next);
              writeParams({ types: next });
            }}
            onTagsChange={(next) => {
              setTagFilter(next);
              writeParams({ tags: next });
            }}
            onDateRefine={(f, tt) => {
              setFrom(f);
              setTo(tt);
              writeParams({ from: f, to: tt });
            }}
            onResetFacets={() => {
              setTypes([]);
              setTagFilter([]);
              setFrom(calendarFrom);
              setTo(calendarTo);
              writeParams({ types: [], tags: [], from: calendarFrom, to: calendarTo });
            }}
          />

          <div className="search-results-head">
            <h2 className="search-results-title">{t("searchResultsTitle")}</h2>
            <LayoutSwitch />
          </div>

          <section className="list-body search-page-results" aria-live="polite">
            {loading ? (
              <p className="shelf-empty-hint">{t("shelfLoading")}</p>
            ) : !visible.length ? (
              <div className="shelf-empty shelf-empty--compact">
                <p className="shelf-empty-title">{t("noMatches")}</p>
              </div>
            ) : (
              <ul className={"scrap-list scrap-list--" + (shelfLayout === "gallery" ? "gallery" : "micro")}>
                {paged.slice.map((item, index) => (
                  <ScrapBookCard
                    key={item.id}
                    item={item}
                    index={index}
                    priority={index < 6}
                    row={shelfLayout !== "gallery"}
                  />
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
        </>
      )}
    </div>
  );
}
