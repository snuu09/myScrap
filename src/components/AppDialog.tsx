import { useEffect, useRef } from "react";
import { Trash2, X } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import type { DialogConfirmOpts } from "../lib/dialog";
import { sheetGenieClass, usePresence } from "../lib/presence";

type State =
  | { kind: "alert"; message: string; title?: string }
  | { kind: "confirm"; opts: DialogConfirmOpts }
  | null;

type Props = {
  state: State;
  onClose: (result: boolean) => void;
};

/** Protocol Stamp centered dialog replacing window.alert / window.confirm. */
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
  const danger = view.kind === "confirm" && Boolean(view.opts.danger);

  return (
    <div className="protocol-modal-scrim" onClick={() => onClose(false)}>
      <div className="sheet-stage">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-dialog-title"
          className={"sheet-panel protocol-modal-panel" + sheetGenieClass(presence.closing)}
          onAnimationEnd={(event) => presence.onEnd(event, "sheet-genie-out")}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="protocol-modal-head">
            <div className="protocol-modal-head-copy">
              <h2 id="app-dialog-title" className="protocol-modal-title">
                {title}
              </h2>
            </div>
            <button
              type="button"
              className="protocol-modal-close"
              onClick={() => onClose(false)}
              aria-label={t(lang, "close")}
            >
              <X className="size-5" strokeWidth={1.8} />
            </button>
          </div>
          <p className="protocol-modal-body">{body}</p>
          <div className="protocol-modal-actions">
            {isConfirm ? (
              <button
                type="button"
                className="protocol-modal-btn-secondary"
                onClick={() => onClose(false)}
              >
                {cancelLabel}
              </button>
            ) : null}
            <button
              type="button"
              className={danger ? "protocol-modal-btn-danger" : "protocol-modal-btn-primary"}
              onClick={() => onClose(true)}
              autoFocus
            >
              {danger ? <Trash2 aria-hidden strokeWidth={1.8} /> : null}
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
