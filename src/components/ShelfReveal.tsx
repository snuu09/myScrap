import { useEffect, useState } from "react";

const SESSION_KEY = "mybrary.shelfRevealDone";

type Props = { active: boolean; onDone: () => void };

/** One-shot door-open overlay when a session first lands on the shelf. */
export function ShelfReveal({ active, onDone }: Props) {
  const [phase, setPhase] = useState<"idle" | "open" | "done">("idle");
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    if (!active) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        onDone();
        return;
      }
    } catch {
      /* ignore */
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      onDone();
      return;
    }
    setPhase("open");
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      setPhase("done");
      onDone();
    }, 320);
    return () => window.clearTimeout(timer);
  }, [active, onDone]);

  useEffect(() => {
    if (phase !== "open") return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    function onMove(ev: PointerEvent) {
      const x = (ev.clientX / window.innerWidth - 0.5) * 8;
      setParallax(Math.max(-4, Math.min(4, x)));
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [phase]);

  if (phase !== "open") return null;

  return (
    <div className="shelf-reveal" aria-hidden>
      <div className="shelf-reveal-panel shelf-reveal-panel--left" style={{ transform: `translateX(${-parallax}px)` }} />
      <div className="shelf-reveal-panel shelf-reveal-panel--right" style={{ transform: `translateX(${parallax}px)` }} />
    </div>
  );
}
