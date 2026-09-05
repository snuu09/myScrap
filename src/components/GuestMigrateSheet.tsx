import { useState } from "react";
import { X } from "lucide-react";
import { useT } from "../lib/useT";
import { useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import { migrateLocalScraps } from "../lib/guestMigrate";
import { localScrapCount, markGuestMigrateAsked } from "../lib/localScraps";
import { SCRAPS_CHANGED_EVENT } from "../lib/scraps";
import { useDialog } from "../lib/dialog";

type Props = { open: boolean; onClose: () => void };

export function GuestMigrateSheet({ open, onClose }: Props) {
  const t = useT();
  const { user } = useAuth();
  const { canUpload } = usePlan();
  const { alert } = useDialog();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [count] = useState(() => localScrapCount());

  if (!open) return null;

  function keepLocal() {
    markGuestMigrateAsked();
    onClose();
  }

  async function move() {
    if (!user || busy) return;
    setBusy(true);
    setMessage("");
    let added = 0;
    try {
      const result = await migrateLocalScraps(user, (bytes) => {
        const gate = canUpload(added + bytes);
        if (gate.ok) added += bytes;
        return gate.ok;
      });
      markGuestMigrateAsked();
      window.dispatchEvent(new Event(SCRAPS_CHANGED_EVENT));
      if (result.moved && !result.left) {
        await alert(t("guestMigrateDone", { n: result.moved }));
        onClose();
        return;
      }
      if (result.moved) {
        setMessage(t("guestMigratePartial", { moved: result.moved, left: result.left }));
        return;
      }
      setMessage(t("guestMigrateFailed"));
    } catch {
      setMessage(t("guestMigrateFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-[color-mix(in_srgb,var(--color-ink)_24%,transparent)]"
      onClick={busy ? undefined : keepLocal}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-migrate-title"
        className="absolute left-1/2 top-1/2 w-[min(24rem,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-paper-line bg-login-wall p-3.5 shadow-[var(--shadow-sheet)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-1">
          <h2 id="guest-migrate-title" className="m-0 min-w-0 flex-1 text-[1.0625rem] font-bold">
            {t("guestMigrateTitle")}
          </h2>
          <button
            type="button"
            className="grid size-12 shrink-0 place-items-center"
            disabled={busy}
            onClick={keepLocal}
            aria-label={t("close")}
          >
            <X className="size-[22px]" strokeWidth={1.8} />
          </button>
        </div>
        <p className="auth-lead">{t("guestMigrateLead", { n: count })}</p>
        <div className="mt-3 flex flex-col gap-2">
          <button type="button" className="auth-btn-primary" disabled={busy} onClick={() => void move()}>
            {busy ? t("guestMigrateWorking") : t("guestMigrateMove")}
          </button>
          <button type="button" className="auth-btn-secondary" disabled={busy} onClick={keepLocal}>
            {t("guestMigrateKeep")}
          </button>
          {message ? <p className="auth-feedback-error">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
