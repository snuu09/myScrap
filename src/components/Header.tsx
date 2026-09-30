import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, LibraryBig, LogIn, Search, User } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useAuth } from "../context/Auth";
import { useT } from "../lib/useT";
import { accountAvatarUrl } from "../lib/accountAvatar";
import { markArriveGenie } from "../lib/pageGenie";
import { HeaderNotices } from "./HeaderNotices";
import { IconTip } from "./IconTip";

type BackAction = {
  label: string;
  to?: string;
  onBack?: () => void;
};

type Props = {
  /** Signed-out CTA and Intro's hero CTA both land here; both now navigate to /login. */
  onEnter: () => void;
  /** Kept for call-site compatibility; settings opens via the account avatar. */
  onSettings?: () => void;
  back?: BackAction;
};

const NAV_TABS = [
  { to: "/", key: "navLibrary" as const, icon: LibraryBig, end: true },
  { to: "/dashboard", key: "navStats" as const, icon: BarChart3, end: false },
];

function HeaderNav() {
  const { lang } = usePrefs();
  const { pathname } = useLocation();
  return (
    <nav className="header-nav" aria-label={t(lang, "navLibrary")}>
      {NAV_TABS.map(({ to, key, icon: Icon, end }) => {
        const active = end ? pathname === to : pathname === to || pathname.startsWith(to + "/");
        return (
          <IconTip key={to} label={t(lang, key)}>
            <Link
              to={to}
              className={"header-nav-tab" + (active ? " is-active" : "")}
              aria-current={active ? "page" : undefined}
              onClick={() => {
                if (to === "/" && pathname !== "/") markArriveGenie();
              }}
            >
              <Icon className="size-[18px]" strokeWidth={1.8} />
              <span className="header-nav-label">{t(lang, key)}</span>
            </Link>
          </IconTip>
        );
      })}
    </nav>
  );
}

export function Header({ onEnter, back }: Props) {
  const { lang } = usePrefs();
  const tLook = useT();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onLoginPage = pathname === "/login";
  const onSearch = pathname === "/search";
  const onSettings = pathname === "/settings" || pathname.startsWith("/settings/");
  const avatarUrl = accountAvatarUrl(user);
  const settingsLabel = t(lang, "settings");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        navigate("/search");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <header className="site-header">
      <div className="header-brand">
        {back ? (
          <IconTip label={back.label}>
            {back.to ? (
              <Link
                to={back.to}
                className="header-back no-underline"
                aria-label={back.label}
                onClick={() => {
                  if (back.to === "/") markArriveGenie();
                }}
              >
                <ArrowLeft className="size-[22px]" strokeWidth={1.8} />
              </Link>
            ) : (
              <button type="button" className="header-back" aria-label={back.label} onClick={back.onBack}>
                <ArrowLeft className="size-[22px]" strokeWidth={1.8} />
              </button>
            )}
          </IconTip>
        ) : (
          <span className="header-back header-back--spacer" aria-hidden />
        )}
        <div className="header-logo-stack">
          <Link
            to="/"
            className="header-logo"
            aria-label={t(lang, "appName")}
            onClick={() => {
              if (pathname !== "/") markArriveGenie();
            }}
          >
            <span className="header-logo-my">My</span>
            <span className="header-logo-brary">Brary</span>
          </Link>
        </div>
      </div>
      {user ? <HeaderNav /> : <div className="header-nav header-nav--spacer" aria-hidden />}
      <div className="header-actions">
        {user ? (
          <IconTip label={tLook("searchOpen")}>
            <button
              type="button"
              className={"header-icon-btn header-icon-btn--search-quick" + (onSearch ? " is-active" : "")}
              onClick={() => navigate("/search")}
              aria-label={tLook("searchOpen")}
              aria-current={onSearch ? "page" : undefined}
            >
              <Search className="size-[18px]" strokeWidth={1.8} />
            </button>
          </IconTip>
        ) : null}
        {user ? <HeaderNotices /> : null}
        {user ? (
          <IconTip label={settingsLabel}>
            <Link
              to="/settings"
              className={"header-account-btn" + (onSettings ? " is-active" : "")}
              aria-label={settingsLabel}
              aria-current={onSettings ? "page" : undefined}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="header-account-avatar" referrerPolicy="no-referrer" />
              ) : (
                <User className="header-account-fallback" strokeWidth={1.8} aria-hidden />
              )}
            </Link>
          </IconTip>
        ) : null}
        {!user && !onLoginPage ? (
          <button type="button" onClick={onEnter} className="header-login">
            <LogIn className="size-4" strokeWidth={1.8} aria-hidden />
            {t(lang, "enter")}
          </button>
        ) : null}
      </div>
    </header>
  );
}
