import { useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import { useT } from "../lib/useT";
import { sheetGenieClass, usePresence } from "../lib/presence";

type Props = {
  open: boolean;
  initial: number | null;
  onSave: (remindAt: number | null) => void;
  onClose: () => void;
};

function toLocalInput(ms: number | null) {
  if (!ms) return "";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RemindSheet({ open, initial, onSave, onClose }: Props) {
  const t = useT();
  const [value, setValue] = useState(() => toLocalInput(initial));
  const presence = usePresence(open);

  if (!presence.shown) return null;

  return (
    <div className="protocol-modal-scrim protocol-modal-scrim--under" onClick={onClose}>
      <div className="sheet-stage">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="remind-title"
          className={
            "sheet-panel protocol-modal-panel protocol-modal-panel--narrow" +
            sheetGenieClass(presence.closing)
          }
          onAnimationEnd={(event) => presence.onEnd(event, "sheet-genie-out")}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="protocol-modal-head">
            <div className="protocol-modal-head-copy">
              <div className="protocol-modal-stamp">
                <TriangleAlert aria-hidden strokeWidth={1.8} />
                <span>{t("remindStamp")}</span>
              </div>
              <h2 id="remind-title" className="protocol-modal-title">
                {t("remindTitle")}
              </h2>
            </div>
            <button
              type="button"
              className="protocol-modal-close"
              onClick={onClose}
              aria-label={t("close")}
            >
              <X className="size-5" strokeWidth={1.8} />
            </button>
          </div>
          <p className="protocol-modal-body">{t("remindLead")}</p>
          <label className="grid gap-1 text-[0.8125rem] text-muted">
            {t("remindWhen")}
            <input
              type="datetime-local"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="min-h-12 rounded-[var(--radius-sm)] border border-paper-line bg-paper px-3 text-[0.9375rem] text-ink"
            />
          </label>
          <div className="protocol-modal-actions">
            <button
              type="button"
              className="protocol-modal-btn-secondary"
              onClick={() => {
                setValue("");
                onSave(null);
              }}
            >
              {t("remindClear")}
            </button>
            <button
              type="button"
              className="protocol-modal-btn-primary"
              onClick={() => {
                if (!value) {
                  onSave(null);
                  return;
                }
                const ms = Date.parse(value);
                onSave(Number.isFinite(ms) ? ms : null);
              }}
            >
              {t("remindSave")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
