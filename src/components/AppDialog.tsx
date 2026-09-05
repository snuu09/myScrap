import { useEffect } from "react";
import { X } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import type { DialogConfirmOpts } from "../lib/dialog";

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

  useEffect(() => {
    if (!state) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") onClose(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, onClose]);

  if (!state) return null;

  const isConfirm = state.kind === "confirm";
  const title =
    state.kind === "alert"
      ? state.title || t(lang, "dialogNotice")
      : state.opts.title || t(lang, "dialogConfirmTitle");
  const body = state.kind === "alert" ? state.message : state.opts.body;
  const confirmLabel =
    state.kind === "confirm"
      ? state.opts.confirmLabel || t(lang, "dialogOk")
      : t(lang, "dialogOk");
  const cancelLabel =
    state.kind === "confirm" ? state.opts.cancelLabel || t(lang, "cancel") : t(lang, "cancel");
  const danger = state.kind === "confirm" && state.opts.danger;

  return (
    <div
      className="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--color-ink)_40%,transparent)]"
      onClick={() => onClose(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        className="absolute left-1/2 top-1/2 w-[min(22rem,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-paper-line bg-login-wall p-3.5 shadow-[var(--shadow-sheet)]"
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
          <button
            type="button"
            className={danger ? "auth-btn-primary settings-btn-reset" : "auth-btn-primary"}
            onClick={() => onClose(true)}
            autoFocus
          >
            {confirmLabel}
          </button>
          {isConfirm ? (
            <button type="button" className="auth-btn-secondary" onClick={() => onClose(false)}>
              {cancelLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
