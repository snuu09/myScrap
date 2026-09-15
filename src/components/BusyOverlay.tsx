import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { AiProgress } from "./AiProgress";

type Props = {
  open: boolean;
  label: string;
  onCancel: () => void;
  /** 1-based index of the item currently in flight. */
  current?: number;
  /** Total items in the queue. */
  total?: number;
  /** 0–1 fraction within the current item (e.g. upload). */
  ratio?: number | null;
};

/** Viewport-fixed dim lock (portaled) so Header/nav cannot navigate while work runs. */
export function BusyOverlay({ open, label, onCancel, current = 0, total = 0, ratio = null }: Props) {
  const { lang } = usePrefs();
  if (!open || typeof document === "undefined") return null;

  const multi = total > 1 && current > 0;
  const singlePct = !multi && ratio != null ? Math.round(Math.min(1, Math.max(0, ratio)) * 100) : null;
  const multiFrac = multi
    ? Math.min(1, Math.max(0, (current - 1 + (ratio ?? 0)) / total))
    : null;
  const multiPct = multiFrac != null ? Math.round(multiFrac * 100) : null;
  const barPct = multiPct ?? singlePct;
  const countLabel = multi ? t(lang, "batchProgress", { n: current, total }) : "";

  return createPortal(
    <div className="app-busy-lock" role="alertdialog" aria-modal="true" aria-busy="true" aria-live="polite">
      <div className="app-busy-lock-dim" aria-hidden />
      <div className="app-busy-lock-status">
        <AiProgress />
        <p className="classify-busy-label classify-busy-label--shimmer">{label}</p>
        {countLabel ? <p className="app-busy-lock-count">{countLabel}</p> : null}
        {barPct != null ? (
          <div
            className="app-busy-lock-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={barPct}
          >
            <div className="app-busy-lock-bar-fill" style={{ width: `${barPct}%` }} />
            <span className="app-busy-lock-bar-label">{barPct}%</span>
          </div>
        ) : null}
        <button type="button" className="app-busy-lock-cancel" onClick={onCancel} aria-label={t(lang, "cancel")}>
          <X className="size-5" strokeWidth={1.8} />
          <span className="sr-only">{t(lang, "cancel")}</span>
        </button>
      </div>
    </div>,
    document.body,
  );
}
