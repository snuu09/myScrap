import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useAuth } from "../context/Auth";

type Props = { open: boolean; onClose: () => void };

export function AuthSheet({ open, onClose }: Props) {
  const { lang } = usePrefs();
  const { configured, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (!open) return null;

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setMessage("");
    if (!configured) {
      setMessage(t(lang, "authNeedConfig"));
      return;
    }
    setBusy(true);
    if (mode === "up") {
      const result = await signUp(email.trim(), password);
      setBusy(false);
      if (result.error) {
        setMessage(t(lang, "authError"));
        return;
      }
      if (result.needsConfirm) {
        setMessage(t(lang, "signUpOk"));
        return;
      }
      onClose();
      return;
    }
    const result = await signIn(email.trim(), password);
    setBusy(false);
    if (result.error) {
      setMessage(t(lang, "authError"));
      return;
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-30 bg-[color-mix(in_srgb,var(--color-ink)_24%,transparent)]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="absolute top-[60px] right-[var(--gutter,clamp(16px,4vw,40px))] w-[min(22rem,calc(100vw-24px))] rounded-[32px] border border-paper-line bg-login-wall p-3.5 shadow-[var(--shadow-sheet)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 id="auth-title" className="m-0 text-[1.0625rem] font-bold">
            {t(lang, mode === "up" ? "signUp" : "enter")}
          </h2>
          <button type="button" className="grid size-12 place-items-center" onClick={onClose} aria-label={t(lang, "close")}>
            <X className="size-[22px]" strokeWidth={1.8} />
          </button>
        </div>
        <form className="flex flex-col gap-2.5" onSubmit={onSubmit}>
          <label className="grid gap-1 text-[0.8125rem] text-muted">
            {t(lang, "email")}
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-12 rounded-[14px] border border-paper-line bg-paper px-3 text-[0.9375rem] text-ink"
            />
          </label>
          <label className="grid gap-1 text-[0.8125rem] text-muted">
            {t(lang, "password")}
            <input
              type="password"
              required
              minLength={8}
              autoComplete={mode === "up" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-12 rounded-[14px] border border-paper-line bg-paper px-3 text-[0.9375rem] text-ink"
            />
            <span className="text-[0.75rem]">{t(lang, "passwordHint")}</span>
          </label>
          {message ? <p className="m-0 text-[0.8125rem] text-danger">{message}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="min-h-12 rounded-full bg-magnet text-[0.9375rem] font-bold text-magnet-ink disabled:opacity-60"
          >
            {busy ? t(lang, "authWorking") : t(lang, mode === "up" ? "signUp" : "enter")}
          </button>
          <button
            type="button"
            className="min-h-10 text-[0.8125rem] text-muted"
            onClick={() => {
              setMode(mode === "up" ? "in" : "up");
              setMessage("");
            }}
          >
            {mode === "up" ? t(lang, "enter") : t(lang, "signUp")}
          </button>
        </form>
      </div>
    </div>
  );
}
