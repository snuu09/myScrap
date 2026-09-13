import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Camera, Clipboard, FileUp, ImageIcon, Plus } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useDialog } from "../lib/dialog";
import { isImeComposing } from "../lib/ime";
import { IconTip } from "./IconTip";

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
};

export function StickDock({ value, onChange, onSubmitText, onFiles, dropping, disabled, disabledHint, draftSlot, below }: Props) {
  const { lang } = usePrefs();
  const { alert } = useDialog();
  const [menu, setMenu] = useState(false);
  const [over, setOver] = useState(false);
  const [yielding, setYielding] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const canSend = Boolean(value.trim()) && !disabled;
  const expanded = value.includes("\n") || value.length > 48;

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = expanded ? Math.min(el.scrollHeight, 160) : Math.min(el.scrollHeight, 36);
    el.style.height = `${Math.max(next, 36)}px`;
  }, [value, expanded]);

  useEffect(() => {
    function onCloseOverlays() {
      setMenu(false);
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
    if (draftSlot) setMenu(false);
  }, [draftSlot]);

  useEffect(() => {
    if (!menu) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setMenu(false);
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
    setMenu(true);
  }

  /** Snapshot before clearing input value; FileList is live and empties after value="". */
  function emitFiles(list: FileList | null) {
    if (!list?.length) return;
    onFiles(Array.from(list));
  }

  return (
    <>
      {menu ? (
        <button
          type="button"
          className="stick-menu-scrim"
          aria-label={t(lang, "close")}
          onClick={() => setMenu(false)}
        />
      ) : null}
      {draftSlot ? <div className="classify-draft-scrim" aria-hidden /> : null}
      <div
        className={
          "stick-float" +
          (draftSlot ? " stick-float--sheet" : "") +
          (!draftSlot && over ? " stick-float--over" : "") +
          (!draftSlot && yielding ? " stick-float--yielding" : "")
        }
        aria-label={t(lang, "composerLabel")}
      >
        <div className="stick-float-inner">
          {dropping ? <div className="stick-float-drop">{t(lang, "dropOverlay")}</div> : null}
          {draftSlot ? (
            <section className="classify-draft classify-draft--sheet" aria-label={t(lang, "classifyTitle")}>
              {draftSlot}
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
                    aria-expanded={menu}
                    aria-haspopup="menu"
                    disabled={disabled}
                    onClick={() => {
                      if (menu) setMenu(false);
                      else void openMenu();
                    }}
                  >
                    <Plus className="size-5" strokeWidth={1.8} />
                  </button>
                </IconTip>
                {menu ? (
                  <div className="composer-chat-menu" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      className="composer-chat-menu-item"
                      onClick={() => {
                        setMenu(false);
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
                        setMenu(false);
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
                        setMenu(false);
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
                        setMenu(false);
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
              <textarea
                id="composer"
                ref={fieldRef}
                rows={1}
                value={value}
                placeholder={t(lang, "placeholder")}
                onChange={(e) => onChange(e.target.value)}
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
