import { useState } from "react";
import { X } from "lucide-react";
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
    <div
      className="fixed inset-0 z-40 bg-[color-mix(in_srgb,var(--color-ink)_40%,transparent)]"
      onClick={onClose}
    >
      <div className="sheet-stage">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="remind-title"
        className={
          "sheet-panel w-[min(22rem,calc(100vw-24px))] rounded-[32px] border border-paper-line bg-login-wall p-3.5 shadow-[var(--shadow-sheet)]" +
          sheetGenieClass(presence.closing)
        }
        onAnimationEnd={(event) => presence.onEnd(event, "sheet-genie-out")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-1">
          <h2 id="remind-title" className="m-0 text-[1.0625rem] font-bold">
            {t("remindTitle")}
          </h2>
          <button type="button" className="grid size-12 place-items-center" onClick={onClose} aria-label={t("close")}>
            <X className="size-[22px]" strokeWidth={1.8} />
          </button>
        </div>
        <p className="auth-lead">{t("remindLead")}</p>
        <label className="mt-3 grid gap-1 text-[0.8125rem] text-muted">
          {t("remindWhen")}
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="min-h-12 rounded-[14px] border border-paper-line bg-paper px-3 text-[0.9375rem] text-ink"
          />
        </label>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            className="auth-btn-primary"
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
          <button
            type="button"
            className="auth-btn-secondary"
            onClick={() => {
              setValue("");
              onSave(null);
            }}
          >
            {t("remindClear")}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
