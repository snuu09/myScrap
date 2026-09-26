import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, LibraryBig, LogIn, Monitor, Moon, Search, Sun, User } from "lucide-react";
import { t } from "../i18n";
import { usePrefs, type ThemeChoice } from "../context/Prefs";
import { useAuth } from "../context/Auth";
import { useT } from "../lib/useT";
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

const NEXT_THEME: Record<ThemeChoice, ThemeChoice> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const THEME_ICON: Record<ThemeChoice, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

function ThemeToggle() {
  const { theme, setTheme } = usePrefs();
  const t = useT();
  const Icon = THEME_ICON[theme];
  const label =
    t("themeToggle") + " · " + t(theme === "light" ? "themeLight" : theme === "dark" ? "themeDark" : "themeSystem");
  return (
    <IconTip label={label}>
      <button
        type="button"
        className="header-icon-btn"
        aria-label={label}
        onClick={() => setTheme(NEXT_THEME[theme])}
      >
        <Icon className="size-[18px]" strokeWidth={1.8} />
      </button>
    </IconTip>
  );
}

function accountAvatarUrl(user: { user_metadata?: Record<string, unknown> } | null): string | null {
  const meta = user?.user_metadata;
  if (!meta) return null;
  const url = meta.avatar_url ?? meta.picture;
  return typeof url === "string" && url.trim() ? url.trim() : null;
}

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
        <div className="header-logo-stack">
          <Link to="/" className="header-logo" aria-label={t(lang, "appName")}>
            <span className="header-logo-my">My</span>
            <span className="header-logo-brary">Brary</span>
          </Link>
        </div>
      </div>
      {user ? <HeaderNav /> : null}
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
        <ThemeToggle />
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
