import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { NoticeItem } from "../lib/notices";
import { useT } from "../lib/useT";

type Props = {
  item: NoticeItem;
  unread: boolean;
  onActivate: (item: NoticeItem) => void;
};

export function NoticeRow({ item, unread, onActivate }: Props) {
  const t = useT();
  return (
    <Link
      to={item.href}
      className={
        "header-notices-item is-" + item.severity + (unread ? " is-unread" : "")
      }
      onClick={() => onActivate(item)}
    >
      <span className={"header-notices-unread" + (unread ? " is-on" : "")} aria-hidden />
      <span className="header-notices-item-title">{t(item.titleKey, item.titleVars)}</span>
      <ChevronRight className="header-notices-item-go size-4 shrink-0" strokeWidth={1.8} aria-hidden />
    </Link>
  );
}
