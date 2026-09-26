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
    <header className={"site-header" + (searching ? " header--search" : "")}>
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
          <Link to="/" className="header-logo" aria-label={t(lang, "appName")}>
            <span className="header-logo-my">My</span>
            <span className="header-logo-brary">Brary</span>
          </Link>
        )}
      </div>
      {searching ? <div id="search-header-slot" className="header-search-slot" /> : null}
      {searching ? null : (
        <div className="header-actions">
          {user ? (
            <IconTip label={tLook("searchOpen")}>
              <button
                type="button"
                className="header-icon-btn"
                onClick={() => navigate("/search")}
                aria-label={tLook("searchOpen")}
              >
                <Search className="size-[20px]" strokeWidth={1.8} />
              </button>
            </IconTip>
          ) : null}
          {!user ? (
            <button type="button" onClick={onEnter} className="header-login">
              <LogIn className="size-4" strokeWidth={1.8} aria-hidden />
              {t(lang, "enter")}
            </button>
          ) : (
            <Link to="/dashboard" className="header-dash">
              <BarChart3 className="size-4" strokeWidth={1.8} aria-hidden />
              <span className="header-dash-label">{t(lang, "dashboard")}</span>
            </Link>
          )}
          <button
            type="button"
            onClick={onSettings}
            className="header-icon-btn header-icon-btn--menu"
            aria-label={t(lang, "settings")}
          >
            <Menu className="size-[20px]" strokeWidth={1.8} />
          </button>
        </div>
      )}
    </header>
  );
}
