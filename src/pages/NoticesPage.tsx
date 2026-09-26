import { useNotices } from "../lib/useNotices";
import { useT } from "../lib/useT";
import { NoticeRow } from "../components/NoticeRow";

export function NoticesPage() {
  const t = useT();
  const { notices, isUnread, onNoticeActivate } = useNotices();

  return (
    <div className="notices-page">
      <div className="dashboard-head">
        <h1 className="dashboard-title">{t("noticesPageTitle")}</h1>
      </div>

      {notices.length === 0 ? (
        <p className="notices-page-empty">{t("noticesEmpty")}</p>
      ) : (
        <ul className="notices-page-list">
          {notices.map((item) => (
            <li key={item.id}>
              <NoticeRow item={item} unread={isUnread(item.id)} onActivate={onNoticeActivate} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
