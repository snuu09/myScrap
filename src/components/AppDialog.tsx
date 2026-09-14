import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import type { DialogConfirmOpts } from "../lib/dialog";
import { GlassCluster } from "./GlassCluster";
import { sheetGenieClass, usePresence } from "../lib/presence";

type State =
  | { kind: "alert"; message: string; title?: string }
  | { kind: "confirm"; opts: DialogConfirmOpts }
  | null;

type Props = {
  state: State;
  onClose: (result: boolean) => void;
};

/** Centered paper dialog replacing window.alert / window.confirm. */
export function AppDialog({ state, onClose }: Props) {
  const { lang } = usePrefs();

  const presence = usePresence(Boolean(state));
  const held = useRef(state);
  if (state) held.current = state;
  const view = state ?? held.current;

  useEffect(() => {
    if (!view) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") onClose(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, onClose]);

  if (!presence.shown || !view) return null;

  const isConfirm = view.kind === "confirm";
  const title =
    view.kind === "alert"
      ? view.title || t(lang, "dialogNotice")
      : view.opts.title || t(lang, "dialogConfirmTitle");
  const body = view.kind === "alert" ? view.message : view.opts.body;
  const confirmLabel =
    view.kind === "confirm"
      ? view.opts.confirmLabel || t(lang, "dialogOk")
      : t(lang, "dialogOk");
  const cancelLabel =
    view.kind === "confirm" ? view.opts.cancelLabel || t(lang, "cancel") : t(lang, "cancel");
  const danger = view.kind === "confirm" && view.opts.danger;
  const confirm = (
    <button
      type="button"
      className={danger ? "auth-btn-primary settings-btn-reset" : "auth-btn-primary"}
      onClick={() => onClose(true)}
      autoFocus
    >
      {confirmLabel}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--color-ink)_40%,transparent)]"
      onClick={() => onClose(false)}
    >
      <div className="sheet-stage">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        className={
          "sheet-panel w-[min(22rem,calc(100vw-24px))] rounded-[32px] border border-paper-line bg-login-wall p-3.5 shadow-[var(--shadow-sheet)]" +
          sheetGenieClass(presence.closing)
        }
        onAnimationEnd={(event) => presence.onEnd(event, "sheet-genie-out")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-1">
          <h2 id="app-dialog-title" className="m-0 min-w-0 flex-1 text-[1.0625rem] font-bold">
            {title}
          </h2>
          <button
            type="button"
            className="grid size-12 shrink-0 place-items-center"
            onClick={() => onClose(false)}
            aria-label={t(lang, "close")}
          >
            <X className="size-[22px]" strokeWidth={1.8} />
          </button>
        </div>
        <p className="auth-lead whitespace-pre-wrap">{body}</p>
        <div className="mt-3 flex flex-col gap-2">
          {danger ? confirm : (
            <GlassCluster className="liquid-solo" magnet>
              {confirm}
            </GlassCluster>
          )}
          {isConfirm ? (
            <button type="button" className="auth-btn-secondary" onClick={() => onClose(false)}>
              {cancelLabel}
            </button>
          ) : null}
        </div>
      </div>
      </div>
    </div>
  );
}
