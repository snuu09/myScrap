import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { dayKey, monthGrid, monthsWithScraps, scrapsByDay } from "../lib/scrapFilters";
import type { Scrap } from "../lib/types";

type SharedProps = {
  scraps: Scrap[];
  dayFilter: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDayChange: (day: string | null) => void;
};

export function DayFilterChip({ dayFilter, open, onOpenChange }: Pick<SharedProps, "dayFilter" | "open" | "onOpenChange">) {
  const { lang } = usePrefs();
  return (
    <button
      type="button"
      className="chip-filter"
      aria-pressed={open || Boolean(dayFilter)}
      onClick={() => onOpenChange(!open)}
    >
      {t(lang, "filterByDay")}
    </button>
  );
}

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

export function DayFilterPanel({ scraps, dayFilter, open, onOpenChange, onDayChange }: SharedProps) {
  const { lang } = usePrefs();
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayKey = dayKey(todayYear, todayMonth, today.getDate());

  const dataMonths = useMemo(() => monthsWithScraps(scraps), [scraps]);
  const [viewYear, setViewYear] = useState(() => pickInitialMonth(scraps, today).year);
  const [viewMonth, setViewMonth] = useState(() => pickInitialMonth(scraps, today).month);
  const counts = scrapsByDay(scraps);

  const viewIndex = dataMonths.findIndex((row) => row.year === viewYear && row.month === viewMonth);
  const canPrev = viewIndex > 0 || (viewIndex < 0 && dataMonths.some((row) => row.year < viewYear || (row.year === viewYear && row.month < viewMonth)));
  const canNext = viewIndex >= 0 ? viewIndex < dataMonths.length - 1 : dataMonths.some((row) => row.year > viewYear || (row.year === viewYear && row.month > viewMonth));
  const showToday = viewYear !== todayYear || viewMonth !== todayMonth;

  useEffect(() => {
    if (!open) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open || !dataMonths.length) return;
    const onDataMonth = dataMonths.some((row) => row.year === viewYear && row.month === viewMonth);
    if (onDataMonth) return;
    const next = pickInitialMonth(scraps, new Date());
    setViewYear(next.year);
    setViewMonth(next.month);
  }, [open, dataMonths, scraps, viewYear, viewMonth]);

  if (!open) return null;

  function shiftMonth(delta: number) {
    if (!dataMonths.length) return;
    let idx = dataMonths.findIndex((row) => row.year === viewYear && row.month === viewMonth);
    if (idx < 0) {
      idx = dataMonths.findIndex((row) => row.year > viewYear || (row.year === viewYear && row.month > viewMonth));
      if (delta < 0) {
        idx = idx < 0 ? dataMonths.length - 1 : idx - 1;
      } else if (idx < 0) {
        idx = dataMonths.length - 1;
      }
    } else {
      idx += delta;
    }
    if (idx < 0 || idx >= dataMonths.length) return;
    setViewYear(dataMonths[idx].year);
    setViewMonth(dataMonths[idx].month);
  }

  function goToday() {
    setViewYear(todayYear);
    setViewMonth(todayMonth);
  }

  const cells = monthGrid(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "long",
  });
  const weekdays =
    lang === "ko" ? ["일", "월", "화", "수", "목", "금", "토"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="day-filter-panel">
      <div className="day-filter-nav">
        {canPrev ? (
          <button
            type="button"
            className="auth-back-btn !size-10"
            onClick={() => shiftMonth(-1)}
            aria-label={t(lang, "monthPrev")}
          >
            <ChevronLeft className="size-5" strokeWidth={1.8} />
          </button>
        ) : (
          <span className="size-10 shrink-0" aria-hidden />
        )}
        <div className="day-filter-month-wrap">
          <p className="day-filter-month">{monthLabel}</p>
          {showToday ? (
            <button type="button" className="day-filter-today" onClick={goToday}>
              {t(lang, "today")}
            </button>
          ) : null}
        </div>
        {canNext ? (
          <button
            type="button"
            className="auth-back-btn !size-10"
            onClick={() => shiftMonth(1)}
            aria-label={t(lang, "monthNext")}
          >
            <ChevronRight className="size-5" strokeWidth={1.8} />
          </button>
        ) : (
          <span className="size-10 shrink-0" aria-hidden />
        )}
      </div>
      <div className="day-filter-weekdays">
        {weekdays.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="day-filter-grid">
        {cells.map((day, idx) => {
          if (!day) return <span key={`e-${idx}`} aria-hidden />;
          const key = dayKey(viewYear, viewMonth, day);
          const count = counts.get(key) || 0;
          const selected = dayFilter === key;
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              type="button"
              disabled={!count}
              aria-pressed={selected}
              className={
                "day-filter-cell" +
                (selected ? " day-filter-cell--selected" : "") +
                (isToday && !selected ? " day-filter-cell--today" : "") +
                (!count ? " day-filter-cell--empty" : "")
              }
              onClick={() => onDayChange(selected ? null : key)}
            >
              <span>{day}</span>
              {count ? <span className="day-filter-count">{count}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
