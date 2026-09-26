import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import {
  countInRange,
  dayKey,
  formatRangeLabel,
  monthBounds,
  monthGrid,
  monthsInArchiveSpan,
  monthsWithScraps,
  presetRange,
  scrapsByDay,
  scrapsInMonth,
} from "../lib/scrapFilters";
import type { Scrap } from "../lib/types";

export type DateBounds = { from: string | null; to: string | null };

type TriggerProps = {
  from: string | null;
  to: string | null;
  count: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CalendarFilterTrigger({ from, to, count, open, onOpenChange }: TriggerProps) {
  const t = useT();
  const label = formatRangeLabel(from, to, t("calFilterAny"));
  const active = Boolean(from || to);

  return (
    <button
      type="button"
      className={"search-cal-trigger" + (open || active ? " is-active" : "")}
      aria-pressed={open || active}
      aria-expanded={open}
      aria-label={t("calFilterTitle")}
      onClick={() => onOpenChange(!open)}
    >
      <CalendarDays className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden />
      <span className="search-cal-trigger-text">
        <span className="search-cal-trigger-range">{label}</span>
        <span className="search-cal-trigger-count">{t("calFilterCount", { n: count })}</span>
      </span>
    </button>
  );
}

type PanelProps = {
  scraps: Scrap[];
  from: string | null;
  to: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (bounds: DateBounds) => void;
};

type MainTab = "range" | "monthly";
type SubMode = "range" | "single";

function pickInitialMonth(scraps: Scrap[], today: Date) {
  const months = monthsWithScraps(scraps);
  const ty = today.getFullYear();
  const tm = today.getMonth();
  if (months.some((row) => row.year === ty && row.month === tm)) {
    return { year: ty, month: tm };
  }
  if (months.length) {
    const last = months[months.length - 1];
    return { year: last.year, month: last.month };
  }
  return { year: ty, month: tm };
}

function monthIndex(span: { year: number; month: number }[], year: number, month: number) {
  return span.findIndex((row) => row.year === year && row.month === month);
}

export function CalendarFilterPanel({ scraps, from, to, open, onOpenChange, onApply }: PanelProps) {
  const t = useT();
  const { lang } = usePrefs();
  const today = new Date();
  const todayKey = dayKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [mainTab, setMainTab] = useState<MainTab>("range");
  const [subMode, setSubMode] = useState<SubMode>(from && to && from === to ? "single" : "range");
  const [draftFrom, setDraftFrom] = useState<string | null>(from);
  const [draftTo, setDraftTo] = useState<string | null>(to);
  const [rangePick, setRangePick] = useState<"start" | "end">("start");

  const initial = pickInitialMonth(scraps, today);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [archiveYear, setArchiveYear] = useState(initial.year);

  const counts = useMemo(() => scrapsByDay(scraps), [scraps]);
  const monthSpan = useMemo(() => monthsInArchiveSpan(scraps, today), [scraps]);
  const years = useMemo(() => {
    const set = new Set(monthSpan.map((row) => row.year));
    return [...set].sort((a, b) => b - a);
  }, [monthSpan]);

  useEffect(() => {
    if (!open) return;
    setDraftFrom(from);
    setDraftTo(to);
    setSubMode(from && to && from === to ? "single" : "range");
    setRangePick("start");
  }, [open, from, to]);

  useEffect(() => {
    if (!open || !monthSpan.length) return;
    if (monthIndex(monthSpan, viewYear, viewMonth) >= 0) return;
    const last = monthSpan[monthSpan.length - 1];
    setViewYear(last.year);
    setViewMonth(last.month);
  }, [open, monthSpan, viewYear, viewMonth]);

  useEffect(() => {
    if (!open || !years.length) return;
    if (years.includes(archiveYear)) return;
    setArchiveYear(years[0]);
  }, [open, years, archiveYear]);

  useEffect(() => {
    if (!open) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const draftCount = countInRange(scraps, draftFrom, draftTo);

  const presetCounts = useMemo(() => {
    const p7 = presetRange("7d");
    const pm = presetRange("month");
    const p3 = presetRange("3m");
    const ph = presetRange("h1");
    return {
      "7d": countInRange(scraps, p7.from, p7.to),
      month: countInRange(scraps, pm.from, pm.to),
      "3m": countInRange(scraps, p3.from, p3.to),
      h1: countInRange(scraps, ph.from, ph.to),
    };
  }, [scraps]);

  if (!open) return null;

  function applyPreset(kind: "7d" | "month" | "3m" | "h1") {
    const next = presetRange(kind);
    setDraftFrom(next.from);
    setDraftTo(next.to);
    setSubMode("range");
    const d = new Date(+next.to.slice(0, 4), +next.to.slice(5, 7) - 1, 1);
    const idx = monthIndex(monthSpan, d.getFullYear(), d.getMonth());
    if (idx >= 0) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    } else if (monthSpan.length) {
      const last = monthSpan[monthSpan.length - 1];
      setViewYear(last.year);
      setViewMonth(last.month);
    }
  }

  function onCellClick(key: string) {
    if (subMode === "single") {
      setDraftFrom(key);
      setDraftTo(key);
      return;
    }
    if (rangePick === "start" || !draftFrom) {
      setDraftFrom(key);
      setDraftTo(key);
      setRangePick("end");
      return;
    }
    if (key < draftFrom) {
      setDraftTo(draftFrom);
      setDraftFrom(key);
    } else {
      setDraftTo(key);
    }
    setRangePick("start");
  }

  const viewIdx = monthIndex(monthSpan, viewYear, viewMonth);
  const canPrev = viewIdx > 0;
  const canNext = viewIdx >= 0 && viewIdx < monthSpan.length - 1;
  const todayInSpan = monthIndex(monthSpan, today.getFullYear(), today.getMonth()) >= 0;

  function shiftMonth(delta: number) {
    if (viewIdx < 0) return;
    const next = monthSpan[viewIdx + delta];
    if (!next) return;
    setViewYear(next.year);
    setViewMonth(next.month);
  }

  function goToday() {
    if (!todayInSpan) return;
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

  function selectMonth(year: number, month: number) {
    const { from: f, to: tt } = monthBounds(year, month);
    const cappedTo = tt > todayKey ? todayKey : tt;
    if (f > todayKey) return;
    setDraftFrom(f);
    setDraftTo(cappedTo < f ? f : cappedTo);
  }

  const cells = monthGrid(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "long",
  });
  const weekdays =
    lang === "ko" ? ["일", "월", "화", "수", "목", "금", "토"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const showToday =
    todayInSpan && (viewYear !== today.getFullYear() || viewMonth !== today.getMonth());

  const archiveMonths = monthSpan.filter((row) => row.year === archiveYear);
  const archiveYears = years;

  return (
    <div className="cal-filter">
      <div className="cal-filter-head">
        <div className="cal-filter-head-main">
          <CalendarDays className="size-5 shrink-0" strokeWidth={1.8} aria-hidden />
          <h3 className="cal-filter-title">{t("calFilterTitle")}</h3>
          <div className="cal-filter-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mainTab === "range"}
              className={"cal-filter-tab" + (mainTab === "range" ? " is-active" : "")}
              onClick={() => setMainTab("range")}
            >
              {t("calFilterTabRange")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mainTab === "monthly"}
              className={"cal-filter-tab" + (mainTab === "monthly" ? " is-active" : "")}
              onClick={() => setMainTab("monthly")}
            >
              {t("calFilterTabMonth")}
            </button>
          </div>
        </div>
        <button type="button" className="cal-filter-collapse" onClick={() => onOpenChange(false)}>
          <X className="size-4" strokeWidth={1.8} aria-hidden />
          {t("calFilterCollapse")}
        </button>
      </div>

      {mainTab === "range" ? (
        <div className="cal-filter-range">
          <aside className="cal-filter-rail">
            <p className="cal-filter-rail-label">{t("calFilterMode")}</p>
            <button
              type="button"
              className={"cal-filter-mode" + (subMode === "range" ? " is-active" : "")}
              onClick={() => setSubMode("range")}
            >
              <span>{t("calFilterModeRange")}</span>
              {subMode === "range" ? <Check className="size-4" strokeWidth={2} aria-hidden /> : null}
            </button>
            <button
              type="button"
              className={"cal-filter-mode" + (subMode === "single" ? " is-active" : "")}
              onClick={() => {
                setSubMode("single");
                if (draftFrom) setDraftTo(draftFrom);
              }}
            >
              <span>{t("calFilterModeSingle")}</span>
              {draftFrom && subMode === "single" ? (
                <span className="cal-filter-mode-meta">{formatRangeLabel(draftFrom, draftFrom)}</span>
              ) : null}
            </button>

            <hr className="cal-filter-rule" />

            <p className="cal-filter-rail-label">{t("calFilterPresets")}</p>
            {(
              [
                ["7d", "calFilterPreset7d"],
                ["month", "calFilterPresetMonth"],
                ["3m", "calFilterPreset3m"],
                ["h1", "calFilterPresetH1"],
              ] as const
            ).map(([kind, key]) => (
              <button key={kind} type="button" className="cal-filter-preset" onClick={() => applyPreset(kind)}>
                <span>{t(key)}</span>
                <span className="cal-filter-preset-n">{t("calFilterCount", { n: presetCounts[kind] })}</span>
              </button>
            ))}

            <div className="cal-filter-summary">
              <p className="cal-filter-rail-label">{t("calFilterSummary")}</p>
              <p className="cal-filter-summary-range">
                {formatRangeLabel(draftFrom, draftTo, t("calFilterAny"))}
              </p>
              <p className="cal-filter-summary-count">{t("calFilterActiveCount", { n: draftCount })}</p>
            </div>
          </aside>

          <div className="cal-filter-grid-wrap">
            <div className="cal-filter-nav">
              <p className="cal-filter-month">{monthLabel}</p>
              <div className="cal-filter-nav-actions">
                {canPrev ? (
                  <button
                    type="button"
                    className="cal-filter-nav-btn"
                    onClick={() => shiftMonth(-1)}
                    aria-label={t("monthPrev")}
                  >
                    <ChevronLeft className="size-4" strokeWidth={1.8} />
                  </button>
                ) : (
                  <span className="cal-filter-nav-btn cal-filter-nav-btn--ghost" aria-hidden />
                )}
                {showToday ? (
                  <button type="button" className="cal-filter-today" onClick={goToday}>
                    {t("today")}
                  </button>
                ) : null}
                {canNext ? (
                  <button
                    type="button"
                    className="cal-filter-nav-btn"
                    onClick={() => shiftMonth(1)}
                    aria-label={t("monthNext")}
                  >
                    <ChevronRight className="size-4" strokeWidth={1.8} />
                  </button>
                ) : (
                  <span className="cal-filter-nav-btn cal-filter-nav-btn--ghost" aria-hidden />
                )}
              </div>
            </div>

            <div className="cal-filter-weekdays">
              {weekdays.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="cal-filter-grid">
              {cells.map((day, idx) => {
                if (!day) {
                  return <span key={`e-${idx}`} aria-hidden className="cal-filter-cell cal-filter-cell--pad" />;
                }
                const key = dayKey(viewYear, viewMonth, day);
                const count = counts.get(key) || 0;
                const future = key > todayKey;
                const disabled = !count || future;
                const inRange = Boolean(draftFrom && draftTo && key >= draftFrom && key <= draftTo);
                const isStart = draftFrom === key;
                const isEnd = draftTo === key;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    className={
                      "cal-filter-cell" +
                      (inRange ? " is-in-range" : "") +
                      (isStart || isEnd ? " is-edge" : "") +
                      (key === todayKey && !inRange ? " is-today" : "") +
                      (!count || future ? " is-empty" : "")
                    }
                    onClick={() => onCellClick(key)}
                  >
                    <span className="cal-filter-cell-day">{day}</span>
                    <span className="cal-filter-cell-n">
                      {count && !future ? t("calFilterCount", { n: count }) : future ? "" : "0"}
                    </span>
                    {isStart && draftFrom !== draftTo ? (
                      <span className="cal-filter-cell-mark">{t("calFilterStart")}</span>
                    ) : null}
                    {isEnd && draftFrom !== draftTo ? (
                      <span className="cal-filter-cell-mark cal-filter-cell-mark--end">
                        {t("calFilterEnd")}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="cal-filter-monthly">
          <div className="cal-filter-year-row">
            <p className="cal-filter-month">{t("calFilterYearIndex")}</p>
            {archiveYears.length ? (
              <div className="cal-filter-years">
                {archiveYears.map((y) => (
                  <button
                    key={y}
                    type="button"
                    className={"cal-filter-year" + (archiveYear === y ? " is-active" : "")}
                    onClick={() => setArchiveYear(y)}
                  >
                    {t("calFilterYear", { y })}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="cal-filter-months">
            {archiveMonths.map(({ year, month }) => {
              const bounds = monthBounds(year, month);
              const n = scrapsInMonth(scraps, year, month);
              const selected =
                Boolean(draftFrom && draftTo) &&
                draftFrom === bounds.from &&
                draftTo !== null &&
                draftTo >= bounds.from &&
                draftTo <= bounds.to;
              const monthName = new Date(year, month, 1).toLocaleDateString(
                lang === "ko" ? "ko-KR" : "en-US",
                { month: "short" },
              );
              return (
                <button
                  key={`${year}-${month}`}
                  type="button"
                  disabled={!n}
                  className={"cal-filter-month-card" + (selected ? " is-active" : "")}
                  onClick={() => selectMonth(year, month)}
                >
                  <span className="cal-filter-month-card-top">
                    <span>{monthName}</span>
                    <span>{t("calFilterCount", { n })}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="cal-filter-foot">
        <p className="cal-filter-hint">{t("calFilterHint")}</p>
        <div className="cal-filter-foot-actions">
          <button type="button" className="cal-filter-btn-ghost" onClick={() => onOpenChange(false)}>
            {t("calFilterClose")}
          </button>
          <button
            type="button"
            className="cal-filter-btn-apply"
            onClick={() => {
              onApply({ from: draftFrom, to: draftTo });
              onOpenChange(false);
            }}
          >
            {t("calFilterApply", { n: draftCount })}
          </button>
        </div>
      </div>
    </div>
  );
}
