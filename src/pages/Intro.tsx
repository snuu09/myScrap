import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { localScrapCount } from "../lib/localScraps";
import "./intro-hero.css";

type Stage = 0 | 1 | 2 | 3;

type Props = { onEnter: () => void };

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
  const [localCount] = useState(() => localScrapCount());
  const timerRef = useRef<number | null>(null);
  const demoTimers = useRef<number[]>([]);

  function clearTimers() {
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    for (const id of demoTimers.current) window.clearTimeout(id);
    demoTimers.current = [];
  }

  function go(next: Stage) {
    setStage(next);
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
    demoTimers.current.push(window.setTimeout(() => go(2), 2700));
    demoTimers.current.push(window.setTimeout(() => go(3), 5200));
  }

  useEffect(() => {
    if (!auto || preferReducedMotion()) return;
    const delay = stage === 0 ? 1600 : 2200;
    timerRef.current = window.setTimeout(() => {
      go(((stage + 1) % 4) as Stage);
    }, delay);
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, [auto, stage]);

  useEffect(() => () => clearTimers(), []);

  const stages: { id: Stage; label: string }[] = [
    { id: 0, label: t(lang, "heroStageAdd") },
    { id: 1, label: t(lang, "heroStageAnalyze") },
    { id: 2, label: t(lang, "heroStageOrganize") },
    { id: 3, label: t(lang, "heroStageShelf") },
  ];

  return (
    <section className="intro-hero" aria-labelledby="intro-hero">
      <div className="intro-hero-copy">
        <p className="intro-hero-eyebrow">{t(lang, "heroEyebrow")}</p>
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

      <div className="intro-hero-workspace" aria-live="polite">
        <div className="intro-hero-bar">
          <div className="intro-hero-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="intro-hero-barlabel">{t(lang, "heroBarLabel")}</div>
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
              {item.label}
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
