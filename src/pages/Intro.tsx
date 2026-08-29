import { useEffect, useState } from "react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";

const SPOTS = [
  { id: "sort", title: "sceneSortTitle", body: "sceneSortBody", className: "left-[7%] top-[56%] h-[38%] w-[28%] max-[720px]:left-[8%] max-[720px]:top-[58%] max-[720px]:h-[22%] max-[720px]:w-[54%]" },
  { id: "stick", title: "sceneStickTitle", body: "sceneStickBody", className: "left-[40%] top-[54%] h-[40%] w-[24%] max-[720px]:left-[24%] max-[720px]:top-[68%] max-[720px]:h-[20%] max-[720px]:w-[54%]" },
  { id: "find", title: "sceneFindTitle", body: "sceneFindBody", className: "left-[68%] top-[60%] h-[34%] w-[28%] max-[720px]:left-[42%] max-[720px]:top-[78%] max-[720px]:h-[18%] max-[720px]:w-[54%]" },
] as const;

type Props = { onEnter: () => void };

export function Intro({ onEnter }: Props) {
  const { lang } = usePrefs();
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    function onDoc(ev: MouseEvent) {
      const target = ev.target as HTMLElement | null;
      if (target && target.closest("[data-hotspot]")) return;
      setOpen(null);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  function fine() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  return (
    <section className="flex h-full min-h-0 flex-col" aria-labelledby="intro-hero">
      <article className="relative h-full min-h-[calc(100dvh-60px-7.5rem)] overflow-hidden bg-enamel-deep">
        <div className="intro-hotspots relative h-full min-h-[inherit]">
          <img
            className="intro-still-filter absolute inset-0 size-full object-cover object-[center_42%] pointer-events-none select-none"
            src="/assets/intro-hero.jpg"
            width={1600}
            height={1200}
            alt={t(lang, "sceneHeroAlt")}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[min(42%,18rem)] bg-gradient-to-b from-[color-mix(in_srgb,var(--color-enamel)_78%,transparent)] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[4] flex flex-col items-start gap-3 px-[var(--gutter,clamp(16px,4vw,40px))] pb-3 pt-5">
            <h1
              id="intro-hero"
              className="m-0 max-w-[16ch] text-[clamp(2rem,1.4rem+3vw,3rem)] font-extrabold leading-[1.15] tracking-[-0.045em] text-shadow-[0_1px_16px_color-mix(in_srgb,var(--color-enamel)_70%,transparent)] max-[720px]:max-w-none"
            >
              {t(lang, "loginLead")}
            </h1>
            <button
              type="button"
              className="pointer-events-auto min-h-12 rounded-full bg-magnet px-5 text-[0.9375rem] font-bold tracking-[-0.02em] text-magnet-ink"
              onClick={onEnter}
            >
              {t(lang, "enterCta")}
            </button>
          </div>
          {SPOTS.map((spot) => (
            <button
              key={spot.id}
              type="button"
              data-hotspot={spot.id}
              aria-expanded={open === spot.id}
              className={"intro-hotspot absolute z-[2] flex items-start justify-start border-0 bg-transparent p-2.5 text-left " + spot.className}
              onClick={() => {
                if (fine()) return;
                setOpen((cur) => (cur === spot.id ? null : spot.id));
              }}
            >
              <span className="relative z-[1] grid w-[min(100%,15rem)] gap-0 rounded-[10px] border border-paper-line bg-[color-mix(in_srgb,var(--color-paper)_80%,transparent)] px-3 py-2.5 shadow-[var(--shadow-scrap)]">
                <span className="relative pb-1.5 text-[1.0625rem] font-semibold tracking-[-0.035em] leading-tight after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-magnet after:transition-[width] after:duration-200 group-hover:after:w-5">
                  {t(lang, spot.title)}
                </span>
                <span className="intro-hotspot-body text-[0.8125rem] font-medium leading-snug text-ink-soft">
                  {t(lang, spot.body)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </article>
    </section>
  );
}
