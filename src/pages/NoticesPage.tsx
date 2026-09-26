import { Link } from "react-router-dom";
import { CheckCheck, ChevronRight, Trash2 } from "lucide-react";
import { usePrefs } from "../context/Prefs";
import { useDialog } from "../lib/dialog";
import type { NoticeLogEntry } from "../lib/notices";
import { useNotices } from "../lib/useNotices";
import { useT } from "../lib/useT";
import { IconTip } from "../components/IconTip";

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
}: {
  entry: NoticeLogEntry;
  unread: boolean;
  onActivate: (entry: NoticeLogEntry) => void;
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
          {when ? <span className="notices-page-item-meta">{when}</span> : null}
        </span>
        <ChevronRight className="notices-page-item-go size-4 shrink-0" strokeWidth={1.8} aria-hidden />
      </Link>
    </li>
  );
}

export function NoticesPage() {
  const t = useT();
  const { confirm } = useDialog();
  const {
    history,
    historyUnreadCount,
    isUnread,
    onNoticeActivate,
    markAllSeen,
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
      <section className="settings-arch-section notices-page-frame" aria-label={t("noticesPageTitle")}>
        <div className="notices-page-head">
          <p className="notices-page-lead">{t("noticesPageLead")}</p>
          {history.length > 0 ? (
            <div className="notices-page-actions">
              <IconTip label={t("noticesMarkAllRead")}>
                <button
                  type="button"
                  className="icon-quiet-btn"
                  aria-label={t("noticesMarkAllRead")}
                  disabled={historyUnreadCount === 0}
                  onClick={markAllSeen}
                >
                  <CheckCheck className="size-4" strokeWidth={1.8} aria-hidden />
                </button>
              </IconTip>
              <IconTip label={t("noticesClear")}>
                <button
                  type="button"
                  className="icon-quiet-btn is-danger"
                  aria-label={t("noticesClear")}
                  onClick={() => void clearHistory()}
                >
                  <Trash2 className="size-4" strokeWidth={1.8} aria-hidden />
                </button>
              </IconTip>
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
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
