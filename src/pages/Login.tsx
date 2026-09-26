import { Link, Navigate, useNavigate } from "react-router-dom";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useAuth } from "../context/Auth";
import { AuthSheet, type AuthMode } from "../components/AuthSheet";
import { AuthWaiting } from "../components/AuthWaiting";
import { MyBraryMark } from "../components/MyBraryMark";

type Props = {
  pageMode: AuthMode;
  onPageModeChange: (mode: AuthMode) => void;
};

/** Dedicated /login route: Soft Deckle archival dossier entry around AuthSheet page variant. */
export function Login({ pageMode, onPageModeChange }: Props) {
  const { lang } = usePrefs();
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  if (!ready) return <AuthWaiting />;
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="login-page">
      <div className="login-page-watermark" aria-hidden>
        <svg className="login-page-watermark-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="login-archival-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="currentColor"
                strokeDasharray="2 4"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-archival-grid)" />
        </svg>
      </div>

      <div className="login-page-stage">
        <header className="login-page-brand">
          <div className="login-page-wordmark">
            <MyBraryMark className="login-page-emblem" />
            <div className="login-page-wordmark-copy">
              <span className="header-logo" aria-hidden>
                <span className="header-logo-my">My</span>
                <span className="header-logo-brary">Brary</span>
              </span>
              <span className="login-page-folio font-mono">{t(lang, "loginBookshelf")}</span>
            </div>
          </div>

          <h1 className="login-page-title">
            {t(lang, "heroHeadlineBefore")}
            <br />
            <em className="login-page-title-em">{t(lang, "heroHeadlineEm")}</em>
            {t(lang, "heroHeadlineAfter")}
          </h1>
        </header>

        <AuthSheet
          variant="page"
          open
          pageMode={pageMode}
          onPageModeChange={onPageModeChange}
          onClose={() => navigate("/")}
        />

        <footer className="login-page-foot">
          <p className="login-page-foot-code font-mono">{t(lang, "loginArchiveCode")}</p>
          <nav className="login-page-foot-nav" aria-label={t(lang, "appName")}>
            <Link to="/terms">{t(lang, "terms")}</Link>
            <span aria-hidden>·</span>
            <Link to="/privacy">{t(lang, "privacy")}</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
