import { useEffect, useRef, useState, type AnimationEvent } from "react";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Keep a panel mounted until its close animation ends. */
export function usePresence(open: boolean) {
  const [shown, setShown] = useState(open);
  const [closing, setClosing] = useState(false);
  const shownRef = useRef(open);

  function hide() {
    shownRef.current = false;
    setShown(false);
    setClosing(false);
  }

  useEffect(() => {
    if (open) {
      shownRef.current = true;
      setShown(true);
      setClosing(false);
      return;
    }
    if (!shownRef.current) return;
    if (prefersReducedMotion()) {
      hide();
      return;
    }
    setClosing(true);
  }, [open]);

  useEffect(() => {
    if (!closing) return;
    const id = window.setTimeout(hide, 420);
    return () => window.clearTimeout(id);
  }, [closing]);

  function onEnd(event: AnimationEvent<HTMLElement>, name: string) {
    if (event.target !== event.currentTarget) return;
    if (!closing || event.animationName !== name) return;
    hide();
  }

  return { shown, closing, onEnd };
}

export function sheetGenieClass(closing: boolean, from: "bottom" | "corner" = "bottom") {
  return (
    " sheet-genie" +
    (from === "corner" ? " sheet-genie--corner" : " sheet-genie--up") +
    (closing ? " is-out" : "")
  );
}
