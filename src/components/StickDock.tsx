import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Camera, Clipboard, FileUp, ImageIcon, Plus } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmitText: () => void;
  onFiles: (files: FileList | File[]) => void;
  dropping: boolean;
  disabled?: boolean;
  disabledHint?: string;
  draftSlot?: ReactNode;
};

export function StickDock({ value, onChange, onSubmitText, onFiles, dropping, disabled, disabledHint, draftSlot }: Props) {
  const { lang } = usePrefs();
  const [menu, setMenu] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const canSend = Boolean(value.trim()) && !disabled;

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  async function readClipboard() {
    if (disabled) {
      window.alert(disabledHint || t(lang, "trialExpiredMsg"));
      return;
    }
    try {
      if (!navigator.clipboard?.read) {
        window.alert(t(lang, "clipboardUnsupported"));
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
      window.alert(t(lang, "clipboardEmpty"));
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError") window.alert(t(lang, "clipboardDenied"));
      else window.alert(t(lang, "clipboardEmpty"));
    }
  }

  function guardDisabled() {
    if (!disabled) return false;
    window.alert(disabledHint || t(lang, "trialExpiredMsg"));
    return true;
  }

  function submit() {
    if (guardDisabled()) return;
    if (!value.trim()) return;
    onSubmitText();
  }

  return (
    <div className="stick-float" aria-label={t(lang, "composerLabel")}>
      <div className="stick-float-inner">
        {dropping ? (
          <div className="stick-float-drop">
            {t(lang, "dropOverlay")}
          </div>
        ) : null}
        {draftSlot ? (
          <section className="classify-draft classify-draft--dock" aria-label={t(lang, "classifyTitle")}>
            {draftSlot}
          </section>
        ) : null}
        <div className={"composer-chat" + (disabled ? " composer-chat--disabled" : "")}>
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
                e.preventDefault();
                submit();
              }
            }}
            className="composer-chat-field"
            disabled={disabled}
          />
          <div className="composer-chat-bar">
            <div className="relative">
              <button
                type="button"
                className="composer-chat-plus"
                aria-label={t(lang, "addMenu")}
                aria-expanded={menu}
                disabled={disabled}
                onClick={() => {
                  if (guardDisabled()) return;
                  setMenu((v) => !v);
                }}
              >
                <Plus className="size-5" strokeWidth={1.8} />
              </button>
              {menu ? (
                <div className="composer-chat-menu">
                  <button type="button" className="composer-chat-menu-item" onClick={() => { setMenu(false); void readClipboard(); }}>
                    <Clipboard className="size-4" /> {t(lang, "clipboard")}
                  </button>
                  <button type="button" className="composer-chat-menu-item hidden max-[720px]:flex" onClick={() => { setMenu(false); cameraRef.current?.click(); }}>
                    <Camera className="size-4" /> {t(lang, "camera")}
                  </button>
                  <button type="button" className="composer-chat-menu-item" onClick={() => { setMenu(false); photoRef.current?.click(); }}>
                    <ImageIcon className="size-4" /> {t(lang, "photo")}
                  </button>
                  <button type="button" className="composer-chat-menu-item" onClick={() => { setMenu(false); fileRef.current?.click(); }}>
                    <FileUp className="size-4" /> {t(lang, "file")}
                  </button>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="composer-chat-send"
              disabled={!canSend}
              aria-label={t(lang, "send")}
              onClick={submit}
            >
              <ArrowUp className="size-5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
      <input ref={photoRef} className="hidden" type="file" accept="image/*" onChange={(e) => { if (e.target.files) onFiles(e.target.files); e.target.value = ""; }} />
      <input ref={fileRef} className="hidden" type="file" onChange={(e) => { if (e.target.files) onFiles(e.target.files); e.target.value = ""; }} />
      <input ref={cameraRef} className="hidden" type="file" accept="image/*" capture="environment" onChange={(e) => { if (e.target.files) onFiles(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
