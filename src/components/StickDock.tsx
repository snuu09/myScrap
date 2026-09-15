import type { AnimationEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUp, Camera, Clipboard, FileUp, ImageIcon, Plus } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useDialog } from "../lib/dialog";
import { isImeComposing } from "../lib/ime";
import { IconTip } from "./IconTip";
import { sheetGenieClass, usePresence } from "../lib/presence";

export const CLOSE_OVERLAYS_EVENT = "mybrary:close-overlays";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmitText: () => void;
  onFiles: (files: FileList | File[]) => void;
  dropping: boolean;
  disabled?: boolean;
  disabledHint?: string;
  draftSlot?: ReactNode;
  below?: ReactNode;
  /** Inline composer for sheets (no fixed bottom float). */
  embedded?: boolean;
};

export function StickDock({
  value,
  onChange,
  onSubmitText,
  onFiles,
  dropping,
  disabled,
  disabledHint,
  draftSlot,
  below,
  embedded = false,
}: Props) {
  const { lang } = usePrefs();
  const { alert } = useDialog();
  const [menu, setMenu] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const menuRef = useRef(false);
  const menuClosingRef = useRef(false);
  menuRef.current = menu;
  menuClosingRef.current = menuClosing;
  const [over, setOver] = useState(false);
  const [yielding, setYielding] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const draftHeld = useRef(draftSlot);
  if (draftSlot) draftHeld.current = draftSlot;
  const draftPresence = usePresence(Boolean(draftSlot));
  const canSend = Boolean(value.trim()) && !disabled;
  const expanded = value.includes("\n") || value.length > 48;

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.style.height = "auto";
    const floor = value ? 36 : 48;
    const next = expanded ? Math.min(el.scrollHeight, 160) : Math.min(el.scrollHeight, floor);
    el.style.height = `${Math.max(next, floor)}px`;
  }, [value, expanded]);

  function closeMenu() {
    if (!menuRef.current || menuClosingRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMenu(false);
      setMenuClosing(false);
      return;
    }
    setMenuClosing(true);
    window.setTimeout(() => {
      if (!menuClosingRef.current) return;
      setMenu(false);
      setMenuClosing(false);
    }, 420);
  }

  function onMenuEnd(event: AnimationEvent<HTMLDivElement>) {
    if (!menuClosingRef.current) return;
    const item = event.target;
    if (!(item instanceof HTMLElement) || !item.classList.contains("composer-chat-menu-item")) return;
    if (item !== item.parentElement?.lastElementChild) return;
    if (event.animationName !== "composer-item-out") return;
    setMenu(false);
    setMenuClosing(false);
  }

  useEffect(() => {
    function onCloseOverlays() {
      closeMenu();
    }
    window.addEventListener(CLOSE_OVERLAYS_EVENT, onCloseOverlays);
    return () => window.removeEventListener(CLOSE_OVERLAYS_EVENT, onCloseOverlays);
  }, []);

  useEffect(() => {
    let last = window.scrollY;
    let timer = 0;
    function onScroll() {
      const y = window.scrollY;
      const down = y > last + 4;
      const up = y < last - 4;
      last = y;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const nearBottom = max - y < 160;
      setOver(y > 24);
      if (up || nearBottom || y <= 48) setYielding(false);
      else if (down) setYielding(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setYielding(false), 180);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (draftSlot) closeMenu();
  }, [draftSlot]);

  useEffect(() => {
    function onPaste(ev: ClipboardEvent) {
      if (disabled) return;
      const target = ev.target;
      if (target instanceof HTMLElement) {
        const field = target.closest("input, textarea, select, [contenteditable='true']");
        if (field && field !== fieldRef.current) return;
        if (field === fieldRef.current) return;
      }
      const data = ev.clipboardData;
      if (!data) return;
      if (data.files?.length) {
        ev.preventDefault();
        onFiles(data.files);
        return;
      }
      const text = data.getData("text/plain");
      if (!text) return;
      ev.preventDefault();
      const el = fieldRef.current;
      const start = el?.selectionStart ?? value.length;
      const end = el?.selectionEnd ?? start;
      const next = value.slice(0, start) + text + value.slice(end);
      onChange(next);
      const caret = start + text.length;
      requestAnimationFrame(() => {
        el?.focus();
        el?.setSelectionRange(caret, caret);
      });
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [disabled, onChange, onFiles, value]);

  useEffect(() => {
    if (!menu) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") closeMenu();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  async function readClipboard() {
    if (disabled) {
      await alert(disabledHint || t(lang, "trialExpiredMsg"));
      return;
    }
    try {
      if (!navigator.clipboard?.read) {
        await alert(t(lang, "clipboardUnsupported"));
        return;
      }
      const items = await navigator.clipboard.read();
      const files: File[] = [];
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            files.push(new File([blob], "clipboard.png", { type: blob.type }));
          }
        }
      }
      if (files.length) {
        onFiles(files);
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        onChange(text);
        return;
      }
      await alert(t(lang, "clipboardEmpty"));
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError") await alert(t(lang, "clipboardDenied"));
      else await alert(t(lang, "clipboardEmpty"));
    }
  }

  async function guardDisabled() {
    if (!disabled) return false;
    await alert(disabledHint || t(lang, "trialExpiredMsg"));
    return true;
  }

  async function submit() {
    if (await guardDisabled()) return;
    if (!value.trim()) return;
    onSubmitText();
  }

  async function openMenu() {
    if (await guardDisabled()) return;
    window.dispatchEvent(new Event(CLOSE_OVERLAYS_EVENT));
    setMenuClosing(false);
    setMenu(true);
  }

  /** Snapshot before clearing input value; FileList is live and empties after value="". */
  function emitFiles(list: FileList | null) {
    if (!list?.length) return;
    onFiles(Array.from(list));
  }

  return (
    <>
      {menu && typeof document !== "undefined"
        ? createPortal(
            <button
              type="button"
              className="stick-menu-scrim"
              aria-label={t(lang, "close")}
              onClick={() => closeMenu()}
            />,
            document.body,
          )
        : null}
      {draftPresence.shown ? <div className="classify-draft-scrim" aria-hidden /> : null}
      <div
        className={
          "stick-float" +
          (embedded ? " stick-float--embedded" : "") +
          (draftPresence.shown ? " stick-float--sheet" : "") +
          (!draftPresence.shown && over ? " stick-float--over" : "") +
          (!draftPresence.shown && yielding ? " stick-float--yielding" : "") +
          (menu && !menuClosing ? " stick-float--menu" : "")
        }
        aria-label={t(lang, "composerLabel")}
      >
        <div className="stick-float-inner">
          {dropping ? <div className="stick-float-drop">{t(lang, "dropOverlay")}</div> : null}
          {draftPresence.shown ? (
            <section
              className={"classify-draft classify-draft--sheet" + sheetGenieClass(draftPresence.closing)}
              aria-label={t(lang, "classifyTitle")}
              onAnimationEnd={(event) => draftPresence.onEnd(event, "sheet-genie-out")}
            >
              {draftSlot ?? draftHeld.current}
            </section>
          ) : null}
          <div
            className={
              "composer-chat" +
              (disabled ? " composer-chat--disabled" : "") +
              (expanded ? " composer-chat--expanded" : " composer-chat--compact")
            }
          >
            <div className="composer-chat-row">
              <div className="relative shrink-0">
                <IconTip label={t(lang, "addMenu")}>
                  <button
                    type="button"
                    className="composer-chat-plus"
                    aria-label={t(lang, "addMenu")}
                    aria-expanded={menu && !menuClosing}
                    aria-haspopup="menu"
                    disabled={disabled}
                    onClick={() => {
                      if (menu && !menuClosing) closeMenu();
                      else void openMenu();
                    }}
                  >
                    <Plus className="size-5" strokeWidth={1.8} />
                  </button>
                </IconTip>
                {menu ? (
                  <div
                    className={"composer-chat-menu" + (menuClosing ? " is-out" : "")}
                    role="menu"
                    onAnimationEnd={onMenuEnd}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="composer-chat-menu-item"
                      onClick={() => {
                        closeMenu();
                        void readClipboard();
                      }}
                    >
                      <Clipboard className="size-4" /> {t(lang, "clipboard")}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="composer-chat-menu-item hidden max-[720px]:flex"
                      onClick={() => {
                        cameraRef.current?.click();
                        closeMenu();
                      }}
                    >
                      <Camera className="size-4" /> {t(lang, "camera")}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="composer-chat-menu-item"
                      onClick={() => {
                        photoRef.current?.click();
                        closeMenu();
                      }}
                    >
                      <ImageIcon className="size-4" /> {t(lang, "photo")}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="composer-chat-menu-item"
                      onClick={() => {
                        fileRef.current?.click();
                        closeMenu();
                      }}
                    >
                      <FileUp className="size-4" /> {t(lang, "file")}
                    </button>
                  </div>
                ) : null}
              </div>
              <label className="sr-only" htmlFor="composer">
                {t(lang, "composerLabel")}
              </label>
              <div className={"composer-chat-field-wrap" + (value ? "" : " is-empty")}>
              {!value ? (
                <span className="composer-chat-hint" aria-hidden>
                  {t(lang, "placeholder")}
                </span>
              ) : null}
              <textarea
                id="composer"
                ref={fieldRef}
                rows={1}
                value={value}
                placeholder=""
                onChange={(e) => onChange(e.target.value)}
                onPaste={(e) => {
                  if (!e.clipboardData.files?.length) return;
                  e.preventDefault();
                  onFiles(e.clipboardData.files);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    if (isImeComposing(e)) return;
                    e.preventDefault();
                    void submit();
                  }
                }}
                className="composer-chat-field"
                disabled={disabled}
              />
              </div>
              <IconTip label={t(lang, "send")}>
                <button
                  type="button"
                  className="composer-chat-send shrink-0"
                  disabled={!canSend}
                  aria-label={t(lang, "send")}
                  onClick={() => void submit()}
                >
                  <ArrowUp className="size-5" strokeWidth={2.2} />
                </button>
              </IconTip>
            </div>
          </div>
          {below}
          <input
            ref={photoRef}
            className="sr-only"
            type="file"
            accept="image/*"
            multiple
            tabIndex={-1}
            onChange={(e) => {
              emitFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={fileRef}
            className="sr-only"
            type="file"
            multiple
            tabIndex={-1}
            onChange={(e) => {
              emitFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={cameraRef}
            className="sr-only"
            type="file"
            accept="image/*"
            capture="environment"
            tabIndex={-1}
            onChange={(e) => {
              emitFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </>
  );
}
