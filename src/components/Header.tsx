import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Menu, LogIn, Search } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useAuth } from "../context/Auth";
import { useT } from "../lib/useT";
import { IconTip } from "./IconTip";

type BackAction = {
  label: string;
  to?: string;
  onBack?: () => void;
};

type Props = {
  onEnter: () => void;
  onSettings: () => void;
  back?: BackAction;
};

export function Header({ onEnter, onSettings, back }: Props) {
  const { lang } = usePrefs();
  const tLook = useT();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const searching = pathname === "/search";
  return (
    <header
      className={
        "sticky top-0 z-30 flex min-h-[60px] items-center border-b border-paper-line/60 bg-enamel px-[var(--gutter,clamp(16px,4vw,40px))] py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))]" +
        (searching ? " header--search gap-2" : " justify-between gap-3")
      }
    >
      <div className="header-brand">
        {back ? (
          <IconTip label={back.label}>
            {back.to ? (
              <Link to={back.to} className="header-back no-underline" aria-label={back.label}>
                <ArrowLeft className="size-[22px]" strokeWidth={1.8} />
              </Link>
            ) : (
              <button type="button" className="header-back" aria-label={back.label} onClick={back.onBack}>
                <ArrowLeft className="size-[22px]" strokeWidth={1.8} />
              </button>
            )}
          </IconTip>
        ) : null}
        {searching ? null : (
          <Link to="/" className="flex shrink-0 items-center gap-2.5 text-ink no-underline">
            <img src="/assets/favicon.svg" width={22} height={22} alt="" className="size-[22px] rounded-[6px]" />
            <span className="text-[1.125rem] font-extrabold tracking-[-0.03em] max-[420px]:sr-only">
              {t(lang, "appName")}
            </span>
          </Link>
        )}
      </div>
      {searching ? <div id="search-header-slot" className="header-search-slot" /> : null}
      {user && !searching ? (
        <button
          type="button"
          className="header-search"
          onClick={() => navigate("/search")}
          aria-label={tLook("searchOpen")}
        >
          <Search className="size-4 shrink-0 text-muted" strokeWidth={1.8} />
          <span className="header-search-text">{tLook("searchPlaceholder")}</span>
        </button>
      ) : null}
      {searching ? null : (
      <div className="flex shrink-0 items-center gap-2">
        {!user ? (
          <button
            type="button"
            onClick={onEnter}
            className="inline-flex min-h-10 items-center rounded-full bg-magnet px-3.5 text-[0.8125rem] font-bold tracking-[-0.02em] text-magnet-ink"
          >
            <LogIn className="mr-1.5 size-4" strokeWidth={1.8} />
            {t(lang, "enter")}
          </button>
        ) : (
          <Link
            to="/dashboard"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-paper px-3 text-[0.8125rem] font-semibold text-ink no-underline max-[520px]:px-2.5"
          >
            <BarChart3 className="size-4" strokeWidth={1.8} />
            <span className="max-[520px]:sr-only">{t(lang, "dashboard")}</span>
          </Link>
        )}
        <button
          type="button"
          onClick={onSettings}
          className="grid size-12 place-items-center rounded-full text-ink"
          aria-label={t(lang, "settings")}
        >
          <Menu className="size-[22px]" strokeWidth={1.8} />
        </button>
      </div>
      )}
    </header>
  );
}
