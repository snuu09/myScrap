import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  label: string;
  children: ReactNode;
  className?: string;
  placement?: "above" | "below";
};

function finePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Hover/focus tip for icon-only controls. Keeps aria-label on the child. */
export function IconTip({ label, children, className = "", placement = "above" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);

  function show() {
    if (!finePointer()) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }

  function hide() {
    setOpen(false);
    setBox(null);
  }

  function onFocus(event: FocusEvent<HTMLSpanElement>) {
    const active = event.target instanceof Element ? event.target : null;
    if (active?.matches(":focus-visible")) show();
  }

  useLayoutEffect(() => {
    if (!open) return;
    const node = ref.current;
    const bubble = bubbleRef.current;
    if (!node || !bubble) return;
    const anchor = node.getBoundingClientRect();
    const size = bubble.getBoundingClientRect();
    const above = placement !== "below" && anchor.top > size.height + 16;
    const left = Math.max(8, Math.min(anchor.left + anchor.width / 2 - size.width / 2, window.innerWidth - size.width - 8));
    const top = above ? anchor.top - 8 - size.height : anchor.bottom + 8;
    setBox({ top, left });
  }, [open, label, placement]);

  useEffect(() => {
    if (!open) return;
    function hideOnMove() {
      setOpen(false);
      setBox(null);
    }
    window.addEventListener("scroll", hideOnMove, true);
    window.addEventListener("resize", hideOnMove);
    return () => {
      window.removeEventListener("scroll", hideOnMove, true);
      window.removeEventListener("resize", hideOnMove);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className={"icon-tip" + (className ? " " + className : "")}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={onFocus}
      onBlur={hide}
    >
      {children}
      {open && typeof document !== "undefined"
        ? createPortal(
            <span
              ref={bubbleRef}
              className="icon-tip-bubble"
              role="tooltip"
              style={{
                top: box?.top ?? -9999,
                left: box?.left ?? 0,
                visibility: box ? "visible" : "hidden",
              }}
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
