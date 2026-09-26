import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { localScrapCount } from "../lib/localScraps";
import "./intro-hero.css";

type Stage = 0 | 1 | 2 | 3;
type FilmPhase = "hold" | "settle" | "play";

type Props = { onEnter: () => void };

/** Auto-loop dwell per stage (ms). Stage 1 aligns with analyze progress. */
const STAGE_DWELL = [2400, 3200, 2800, 3000] as const;
const FILM_HOLD_MS = 1500;
const FILM_SETTLE_MS = 1600;

const PRESETS = [
  { key: "heroPresetMemo" as const, value: "사피엔스, 읽고 나서 오래 생각하게 된 책." },
  { key: "heroPresetLink" as const, value: "https://example.com/article/future-of-learning" },
  { key: "heroPresetVideo" as const, value: "How Ideas Become Culture · 42:18" },
];

const BOOKS = [
  {
    cover: "c1",
    kind: "NOTE",
    title: ["생각은", "어떻게", "깊어지는가"],
    stamp: "MYBRARY",
    name: "오래 생각하게 된 것",
    meta: "생각",
  },
  {
    cover: "c2",
    kind: "ARTICLE",
    title: ["The Future", "of Learning"],
    stamp: "AI SUMMARY",
    name: "배움에 관한 글",
    meta: "공부",
  },
  {
    cover: "c3",
    kind: "VIDEO",
    title: ["How Ideas", "Become", "Culture"],
    stamp: "42:18",
    name: "아이디어가 퍼지는 방식",
    meta: "영감",
  },
  {
    cover: "c4",
    kind: "FILE / PDF",
    title: ["Designing", "Better", "Habits"],
    stamp: "12 PAGES",
    name: "습관을 설계하는 법",
    meta: "라이프",
  },
  {
    cover: "c5",
    kind: "IMAGE",
    title: ["A Room", "of One's", "Own"],
    stamp: "COLLECTED",
    name: "간직하고 싶은 이미지",
    meta: "영감",
  },
  {
    cover: "c6",
    kind: "LINK / TEXT",
    title: ["사피엔스"],
    stamp: "NOTES",
    name: "오래 생각하게 된 책",
    meta: "책",
  },
] as const;

const TYPES = ["TEXT", "LINK", "VIDEO", "FILE", "IMAGE"] as const;

function preferReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Intro({ onEnter }: Props) {
  const { lang } = usePrefs();
  const [stage, setStage] = useState<Stage>(0);
  const [auto, setAuto] = useState(true);
  const [source, setSource] = useState("");
  const [progressRun, setProgressRun] = useState(false);
  const [stageTick, setStageTick] = useState(0);
  const [film, setFilm] = useState<FilmPhase>(() => (preferReducedMotion() ? "play" : "hold"));
  const [localCount] = useState(() => localScrapCount());
  const timerRef = useRef<number | null>(null);
  const demoTimers = useRef<number[]>([]);
  const filmTimers = useRef<number[]>([]);
  const bootMarkRef = useRef<HTMLParagraphElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);

  function clearTimers() {
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    for (const id of demoTimers.current) window.clearTimeout(id);
    demoTimers.current = [];
  }

  function clearFilmTimers() {
    for (const id of filmTimers.current) window.clearTimeout(id);
    filmTimers.current = [];
  }

  function go(next: Stage) {
    setStage(next);
    setStageTick((n) => n + 1);
    if (next === 1) {
      setProgressRun(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setProgressRun(true));
      });
    } else {
      setProgressRun(false);
    }
  }

  function stopAuto() {
    setAuto(false);
    clearTimers();
  }

  function fill(value: string) {
    setSource(value);
    stopAuto();
  }

  function startDemo() {
    const text = source.trim() || t(lang, "heroDefaultInput");
    setSource(text);
    stopAuto();
    go(1);
    if (preferReducedMotion()) {
      demoTimers.current.push(window.setTimeout(() => go(2), 400));
      demoTimers.current.push(window.setTimeout(() => go(3), 800));
      return;
    }
    demoTimers.current.push(window.setTimeout(() => go(2), STAGE_DWELL[1]));
    demoTimers.current.push(window.setTimeout(() => go(3), STAGE_DWELL[1] + STAGE_DWELL[2]));
  }

  useEffect(() => {
    const prev = history.scrollRestoration;
    try {
      history.scrollRestoration = "manual";
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    return () => {
      try {
        history.scrollRestoration = prev;
      } catch {
        /* ignore */
      }
    };
  }, []);

  useEffect(() => {
    if (preferReducedMotion()) {
      setFilm("play");
      return;
    }

    clearFilmTimers();
    filmTimers.current.push(
      window.setTimeout(() => {
        const mark = bootMarkRef.current;
        const dest = eyebrowRef.current;
        if (!mark || !dest) {
          setFilm("play");
          return;
        }

        // Freeze boot-in, then pin the mark in viewport space so we can morph
        // font-size / position continuously (scale FLIP looked like a teleport).
        mark.style.animation = "none";
        mark.style.transform = "none";
        void mark.offsetWidth;

        const a = mark.getBoundingClientRect();
        const b = dest.getBoundingClientRect();
        // Dest can be opacity:0; still laid out. Guard against a collapsed box.
        if (b.width < 2 || b.height < 2) {
          setFilm("play");
          return;
        }
        const fromSize = getComputedStyle(mark).fontSize;
        const toSize = getComputedStyle(dest).fontSize;

        mark.style.position = "fixed";
        mark.style.left = `${a.left}px`;
        mark.style.top = `${a.top}px`;
        mark.style.margin = "0";
        mark.style.width = "max-content";
        mark.style.fontSize = fromSize;
        mark.style.letterSpacing = "0.14em";
        mark.style.transformOrigin = "left top";
        mark.style.zIndex = "41";

        // One frame so fixed pinning sticks before the morph runs.
        void mark.offsetWidth;
        setFilm("settle");

        let settled = false;
        function finish() {
          if (settled) return;
          settled = true;
          setFilm("play");
        }

        requestAnimationFrame(() => {
          const anim = mark.animate(
            [
              {
                left: `${a.left}px`,
                top: `${a.top}px`,
                fontSize: fromSize,
                letterSpacing: "0.14em",
              },
              {
                left: `${b.left}px`,
                top: `${b.top}px`,
                fontSize: toSize,
                letterSpacing: "0.2em",
              },
            ],
            {
              duration: FILM_SETTLE_MS,
              easing: "cubic-bezier(0.33, 0.1, 0.25, 1)",
              fill: "forwards",
            },
          );

          anim.addEventListener("finish", finish);
          filmTimers.current.push(window.setTimeout(finish, FILM_SETTLE_MS + 120));
        });
      }, FILM_HOLD_MS),
    );

    return () => clearFilmTimers();
  }, []);

  useEffect(() => {
    if (film !== "play" || !auto || preferReducedMotion()) return;
    timerRef.current = window.setTimeout(() => {
      go(((stage + 1) % 4) as Stage);
    }, STAGE_DWELL[stage]);
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, [auto, stage, film]);

  useEffect(
    () => () => {
      clearTimers();
      clearFilmTimers();
    },
    [],
  );

  const stages: { id: Stage; label: string }[] = [
    { id: 0, label: t(lang, "heroStageAdd") },
    { id: 1, label: t(lang, "heroStageAnalyze") },
    { id: 2, label: t(lang, "heroStageOrganize") },
    { id: 3, label: t(lang, "heroStageShelf") },
  ];

  const activeLabel = stages[stage]?.label ?? t(lang, "heroBarLabel");
  const dwellMs = STAGE_DWELL[stage];
  const eyebrow = t(lang, "heroEyebrow");
  const booting = film !== "play";

  return (
    <section
      className={
        "intro-hero" +
        (film === "play" ? " is-playing" : " is-booting") +
        (film === "settle" ? " is-settling" : "")
      }
      aria-labelledby="intro-hero"
    >
      {booting ? (
        <div className="intro-hero-boot" aria-hidden>
          <p ref={bootMarkRef} className="intro-hero-boot-mark">
            {eyebrow}
          </p>
        </div>
      ) : null}

      <div className="intro-hero-copy">
        <p ref={eyebrowRef} className="intro-hero-eyebrow">
          {eyebrow}
        </p>
        <h1 id="intro-hero" className="intro-hero-title">
          {t(lang, "heroHeadlineBefore")}
          <br />
          <em>{t(lang, "heroHeadlineEm")}</em>
          {t(lang, "heroHeadlineAfter")}
        </h1>
        <p className="intro-hero-sub">{t(lang, "heroSub")}</p>
        <div className="intro-hero-types" aria-hidden="true">
          {TYPES.map((type) => (
            <span key={type}>{type}</span>
          ))}
        </div>
      </div>

      <div
        className="intro-hero-workspace"
        data-stage={stage}
        data-auto={auto ? "1" : "0"}
        aria-live="polite"
      >
        <div className="intro-hero-bar">
          <div className="intro-hero-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="intro-hero-barlabel">
            <span className="intro-hero-barlabel-base">{t(lang, "heroBarLabel")}</span>
            <span className="intro-hero-barlabel-sep" aria-hidden>
              ·
            </span>
            <span className="intro-hero-barlabel-stage">{activeLabel}</span>
          </div>
          <span />
        </div>

        <div className="intro-hero-content">
          <div className={"intro-hero-state intro-hero-add" + (stage === 0 ? " is-active" : "")}>
            <div className="intro-hero-addbox">
              <label htmlFor="intro-hero-source">{t(lang, "heroInputLabel")}</label>
              <div className="intro-hero-inputrow">
                <input
                  id="intro-hero-source"
                  value={source}
                  placeholder={t(lang, "heroInputPlaceholder")}
                  onChange={(ev) => {
                    setSource(ev.target.value);
                    stopAuto();
                  }}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter") startDemo();
                  }}
                />
                <button type="button" className="intro-hero-addbtn" onClick={startDemo}>
                  {t(lang, "heroAdd")}
                </button>
              </div>
              <p className="intro-hero-hint">{t(lang, "heroHint")}</p>
              <div className="intro-hero-presets">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    className="intro-hero-preset"
                    onClick={() => fill(preset.value)}
                  >
                    {t(lang, preset.key)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={"intro-hero-state intro-hero-analysis" + (stage === 1 ? " is-active" : "")}>
            <div className="intro-hero-pulse" aria-hidden="true" />
            <h3>{t(lang, "heroAnalyzeTitle")}</h3>
            <p>{t(lang, "heroAnalyzeBody")}</p>
            <div className="intro-hero-readlines" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="intro-hero-scan" aria-hidden="true" />
            <div className={"intro-hero-progress" + (progressRun ? " is-run" : "")} aria-hidden="true">
              <i />
            </div>
          </div>

          <div className={"intro-hero-state intro-hero-result" + (stage === 2 ? " is-active" : "")}>
            <div className="intro-hero-resulttop">
              <div className="intro-hero-resultcover">
                <small>MYBRARY / AI</small>
                <b>{t(lang, "heroResultCover")}</b>
                <small>COLLECTED</small>
              </div>
              <div className="intro-hero-resulttext">
                <div className="intro-hero-tagline">AI SUMMARY</div>
                <h3>{t(lang, "heroResultTitle")}</h3>
                <p>{t(lang, "heroResultBody")}</p>
                <div className="intro-hero-chips">
                  <span>{t(lang, "heroChipThink")}</span>
                  <span>{t(lang, "heroChipHumanities")}</span>
                  <span>{t(lang, "heroChipBook")}</span>
                </div>
              </div>
            </div>
            <div className="intro-hero-resultbottom">
              <div className="intro-hero-info">
                <b>SUMMARY</b>
                <p>{t(lang, "heroInfoSummary")}</p>
              </div>
              <div className="intro-hero-info">
                <b>SUGGESTED SHELF</b>
                <p>{t(lang, "heroInfoShelf")}</p>
              </div>
            </div>
          </div>

          <div className={"intro-hero-state intro-hero-shelf" + (stage === 3 ? " is-active" : "")}>
            <div className="intro-hero-shelfhead">
              <div>
                <h2>{t(lang, "heroShelfTitle")}</h2>
                <p>{t(lang, "heroShelfBody")}</p>
              </div>
              <span className="intro-hero-count">{t(lang, "heroShelfCount")}</span>
            </div>
            <div className="intro-hero-books">
              {BOOKS.map((book) => (
                <div key={book.name} className="intro-hero-book">
                  <div className={"intro-hero-cover " + book.cover}>
                    <small>{book.kind}</small>
                    <strong>
                      {book.title.map((line, i) => (
                        <span key={line}>
                          {i > 0 ? <br /> : null}
                          {line}
                        </span>
                      ))}
                    </strong>
                    <small>{book.stamp}</small>
                  </div>
                  <div className="intro-hero-bookname">{book.name}</div>
                  <div className="intro-hero-bookmeta">{book.meta}</div>
                </div>
              ))}
            </div>
            <div className="intro-hero-shelfline" aria-hidden="true" />
          </div>
        </div>

        <nav className="intro-hero-controls" aria-label={t(lang, "heroStagesLabel")}>
          {stages.map((item) => (
            <button
              key={item.id}
              type="button"
              className={"intro-hero-control" + (stage === item.id ? " is-on" : "")}
              aria-current={stage === item.id ? "step" : undefined}
              onClick={() => {
                stopAuto();
                go(item.id);
              }}
            >
              <span className="intro-hero-control-label">{item.label}</span>
              {stage === item.id ? (
                <span
                  key={`${stageTick}-${item.id}`}
                  className="intro-hero-control-scrub"
                  style={{ ["--intro-dwell" as string]: `${dwellMs}ms` }}
                  aria-hidden
                />
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      <p className="intro-hero-manual">
        {t(lang, "heroAutoLabel")}{" "}
        <button
          type="button"
          onClick={() => {
            const next = !auto;
            setAuto(next);
            clearTimers();
            if (next && !preferReducedMotion()) {
              timerRef.current = window.setTimeout(() => go(((stage + 1) % 4) as Stage), 400);
            }
          }}
        >
          {auto ? t(lang, "heroAutoPause") : t(lang, "heroAutoPlay")}
        </button>{" "}
        · {t(lang, "heroAutoHint")}
      </p>

      <div className="intro-hero-cta">
        <button type="button" className="btn-primary" onClick={onEnter}>
          {t(lang, "enterCta")}
        </button>
        {localCount > 0 ? (
          <button type="button" className="btn-ghost" onClick={onEnter}>
            {t(lang, "guestResumeCta")}
          </button>
        ) : null}
      </div>
    </section>
  );
}
