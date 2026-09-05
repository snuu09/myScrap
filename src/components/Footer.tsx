import { Link } from "react-router-dom";
import { useT } from "../lib/useT";

export function Footer() {
  const t = useT();
  const pending = t("pending");
  const year = String(new Date().getFullYear());

  return (
    <footer className="flex min-h-[7.5rem] flex-col justify-center gap-2 px-[var(--gutter,clamp(16px,4vw,40px))] py-3">
      <nav className="flex gap-3 text-[0.8125rem]" aria-label={t("footerLegal")}>
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
      <p className="m-0 text-[0.9375rem] text-muted">{t("footerNoteCloud")}</p>
    </footer>
  );
}
