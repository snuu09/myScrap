/** Window events so empty-guide UI can drive Stick without importing StickDock. */

export const STICK_FOCUS_EVENT = "mybrary:stick-focus";
export const STICK_ATTACH_EVENT = "mybrary:stick-attach";
export const STICK_SEED_EVENT = "mybrary:stick-seed";

export function focusStick() {
  window.dispatchEvent(new Event(STICK_FOCUS_EVENT));
}

export function attachStick() {
  window.dispatchEvent(new Event(STICK_ATTACH_EVENT));
}

export function seedStick(text: string) {
  window.dispatchEvent(new CustomEvent(STICK_SEED_EVENT, { detail: { text } }));
}
