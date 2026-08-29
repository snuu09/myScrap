import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { dayKey, monthGrid, scrapsByDay } from "../lib/scrapFilters";
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

export function DayFilterPanel({ scraps, dayFilter, open, onOpenChange, onDayChange }: SharedProps) {
  const { lang } = usePrefs();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const counts = scrapsByDay(scraps);
  const todayKey = dayKey(today.getFullYear(), today.getMonth(), today.getDate());

  useEffect(() => {
    if (!open) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
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
        <button type="button" className="auth-back-btn !size-10" onClick={() => shiftMonth(-1)} aria-label={t(lang, "monthPrev")}>
          <ChevronLeft className="size-5" strokeWidth={1.8} />
        </button>
        <p className="day-filter-month">{monthLabel}</p>
        <button type="button" className="auth-back-btn !size-10" onClick={() => shiftMonth(1)} aria-label={t(lang, "monthNext")}>
          <ChevronRight className="size-5" strokeWidth={1.8} />
        </button>
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
