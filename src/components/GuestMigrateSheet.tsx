import { useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import { useT } from "../lib/useT";
import { useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import { migrateLocalScraps } from "../lib/guestMigrate";
import { localScrapCount, markGuestMigrateAsked } from "../lib/localScraps";
import { SCRAPS_CHANGED_EVENT } from "../lib/scraps";
import { useDialog } from "../lib/dialog";
import { sheetGenieClass, usePresence } from "../lib/presence";

type Props = { open: boolean; onClose: () => void };

export function GuestMigrateSheet({ open, onClose }: Props) {
  const t = useT();
  const { user } = useAuth();
  const { canUpload } = usePlan();
  const { alert } = useDialog();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [count] = useState(() => localScrapCount());
  const presence = usePresence(open);

  if (!presence.shown) return null;

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
      className="protocol-modal-scrim protocol-modal-scrim--under"
      onClick={busy ? undefined : keepLocal}
    >
      <div className="sheet-stage">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-migrate-title"
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
                <span>{t("guestMigrateStamp")}</span>
              </div>
              <h2 id="guest-migrate-title" className="protocol-modal-title">
                {t("guestMigrateTitle")}
              </h2>
            </div>
            <button
              type="button"
              className="protocol-modal-close"
              disabled={busy}
              onClick={keepLocal}
              aria-label={t("close")}
            >
              <X className="size-5" strokeWidth={1.8} />
            </button>
          </div>
          <p className="protocol-modal-body">{t("guestMigrateLead", { n: count })}</p>
          <div className="protocol-modal-actions">
            <button
              type="button"
              className="protocol-modal-btn-secondary"
              disabled={busy}
              onClick={keepLocal}
            >
              {t("guestMigrateKeep")}
            </button>
            <button
              type="button"
              className="protocol-modal-btn-primary"
              disabled={busy}
              onClick={() => void move()}
            >
              {busy ? t("guestMigrateWorking") : t("guestMigrateMove")}
            </button>
          </div>
          {message ? <p className="auth-feedback-error">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
