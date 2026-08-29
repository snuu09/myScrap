import { X } from "lucide-react";
import { t } from "../i18n";
import { usePrefs, type Palette, type ThemeChoice } from "../context/Prefs";
import { useAuth } from "../context/Auth";

type Props = { open: boolean; onClose: () => void };

function Seg({
  pressed,
  children,
  onClick,
}: {
  pressed: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={
        "min-h-10 min-w-10 rounded-full px-3 text-[0.8125rem] font-semibold " +
        (pressed ? "bg-magnet text-magnet-ink" : "bg-paper text-ink")
      }
    >
      {children}
    </button>
  );
}

export function SettingsSheet({ open, onClose }: Props) {
  const { lang, theme, palette, setLang, setTheme, setPalette } = usePrefs();
  const { user, signOut } = useAuth();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 bg-[color-mix(in_srgb,var(--color-ink)_24%,transparent)]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="absolute top-[60px] right-[var(--gutter,clamp(16px,4vw,40px))] flex w-[min(22rem,calc(100vw-24px))] flex-col gap-3.5 rounded-[32px] border border-paper-line bg-login-wall p-3.5 shadow-[var(--shadow-sheet)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="settings-title" className="m-0 text-[1.0625rem] font-bold">
            {t(lang, "settings")}
          </h2>
          <button type="button" className="grid size-12 place-items-center" onClick={onClose} aria-label={t(lang, "close")}>
            <X className="size-[22px]" strokeWidth={1.8} />
          </button>
        </div>
        <div>
          <p className="mb-2 mt-0 text-[0.8125rem] text-muted">{t(lang, "langSwitch")}</p>
          <div className="flex gap-1.5" role="group" aria-label={t(lang, "langSwitch")}>
            <Seg pressed={lang === "ko"} onClick={() => setLang("ko")}>
              KO
            </Seg>
            <Seg pressed={lang === "en"} onClick={() => setLang("en")}>
              EN
            </Seg>
          </div>
        </div>
        <div>
          <p className="mb-2 mt-0 text-[0.8125rem] text-muted">{t(lang, "paletteSwitch")}</p>
          <div className="flex gap-1.5" role="group">
            <Seg pressed={palette === "kitchen"} onClick={() => setPalette("kitchen" as Palette)}>
              {t(lang, "paletteKitchen")}
            </Seg>
            <Seg pressed={palette === "basalt"} onClick={() => setPalette("basalt")}>
              {t(lang, "paletteBasalt")}
            </Seg>
          </div>
        </div>
        <div>
          <p className="mb-2 mt-0 text-[0.8125rem] text-muted">{t(lang, "themeSwitch")}</p>
          <div className="flex gap-1.5" role="group">
            {(["light", "system", "dark"] as ThemeChoice[]).map((choice) => (
              <Seg key={choice} pressed={theme === choice} onClick={() => setTheme(choice)}>
                {t(
                  lang,
                  choice === "light" ? "themeLight" : choice === "dark" ? "themeDark" : "themeSystem",
                )}
              </Seg>
            ))}
          </div>
        </div>
        {user ? (
          <p className="m-0 truncate text-[0.8125rem] text-muted">{user.email}</p>
        ) : null}
        {user ? (
          <button
            type="button"
            className="min-h-12 rounded-full border border-paper-line text-[0.9375rem] font-bold"
            onClick={async () => {
              await signOut();
              onClose();
            }}
          >
            {t(lang, "logout")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
