import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { usePrefs } from "../context/Prefs";

type Pip = { x: number; y: number; w: number; h: number; on: boolean };

type Props = {
  children: ReactNode;
  className?: string;
  label?: string;
  /** Keep the glass disc on the pressed control when the pointer leaves. */
  restOnPressed?: boolean;
  /** Hover disc mixes a little magnet so a submit label stays readable. */
  magnet?: boolean;
  /** Pointer-origin ripple. Login submit, leave, and DB reset only. */
  ripple?: boolean;
};

function controlOf(node: EventTarget | null) {
  if (!(node instanceof Element)) return null;
  const hit = node.closest("button, a");
  return hit instanceof HTMLElement ? hit : null;
}

type Ripple = { id: number; x: number; y: number };

/** Circular glass disc that slides between controls in a cluster. */
export function GlassCluster({
  children,
  className = "",
  label,
  restOnPressed = false,
  magnet = false,
  ripple = false,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pip, setPip] = useState<Pip>({ x: 0, y: 0, w: 0, h: 0, on: false });
  const [ripples, setRipples] = useState<Ripple[]>([]);

  function measure(track: HTMLElement, el: HTMLElement): Pip {
    const from = track.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const scaleX = track.offsetWidth ? from.width / track.offsetWidth : 1;
    const scaleY = track.offsetHeight ? from.height / track.offsetHeight : 1;
    return {
      x: (box.left - from.left) / scaleX,
      y: (box.top - from.top) / scaleY,
      w: box.width / scaleX,
      h: box.height / scaleY,
      on: true,
    };
  }

  function place(el: HTMLElement | null) {
    const track = trackRef.current;
    if (!track || !el) {
      setPip((cur) => ({ ...cur, on: false }));
      return;
    }
    setPip(measure(track, el));
  }

  function pressedControl() {
    return trackRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]') || null;
  }

  useLayoutEffect(() => {
    if (!restOnPressed) return;
    const track = trackRef.current;
    const el = pressedControl();
    if (!track || !el) return;
    const next = measure(track, el);
    setPip((cur) =>
      cur.on === next.on && cur.x === next.x && cur.y === next.y && cur.w === next.w && cur.h === next.h ? cur : next,
    );
  });

  useEffect(() => {
    if (!restOnPressed) return;
    function remeasure() {
      const track = trackRef.current;
      const el = pressedControl();
      if (!track || !el) return;
      setPip(measure(track, el));
    }
    window.addEventListener("animationend", remeasure);
    return () => window.removeEventListener("animationend", remeasure);
  }, [restOnPressed]);

  function onOver(event: PointerEvent<HTMLDivElement>) {
    const hit = controlOf(event.target);
    if (hit && trackRef.current?.contains(hit)) place(hit);
  }

  function onLeave() {
    place(restOnPressed ? pressedControl() : null);
  }

  function onDown(event: PointerEvent<HTMLDivElement>) {
    if (!ripple) return;
    const track = trackRef.current;
    const hit = controlOf(event.target);
    if (!track || !hit || hit.hasAttribute("disabled")) return;
    const from = track.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRipples((cur) => [...cur, { id, x: event.clientX - from.left, y: event.clientY - from.top }]);
    window.setTimeout(() => {
      setRipples((cur) => cur.filter((item) => item.id !== id));
    }, 480);
  }

  return (
    <div
      ref={trackRef}
      className={
        "glass-cluster liquid-glass" +
        (magnet ? " glass-cluster--magnet" : "") +
        (ripple ? " glass-cluster--ripple" : "") +
        (className ? " " + className : "")
      }
      role="group"
      aria-label={label}
      onPointerOver={onOver}
      onPointerDown={onDown}
      onPointerLeave={onLeave}
      onFocus={(event) => {
        const hit = controlOf(event.target);
        if (hit) place(hit);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onLeave();
      }}
    >
      <span
        className={"glass-pip" + (pip.on ? " is-on" : "")}
        style={{
          width: pip.w,
          height: pip.h,
          transform: `translate(${pip.x}px, ${pip.y}px)`,
        }}
        aria-hidden
      />
      {ripples.map((item) => (
        <span
          key={item.id}
          className="glass-ripple"
          style={{ left: item.x, top: item.y }}
          aria-hidden
        />
      ))}
      {children}
    </div>
  );
}

/** Glass look groups tag chips so the magnet disc follows hover. Library keeps the chips plain. */
export function TagCluster({ children, label }: { children: ReactNode; label?: string }) {
  const { look } = usePrefs();
  if (look !== "glass") return <>{children}</>;
  return (
    <GlassCluster className="tag-cluster" label={label} magnet>
      {children}
    </GlassCluster>
  );
}
