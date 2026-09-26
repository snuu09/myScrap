import { Link } from "react-router-dom";
import { useAuth } from "../context/Auth";
import { useT } from "../lib/useT";

export function Footer() {
  const t = useT();
  const { user } = useAuth();
  const pending = t("pending");
  const year = String(new Date().getFullYear());

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <p className="site-footer-wordmark">
              <span className="header-logo-my">My</span>
              <span className="header-logo-brary">Brary</span>
            </p>
            <p className="site-footer-lead">{t("footerLead")}</p>
          </div>

          <div className="site-footer-cols">
            <nav className="site-footer-col" aria-label={t("footerCatalog")}>
              <p className="site-footer-col-label font-mono">{t("footerCatalog")}</p>
              {user ? (
                <>
                  <Link to="/">{t("navLibrary")}</Link>
                  <Link to="/dashboard">{t("navStats")}</Link>
                  <Link to="/search">{t("searchPageTitle")}</Link>
                </>
              ) : (
                <Link to="/login">{t("enter")}</Link>
              )}
            </nav>

            <nav className="site-footer-col" aria-label={t("footerOps")}>
              <p className="site-footer-col-label font-mono">{t("footerOps")}</p>
              <Link to="/terms">{t("terms")}</Link>
              <Link to="/privacy">{t("privacy")}</Link>
            </nav>

            <nav className="site-footer-col" aria-label={t("footerSupport")}>
              <p className="site-footer-col-label font-mono">{t("footerSupport")}</p>
              {user ? <Link to="/settings">{t("settings")}</Link> : null}
              <Link to="/upgrade">{t("upgrade")}</Link>
            </nav>
          </div>
        </div>

        <div className="site-footer-bar">
          <p className="site-footer-copy">
            © {year} {t("appName")}
          </p>
          <p className="site-footer-legal">
            {t("footerMark")} · {t("legalOperator")} {pending} · {t("legalRep")} {pending} · {t("legalHost")}{" "}
            {pending}
          </p>
        </div>
      </div>
    </footer>
  );
}
