import { Link } from "react-router-dom";
import { CheckCheck, ChevronRight, Trash2 } from "lucide-react";
import { usePrefs } from "../context/Prefs";
import { useDialog } from "../lib/dialog";
import type { NoticeLogEntry } from "../lib/notices";
import { useNotices } from "../lib/useNotices";
import { useT } from "../lib/useT";

function formatNoticeWhen(at: number, lang: string) {
  try {
    return new Date(at).toLocaleString(lang === "ko" ? "ko-KR" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function HistoryRow({
  entry,
  unread,
  onActivate,
  onDismiss,
}: {
  entry: NoticeLogEntry;
  unread: boolean;
  onActivate: (entry: NoticeLogEntry) => void;
  onDismiss: (id: string) => void;
}) {
  const t = useT();
  const { lang } = usePrefs();
  const when = formatNoticeWhen(entry.lastAt, lang);

  return (
    <li
      className={
        "notices-page-item is-" +
        entry.severity +
        (unread ? " is-unread" : "") +
        (entry.dismissed ? " is-dismissed" : "")
      }
    >
      <Link
        to={entry.href}
        className="notices-page-item-main"
        onClick={() => onActivate(entry)}
      >
        <span className={"notices-page-unread" + (unread ? " is-on" : "")} aria-hidden />
        <span className="notices-page-item-copy">
          <span className="notices-page-item-title">{t(entry.titleKey, entry.titleVars)}</span>
          <span className="notices-page-item-meta">
            {entry.dismissed ? t("noticesStatusDismissed") : t("noticesStatusActive")}
            {when ? ` · ${when}` : ""}
          </span>
        </span>
        <ChevronRight className="notices-page-item-go size-4 shrink-0" strokeWidth={1.8} aria-hidden />
      </Link>
      {!entry.dismissed ? (
        <button
          type="button"
          className="settings-arch-chip settings-arch-chip--ghost notices-page-item-dismiss"
          onClick={() => onDismiss(entry.id)}
        >
          {t("noticesDismiss")}
        </button>
      ) : null}
    </li>
  );
}

export function NoticesPage() {
  const t = useT();
  const { confirm } = useDialog();
  const {
    history,
    unreadCount,
    isUnread,
    onNoticeActivate,
    markAllSeen,
    onDismiss,
    onClearHistory,
  } = useNotices();

  async function clearHistory() {
    const ok = await confirm({
      stamp: "NOTICE ARCHIVE",
      title: t("noticesClearTitle"),
      body: t("noticesClearBody"),
      confirmLabel: t("noticesClearConfirm"),
      cancelLabel: t("cancel"),
      danger: true,
    });
    if (ok) onClearHistory();
  }

  return (
    <div className="notices-page">
      <div className="notices-page-head">
        <div className="dashboard-head-title">
          <h1 className="dashboard-title">{t("noticesPageTitle")}</h1>
          <p className="notices-page-lead">{t("noticesPageLead")}</p>
        </div>
        {history.length > 0 ? (
          <div className="notices-page-actions liquid-glass glass-cluster">
            {unreadCount > 0 ? (
              <button type="button" className="settings-arch-chip" onClick={markAllSeen}>
                <CheckCheck className="size-3.5" strokeWidth={1.8} aria-hidden />
                {t("noticesMarkAllRead")}
              </button>
            ) : null}
            <button
              type="button"
              className="settings-arch-chip settings-arch-chip--danger"
              onClick={() => void clearHistory()}
            >
              <Trash2 className="size-3.5" strokeWidth={1.8} aria-hidden />
              {t("noticesClear")}
            </button>
          </div>
        ) : null}
      </div>

      {history.length === 0 ? (
        <p className="notices-page-empty">{t("noticesHistoryEmpty")}</p>
      ) : (
        <ul className="notices-page-list">
          {history.map((entry) => (
            <HistoryRow
              key={entry.id}
              entry={entry}
              unread={!entry.dismissed && isUnread(entry.id)}
              onActivate={onNoticeActivate}
              onDismiss={onDismiss}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
