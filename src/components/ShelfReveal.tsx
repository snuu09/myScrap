import { useEffect, useState } from "react";

const SESSION_KEY = "mybrary.shelfRevealDone";
/** Hold + open must match CSS (100ms hold + 720ms open). */
const REVEAL_MS = 820;

type Props = { active: boolean; onDone: () => void };

/** One-shot book-open overlay when a session first lands on the shelf. */
export function ShelfReveal({ active, onDone }: Props) {
  const [phase, setPhase] = useState<"idle" | "open" | "done">("idle");

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
    }, REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [active, onDone]);

  if (phase !== "open") return null;

  return (
    <div className="shelf-reveal" aria-hidden>
      <div className="shelf-reveal-stage">
        <div className="shelf-reveal-panel shelf-reveal-panel--left" />
        <div className="shelf-reveal-spine" />
        <div className="shelf-reveal-panel shelf-reveal-panel--right" />
      </div>
    </div>
  );
}
