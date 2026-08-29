import { useRef, useState } from "react";
import { Camera, Clipboard, FileUp, ImageIcon, Plus } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmitText: () => void;
  onFiles: (files: FileList | File[]) => void;
  dropping: boolean;
};

export function StickDock({ value, onChange, onSubmitText, onFiles, dropping }: Props) {
  const { lang } = usePrefs();
  const [menu, setMenu] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  async function readClipboard() {
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

  return (
    <div className="sticky bottom-0 z-10 border-t border-paper-line bg-enamel px-[var(--gutter)] pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
      {dropping ? (
        <div className="mb-2 rounded-[18px] border border-dashed border-magnet bg-[color-mix(in_srgb,var(--color-enamel)_92%,transparent)] px-3 py-6 text-center text-[0.9375rem] font-semibold text-magnet">
          {t(lang, "dropOverlay")}
        </div>
      ) : null}
      <div className="mx-auto grid max-w-[40rem] grid-cols-[auto_minmax(0,1fr)_auto] items-end gap-2">
        <div className="relative">
          <button
            type="button"
            className="grid size-12 place-items-center rounded-full bg-paper text-ink shadow-[var(--shadow-scrap)]"
            aria-label={t(lang, "addMenu")}
            aria-expanded={menu}
            onClick={() => setMenu((v) => !v)}
          >
            <Plus className="size-[22px]" strokeWidth={1.8} />
          </button>
          {menu ? (
            <div className="absolute bottom-[calc(100%+8px)] left-0 z-20 flex min-w-40 flex-col overflow-hidden rounded-[18px] border border-paper-line bg-paper shadow-[var(--shadow-sheet)]">
              <button type="button" className="flex items-center gap-2 px-3 py-2.5 text-left text-[0.9375rem]" onClick={() => { setMenu(false); void readClipboard(); }}>
                <Clipboard className="size-4" /> {t(lang, "clipboard")}
              </button>
              <button type="button" className="hidden items-center gap-2 px-3 py-2.5 text-left text-[0.9375rem] max-[720px]:flex" onClick={() => { setMenu(false); cameraRef.current?.click(); }}>
                <Camera className="size-4" /> {t(lang, "camera")}
              </button>
              <button type="button" className="flex items-center gap-2 px-3 py-2.5 text-left text-[0.9375rem]" onClick={() => { setMenu(false); photoRef.current?.click(); }}>
                <ImageIcon className="size-4" /> {t(lang, "photo")}
              </button>
              <button type="button" className="flex items-center gap-2 px-3 py-2.5 text-left text-[0.9375rem]" onClick={() => { setMenu(false); fileRef.current?.click(); }}>
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
          rows={1}
          value={value}
          placeholder={t(lang, "placeholder")}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmitText();
            }
          }}
          className="max-h-32 min-h-12 resize-none rounded-[18px] border border-paper-line bg-paper px-3 py-3 text-[1rem] text-ink"
        />
        <button
          type="button"
          className="min-h-12 rounded-full bg-magnet px-4 text-[0.9375rem] font-bold text-magnet-ink"
          onClick={onSubmitText}
        >
          {t(lang, "send")}
        </button>
      </div>
      <input ref={photoRef} className="hidden" type="file" accept="image/*" onChange={(e) => { if (e.target.files) onFiles(e.target.files); e.target.value = ""; }} />
      <input ref={fileRef} className="hidden" type="file" onChange={(e) => { if (e.target.files) onFiles(e.target.files); e.target.value = ""; }} />
      <input ref={cameraRef} className="hidden" type="file" accept="image/*" capture="environment" onChange={(e) => { if (e.target.files) onFiles(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
