import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Filter, SlidersHorizontal, X } from "lucide-react";
import { spineLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import {
  dayKeysBetween,
  filterScraps,
  formatDayDot,
  formatRangeLabel,
  minMaxDayKeys,
} from "../lib/scrapFilters";
import type { Scrap, ScrapType } from "../lib/types";

const MEDIA_TYPES: ScrapType[] = ["text", "image", "video", "audio", "link", "document"];

type Props = {
  scraps: Scrap[];
  query: string;
  from: string | null;
  to: string | null;
  /** Calendar-applied bounds; refine slider restores to these. */
  calendarFrom: string | null;
  calendarTo: string | null;
  types: string[];
  tags: string[];
  onTypesChange: (types: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  onDateRefine: (from: string | null, to: string | null) => void;
  onResetFacets: () => void;
};

export function SearchFacets({
  scraps,
  query,
  from,
  to,
  calendarFrom,
  calendarTo,
  types,
  tags,
  onTypesChange,
  onTagsChange,
  onDateRefine,
  onResetFacets,
}: Props) {
  const t = useT();
  const { lang } = usePrefs();
  const [mediaOpen, setMediaOpen] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [draftTypes, setDraftTypes] = useState<string[]>(types);

  // Base = query ∩ calendar dates (for media counts)
  const baseForMedia = useMemo(
    () => filterScraps(scraps, { query, from: calendarFrom, to: calendarTo }),
    [scraps, query, calendarFrom, calendarTo],
  );

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: baseForMedia.length, bookmarked: 0 };
    for (const type of MEDIA_TYPES) counts[type] = 0;
    for (const item of baseForMedia) {
      counts[item.type] = (counts[item.type] || 0) + 1;
      if (item.bookmarked) counts.bookmarked += 1;
    }
    return counts;
  }, [baseForMedia]);

  // After type, before tag — for tag frequency
  const afterType = useMemo(
    () =>
      filterScraps(scraps, {
        query,
        from: calendarFrom,
        to: calendarTo,
        types: types.length ? types : ["all"],
      }),
    [scraps, query, calendarFrom, calendarTo, types],
  );

  const tagCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of afterType) {
      for (const tag of item.tags) map.set(tag, (map.get(tag) || 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [afterType]);

  const shownTags = tagsExpanded ? tagCounts : tagCounts.slice(0, 6);
  const moreTags = Math.max(0, tagCounts.length - 6);

  // Slider axis from result set before date refine (query ∩ types ∩ tags, no date)
  const axisScraps = useMemo(
    () =>
      filterScraps(scraps, {
        query,
        types: types.length ? types : ["all"],
        tags,
      }),
    [scraps, query, types, tags],
  );
  const { min: axisMin, max: axisMax } = useMemo(() => minMaxDayKeys(axisScraps), [axisScraps]);
  const axisKeys = useMemo(
    () => (axisMin && axisMax ? dayKeysBetween(axisMin, axisMax) : []),
    [axisMin, axisMax],
  );

  const refineFrom = from || axisMin;
  const refineTo = to || axisMax;
  const fromIdx = refineFrom && axisKeys.length ? Math.max(0, axisKeys.indexOf(refineFrom)) : 0;
  const toIdx =
    refineTo && axisKeys.length
      ? Math.max(fromIdx, axisKeys.indexOf(refineTo) === -1 ? axisKeys.length - 1 : axisKeys.indexOf(refineTo))
      : Math.max(0, axisKeys.length - 1);

  const resultCount = useMemo(
    () => filterScraps(scraps, { query, from, to, types: types.length ? types : ["all"], tags }).length,
    [scraps, query, from, to, types, tags],
  );

  const isAllTypes = !types.length || (types.length === 1 && types[0] === "all");

  function toggleTypeChip(id: string) {
    if (id === "all") {
      onTypesChange([]);
      return;
    }
    if (id === "bookmarked") {
      onTypesChange(types.includes("bookmarked") && types.length === 1 ? [] : ["bookmarked"]);
      return;
    }
    const withoutBookmark = types.filter((x) => x !== "bookmarked" && x !== "all");
    const next = withoutBookmark.includes(id)
      ? withoutBookmark.filter((x) => x !== id)
      : [...withoutBookmark, id];
    onTypesChange(next);
  }

  function openMediaPopover() {
    setDraftTypes(isAllTypes ? MEDIA_TYPES.map(String) : types.filter((x) => x !== "bookmarked"));
    setMediaOpen(true);
  }

  function applyMediaPopover() {
    onTypesChange(draftTypes.length === MEDIA_TYPES.length ? [] : draftTypes);
    setMediaOpen(false);
  }

  function setSlider(which: "from" | "to", idx: number) {
    if (!axisKeys.length) return;
    let a = which === "from" ? idx : fromIdx;
    let b = which === "to" ? idx : toIdx;
    if (a > b) [a, b] = [b, a];
    onDateRefine(axisKeys[a], axisKeys[b]);
  }

  const mediaChips: { id: string; label: string; count: number }[] = [
    { id: "all", label: t("filterAll"), count: typeCounts.all },
    ...(typeCounts.bookmarked > 0
      ? [{ id: "bookmarked", label: spineLabel(lang, "bookmarked"), count: typeCounts.bookmarked }]
      : []),
    ...MEDIA_TYPES.map((type) => ({
      id: type,
      label: spineLabel(lang, type),
      count: typeCounts[type] || 0,
    })),
  ];

  return (
    <section className="search-facets" aria-label={t("searchFacetsTitle")}>
      <div className="search-facets-head">
        <div className="search-facets-head-main">
          <Filter className="size-4 shrink-0" strokeWidth={1.8} aria-hidden />
          <span className="search-facets-title">{t("searchFacetsTitle")}</span>
          <span className="search-facets-sub">{t("searchFacetsSub", { n: resultCount })}</span>
        </div>
        <div className="search-facets-head-actions">
          <button type="button" className="search-facets-tool" onClick={openMediaPopover}>
            <SlidersHorizontal className="size-3.5" strokeWidth={1.8} aria-hidden />
            {t("searchFacetsMediaModal")}
          </button>
          <button type="button" className="search-facets-tool search-facets-tool--quiet" onClick={onResetFacets}>
            {t("searchFacetsReset")}
          </button>
        </div>
      </div>

      <div className="search-facets-grid">
        <div className="search-facets-col">
          <div className="search-facets-col-head">
            <span>
              <span className="search-facets-num">1</span>
              {t("searchFacetsMedia")}
            </span>
            <span className="search-facets-meta">{t("searchFacetsDist", { n: typeCounts.all })}</span>
          </div>
          <div className="search-facets-chips">
            {mediaChips.map((chip) => {
              const active =
                chip.id === "all"
                  ? isAllTypes
                  : chip.id === "bookmarked"
                    ? types.length === 1 && types[0] === "bookmarked"
                    : !isAllTypes && types.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  type="button"
                  className={"search-facet-chip" + (active ? " is-active" : "")}
                  aria-pressed={active}
                  onClick={() => toggleTypeChip(chip.id)}
                >
                  <span>{chip.label}</span>
                  <span className="search-facet-chip-n">{chip.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="search-facets-col">
          <div className="search-facets-col-head">
            <span>
              <span className="search-facets-num">2</span>
              {t("searchFacetsTags")}
            </span>
            <span className="search-facets-meta">{t("searchFacetsTagFreq")}</span>
          </div>
          {tagCounts.length ? (
            <div className="search-facets-chips">
              {shownTags.map(([tag, count]) => (
                <button
                  key={tag}
                  type="button"
                  className={"search-facet-chip search-facet-chip--tag" + (tags.includes(tag) ? " is-active" : "")}
                  aria-pressed={tags.includes(tag)}
                  onClick={() =>
                    onTagsChange(
                      tags.includes(tag) ? tags.filter((x) => x !== tag) : [...tags, tag],
                    )
                  }
                >
                  <span className="search-facet-hash">#</span>
                  {tag}
                  <span className="search-facet-chip-n">({count})</span>
                </button>
              ))}
              {moreTags > 0 ? (
                <button
                  type="button"
                  className="search-facet-chip search-facet-chip--more"
                  onClick={() => setTagsExpanded((v) => !v)}
                >
                  {tagsExpanded ? (
                    <>
                      <ChevronUp className="size-3.5" strokeWidth={1.8} aria-hidden />
                      {t("tagsLess")}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="size-3.5" strokeWidth={1.8} aria-hidden />
                      {t("searchFacetsMoreTags", { n: moreTags })}
                    </>
                  )}
                </button>
              ) : null}
              {tags.length > 1 ? (
                <button
                  type="button"
                  className="search-facet-chip search-facet-chip--more"
                  aria-label={t("clearTags")}
                  onClick={() => onTagsChange([])}
                >
                  <X className="size-3.5" strokeWidth={1.8} />
                </button>
              ) : null}
            </div>
          ) : (
            <p className="search-facets-empty">{t("searchFacetsNoTags")}</p>
          )}
        </div>

        <div className="search-facets-col search-facets-col--date">
          <div className="search-facets-col-head">
            <span>
              <span className="search-facets-num">3</span>
              {t("searchFacetsDate")}
            </span>
            <span className="search-facets-meta">{t("searchFacetsSlider")}</span>
          </div>
          {axisKeys.length > 1 ? (
            <div className="search-facets-slider">
              <div className="search-facets-slider-labels">
                <span>{formatDayDot(axisKeys[fromIdx]).slice(5)} ({t("calFilterStart")})</span>
                <span>~</span>
                <span>{formatDayDot(axisKeys[toIdx]).slice(5)} ({t("calFilterEnd")})</span>
              </div>
              <div className="search-facets-slider-track">
                <input
                  type="range"
                  min={0}
                  max={axisKeys.length - 1}
                  value={fromIdx}
                  aria-label={t("calFilterStart")}
                  onChange={(e) => setSlider("from", Number(e.target.value))}
                />
                <input
                  type="range"
                  min={0}
                  max={axisKeys.length - 1}
                  value={toIdx}
                  aria-label={t("calFilterEnd")}
                  onChange={(e) => setSlider("to", Number(e.target.value))}
                />
              </div>
              <div className="search-facets-slider-foot">
                <span>{t("searchFacetsDateActive", { n: resultCount })}</span>
                <button
                  type="button"
                  className="search-facets-restore"
                  onClick={() => onDateRefine(calendarFrom, calendarTo)}
                >
                  {t("searchFacetsKeepDates")}
                </button>
              </div>
            </div>
          ) : (
            <p className="search-facets-empty">
              {axisKeys.length === 1
                ? formatRangeLabel(axisKeys[0], axisKeys[0])
                : t("searchFacetsNoDates")}
            </p>
          )}
        </div>
      </div>

      {mediaOpen ? (
        <div className="search-facets-popover">
          <div className="search-facets-popover-head">
            <span>{t("searchFacetsMediaPopover")}</span>
            <div className="search-facets-popover-links">
              <button type="button" onClick={() => setDraftTypes(MEDIA_TYPES.map(String))}>
                {t("searchFacetsSelectAll")}
              </button>
              <span aria-hidden>|</span>
              <button type="button" onClick={() => setDraftTypes([])}>
                {t("searchFacetsSelectNone")}
              </button>
            </div>
          </div>
          <div className="search-facets-popover-grid">
            {MEDIA_TYPES.map((type) => {
              const checked = draftTypes.includes(type);
              return (
                <label key={type} className={"search-facets-check" + (checked ? " is-on" : "")}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setDraftTypes((prev) =>
                        checked ? prev.filter((x) => x !== type) : [...prev, type],
                      )
                    }
                  />
                  <span>
                    {spineLabel(lang, type)} ({typeCounts[type] || 0})
                  </span>
                </label>
              );
            })}
          </div>
          <div className="search-facets-popover-foot">
            <button type="button" className="cal-filter-btn-ghost" onClick={() => setMediaOpen(false)}>
              {t("calFilterClose")}
            </button>
            <button type="button" className="cal-filter-btn-apply" onClick={applyMediaPopover}>
              {t("searchFacetsApplyMedia")}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
