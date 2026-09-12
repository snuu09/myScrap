import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";

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
        <Sparkles className="classify-busy-icon size-8" strokeWidth={1.6} aria-hidden />
        <p className="classify-busy-label">{label}</p>
      </div>
      <button type="button" className="auth-link-utility app-busy-lock-cancel" onClick={onCancel}>
        {t(lang, "cancel")}
      </button>
    </div>,
    document.body,
  );
}
