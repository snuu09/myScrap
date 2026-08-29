import { Link } from "react-router-dom";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";

export function Footer() {
  const { lang } = usePrefs();
  const pending = t(lang, "pending");
  const year = String(new Date().getFullYear());

  return (
    <footer className="flex min-h-[7.5rem] flex-col justify-center gap-2 px-[var(--gutter,clamp(16px,4vw,40px))] py-3">
      <nav className="flex gap-3 text-[0.8125rem]" aria-label={t(lang, "footerLegal")}>
        <Link to="/terms" className="text-muted">
          {t(lang, "terms")}
        </Link>
        <Link to="/privacy" className="font-bold text-magnet">
          {t(lang, "privacy")}
        </Link>
      </nav>
      <p className="m-0 text-[0.75rem] text-muted">
        {t(lang, "footerMark")} · {t(lang, "legalOperator")} {pending} · {t(lang, "legalRep")} {pending} · {pending} ·{" "}
        {pending} · {t(lang, "legalHost")} {pending} · © {year} {t(lang, "appName")}
      </p>
      <p className="m-0 text-[0.9375rem] text-muted">{t(lang, "footerNoteCloud")}</p>
    </footer>
  );
}
