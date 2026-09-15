import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { AiProgress } from "./AiProgress";

type Props = {
  open: boolean;
  label: string;
  onCancel: () => void;
};

/** Viewport-fixed dim lock (portaled) so Header/nav cannot navigate while work runs. */
export function BusyOverlay({ open, label, onCancel }: Props) {
  const { lang } = usePrefs();
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="app-busy-lock" role="alertdialog" aria-modal="true" aria-busy="true" aria-live="polite">
      <div className="app-busy-lock-dim" aria-hidden />
      <div className="app-busy-lock-status">
        <AiProgress />
        <p className="classify-busy-label classify-busy-label--shimmer">{label}</p>
        <button type="button" className="app-busy-lock-cancel" onClick={onCancel} aria-label={t(lang, "cancel")}>
          <X className="size-5" strokeWidth={1.8} />
          <span className="sr-only">{t(lang, "cancel")}</span>
        </button>
      </div>
    </div>,
    document.body,
  );
}
