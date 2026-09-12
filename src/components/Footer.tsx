import { Link } from "react-router-dom";
import { useT } from "../lib/useT";

export function Footer() {
  const t = useT();
  const pending = t("pending");
  const year = String(new Date().getFullYear());

  return (
    <footer className="site-footer">
      <nav className="site-footer-nav" aria-label={t("footerLegal")}>
        <Link to="/terms" className="text-muted">
          {t("terms")}
        </Link>
        <Link to="/privacy" className="font-bold text-magnet">
          {t("privacy")}
        </Link>
      </nav>
      <p className="m-0 text-[0.75rem] text-muted">
        {t("footerMark")} · {t("legalOperator")} {pending} · {t("legalRep")} {pending} · {pending} ·{" "}
        {pending} · {t("legalHost")} {pending} · © {year} {t("appName")}
      </p>
    </footer>
  );
}
