import { X } from "lucide-react";
import { useT } from "../lib/useT";

type Props = { open: boolean; onConfirm: () => void; onCancel: () => void };

const POINTS = [
  "guestNoticePointDevice",
  "guestNoticePointClear",
  "guestNoticePointLimit",
  "guestNoticePointAccount",
] as const;

export function GuestNoticeSheet({ open, onConfirm, onCancel }: Props) {
  const t = useT();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-[color-mix(in_srgb,var(--color-ink)_24%,transparent)]"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-notice-title"
        className="absolute left-1/2 top-1/2 w-[min(24rem,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-paper-line bg-login-wall p-3.5 shadow-[var(--shadow-sheet)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-1">
          <h2 id="guest-notice-title" className="m-0 min-w-0 flex-1 text-[1.0625rem] font-bold">
            {t("guestNoticeTitle")}
          </h2>
          <button
            type="button"
            className="grid size-12 shrink-0 place-items-center"
            onClick={onCancel}
            aria-label={t("close")}
          >
            <X className="size-[22px]" strokeWidth={1.8} />
          </button>
        </div>
        <p className="auth-lead">{t("guestNoticeLead")}</p>
        <ul className="my-3 grid list-disc gap-1.5 pl-5 text-[0.8125rem] leading-snug text-ink-soft">
          {POINTS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <button type="button" className="auth-btn-primary" onClick={onConfirm}>
            {t("guestNoticeConfirm")}
          </button>
          <button type="button" className="auth-btn-secondary" onClick={onCancel}>
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
