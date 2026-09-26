import { TriangleAlert, X } from "lucide-react";
import { useT } from "../lib/useT";
import { sheetGenieClass, usePresence } from "../lib/presence";

type Props = { open: boolean; onConfirm: () => void; onCancel: () => void };

const POINTS = [
  "guestNoticePointDevice",
  "guestNoticePointClear",
  "guestNoticePointLimit",
  "guestNoticePointAccount",
] as const;

export function GuestNoticeSheet({ open, onConfirm, onCancel }: Props) {
  const t = useT();
  const presence = usePresence(open);
  if (!presence.shown) return null;

  return (
    <div className="protocol-modal-scrim protocol-modal-scrim--under" onClick={onCancel}>
      <div className="sheet-stage">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-notice-title"
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
                <span>{t("guestNoticeStamp")}</span>
              </div>
              <h2 id="guest-notice-title" className="protocol-modal-title">
                {t("guestNoticeTitle")}
              </h2>
            </div>
            <button
              type="button"
              className="protocol-modal-close"
              onClick={onCancel}
              aria-label={t("close")}
            >
              <X className="size-5" strokeWidth={1.8} />
            </button>
          </div>
          <p className="protocol-modal-body">{t("guestNoticeLead")}</p>
          <ul className="my-0 grid list-disc gap-1.5 pl-5 text-[0.8125rem] leading-snug text-ink-soft">
            {POINTS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
          <div className="protocol-modal-actions">
            <button type="button" className="protocol-modal-btn-secondary" onClick={onCancel}>
              {t("cancel")}
            </button>
            <button type="button" className="protocol-modal-btn-primary" onClick={onConfirm}>
              {t("guestNoticeConfirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
