import { Link } from "react-router-dom";
import { BarChart3, Menu, LogIn } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useAuth } from "../context/Auth";

type Props = {
  onEnter: () => void;
  onSettings: () => void;
};

export function Header({ onEnter, onSettings }: Props) {
  const { lang } = usePrefs();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex min-h-[60px] items-center justify-between gap-3 border-b border-paper-line/60 bg-enamel px-[var(--gutter,clamp(16px,4vw,40px))] py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))]">
      <Link to="/" className="flex items-center gap-2.5 text-ink no-underline">
        <img src="/assets/favicon.svg" width={22} height={22} alt="" className="size-[22px] rounded-[6px]" />
        <span className="text-[1.125rem] font-extrabold tracking-[-0.03em]">{t(lang, "appName")}</span>
      </Link>
      <div className="flex items-center gap-2">
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
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-paper px-3 text-[0.8125rem] font-semibold text-ink no-underline"
          >
            <BarChart3 className="size-4" strokeWidth={1.8} />
            {t(lang, "dashboard")}
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
    </header>
  );
}
