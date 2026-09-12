import type { KeyboardEvent as ReactKeyboardEvent } from "react";

/** True while an IME (e.g. Hangul) is composing; skip Enter/comma commits. */
export function isImeComposing(e: ReactKeyboardEvent | KeyboardEvent): boolean {
  const native = "nativeEvent" in e ? e.nativeEvent : e;
  if (native.isComposing) return true;
  // Some browsers still report keyCode 229 during composition.
  const keyCode = "keyCode" in native ? Number(native.keyCode) : 0;
  return keyCode === 229;
}
