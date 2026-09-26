import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotices } from "../lib/useNotices";
import { useT } from "../lib/useT";
import { IconTip } from "./IconTip";
import { NoticeRow } from "./NoticeRow";

export function HeaderNotices() {
  const t = useT();
  const { count, unreadCount, panelItems, historyCount, isUnread, onNoticeActivate } = useNotices();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const label =
    unreadCount > 0
      ? t("noticesOpenUnread", { n: unreadCount })
      : count > 0
        ? t("noticesOpenCount", { n: count })
        : t("noticesOpen");

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.body.classList.add("notices-open");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("notices-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="header-notices" ref={rootRef}>
      <IconTip label={label}>
        <button
          type="button"
          className={"header-icon-btn header-notices-btn" + (open ? " is-open" : "")}
          aria-label={label}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <Bell className="size-[18px]" strokeWidth={1.8} />
          {unreadCount > 0 ? (
            <span className="header-notices-badge" aria-hidden>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </IconTip>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="header-notices-scrim"
              role="presentation"
              onClick={() => setOpen(false)}
            />,
            document.body,
          )
        : null}

      {open ? (
        <div id={panelId} className="header-notices-panel" role="region" aria-label={t("noticesTitle")}>
          <p className="header-notices-title">{t("noticesTitle")}</p>
          {count === 0 ? (
            <p className="header-notices-empty">{t("noticesEmpty")}</p>
          ) : (
            <ul className="header-notices-list">
              {panelItems.map((item) => (
                <li key={item.id}>
                  <NoticeRow
                    item={item}
                    unread={isUnread(item.id)}
                    onActivate={(next) => {
                      onNoticeActivate(next);
                      setOpen(false);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
          <Link to="/notices" className="header-notices-see-all" onClick={() => setOpen(false)}>
            {historyCount > count ? t("noticesSeeAllHistory") : t("noticesSeeAll")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
