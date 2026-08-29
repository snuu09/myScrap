import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, X } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useAuth } from "../context/Auth";
import { GoogleMark } from "./GoogleMark";

type Props = { open: boolean; onClose: () => void };
type Mode = "in" | "up" | "findId" | "resetPassword" | "newPassword";
type FieldErrors = { email?: string; password?: string; confirm?: string };

function emailIssue(lang: "ko" | "en", value: string) {
  const trimmed = value.trim();
  if (!trimmed) return t(lang, "emailRequired");
  if (!trimmed.includes("@")) return t(lang, "emailInvalid");
  return "";
}

function passwordIssue(lang: "ko" | "en", value: string, signup: boolean) {
  if (!value) return t(lang, "passwordRequired");
  if (signup && value.length < 8) return t(lang, "passwordShort");
  return "";
}

function titleKey(mode: Mode) {
  if (mode === "up") return "signUp";
  if (mode === "findId") return "findId";
  if (mode === "resetPassword") return "resetPassword";
  if (mode === "newPassword") return "resetPassword";
  return "enter";
}

function GoogleHintCallout({ lang }: { lang: "ko" | "en" }) {
  return (
    <p className="auth-callout">
      {t(lang, "googleAccountHintLead")}{" "}
      <strong className="auth-callout-action">{t(lang, "googleContinue")}</strong>
      {t(lang, "googleAccountHintTail")}
    </p>
  );
}

function AuthDivider({ lang }: { lang: "ko" | "en" }) {
  return (
    <div className="auth-divider" role="separator">
      {t(lang, "authOr")}
    </div>
  );
}

export function AuthSheet({ open, onClose }: Props) {
  const { lang } = usePrefs();
  const {
    configured,
    recoveryPending,
    clearRecoveryPending,
    signIn,
    signUp,
    signInWithGoogle,
    requestLoginReminder,
    requestPasswordReset,
    updatePassword,
    browse,
  } = useAuth();
  const [mode, setMode] = useState<Mode>("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [fields, setFields] = useState<FieldErrors>({});

  useEffect(() => {
    if (open && recoveryPending) setMode("newPassword");
  }, [open, recoveryPending]);

  useEffect(() => {
    if (!open) {
      setMode("in");
      setEmail("");
      setPassword("");
      setConfirm("");
      setMessage("");
      setSuccess("");
      setFields({});
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  function backToLogin() {
    setMode("in");
    setMessage("");
    setSuccess("");
    setFields({});
    clearRecoveryPending();
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setMessage("");
    setSuccess("");

    if (mode === "findId" || mode === "resetPassword") {
      const emailErr = emailIssue(lang, email);
      setFields(emailErr ? { email: emailErr } : {});
      if (emailErr) return;
      if (!configured) {
        setMessage(t(lang, "authNeedConfig"));
        return;
      }
      setBusy(true);
      const result =
        mode === "findId"
          ? await requestLoginReminder(email.trim())
          : await requestPasswordReset(email.trim());
      setBusy(false);
      if (result.error) {
        setMessage(t(lang, "authError"));
        return;
      }
      setSuccess(t(lang, "recoverySent"));
      return;
    }

    if (mode === "newPassword") {
      const next: FieldErrors = {};
      const passwordErr = passwordIssue(lang, password, true);
      if (passwordErr) next.password = passwordErr;
      else if (password !== confirm) next.confirm = t(lang, "passwordMismatch");
      setFields(next);
      if (next.password || next.confirm) return;
      if (!configured) {
        setMessage(t(lang, "authNeedConfig"));
        return;
      }
      setBusy(true);
      const result = await updatePassword(password);
      setBusy(false);
      if (result.error) {
        setMessage(t(lang, "authError"));
        return;
      }
      clearRecoveryPending();
      onClose();
      return;
    }

    const next: FieldErrors = {};
    const emailErr = emailIssue(lang, email);
    const passwordErr = passwordIssue(lang, password, mode === "up");
    if (emailErr) next.email = emailErr;
    if (passwordErr) next.password = passwordErr;
    setFields(next);
    if (next.email || next.password) return;
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

  async function onGoogle() {
    setMessage("");
    setSuccess("");
    setFields({});
    if (!configured) {
      setMessage(t(lang, "authNeedConfig"));
      return;
    }
    setBusy(true);
    const result = await signInWithGoogle();
    setBusy(false);
    if (result.error) setMessage(t(lang, "authError"));
  }

  async function onBrowse() {
    setMessage("");
    setSuccess("");
    setFields({});
    if (!configured) {
      setMessage(t(lang, "authNeedConfig"));
      return;
    }
    setBusy(true);
    const result = await browse();
    setBusy(false);
    if (result.error) {
      setMessage(t(lang, "authError"));
      return;
    }
    onClose();
  }

  const inputClass = (invalid: boolean) =>
    "min-h-12 rounded-[14px] border bg-paper px-3 text-[0.9375rem] text-ink " +
    (invalid ? "border-danger" : "border-paper-line");

  const isRecovery = mode === "findId" || mode === "resetPassword";
  const isLoginForm = mode === "in" || mode === "up";
  const showBrowse = isLoginForm;
  const showGoogle = isLoginForm || isRecovery;
  const showToggle = isLoginForm;
  const showDivider = (isLoginForm && showGoogle) || isRecovery;

  const submitLabel =
    busy
      ? t(lang, "authWorking")
      : mode === "findId"
        ? t(lang, "findId")
        : mode === "resetPassword"
          ? t(lang, "resetPassword")
          : mode === "newPassword"
            ? t(lang, "savePassword")
            : t(lang, mode === "up" ? "signUp" : "enter");

  const showBack = isRecovery || mode === "newPassword";

  let feedback: ReactNode = null;
  if (success) feedback = <p className="auth-feedback-ok">{success}</p>;
  else if (message) feedback = <p className="auth-feedback-error">{message}</p>;

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
        <div className={`mb-3 flex items-center gap-1 ${showBack ? "" : "justify-between"}`}>
          {showBack ? (
            <button
              type="button"
              className="auth-back-btn"
              onClick={backToLogin}
              aria-label={t(lang, "backToLogin")}
            >
              <ArrowLeft className="size-[22px]" strokeWidth={1.8} aria-hidden />
            </button>
          ) : null}
          <h2 id="auth-title" className="m-0 min-w-0 flex-1 text-[1.0625rem] font-bold">
            {t(lang, titleKey(mode))}
          </h2>
          <button
            type="button"
            className="grid size-12 shrink-0 place-items-center"
            onClick={onClose}
            aria-label={t(lang, "close")}
          >
            <X className="size-[22px]" strokeWidth={1.8} />
          </button>
        </div>
        <form className="flex flex-col gap-3" noValidate onSubmit={onSubmit}>
          {isRecovery ? (
            <div className="auth-recovery-brief">
              <p className="auth-lead">{t(lang, mode === "findId" ? "findIdLead" : "resetPasswordLead")}</p>
              <GoogleHintCallout lang={lang} />
            </div>
          ) : null}

          {mode !== "newPassword" ? (
            <label className="grid gap-1 text-[0.8125rem] text-muted">
              {t(lang, "email")}
              <input
                type="email"
                autoComplete="email"
                value={email}
                aria-invalid={Boolean(fields.email)}
                aria-describedby={fields.email ? "auth-email-error" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fields.email) setFields((prev) => ({ ...prev, email: undefined }));
                }}
                className={inputClass(Boolean(fields.email))}
              />
              {fields.email ? (
                <span id="auth-email-error" className="text-[0.75rem] text-danger">
                  {fields.email}
                </span>
              ) : null}
            </label>
          ) : null}

          {isLoginForm || mode === "newPassword" ? (
            <label className="grid gap-1 text-[0.8125rem] text-muted">
              {t(lang, mode === "newPassword" ? "newPassword" : "password")}
              <input
                type="password"
                autoComplete={mode === "up" || mode === "newPassword" ? "new-password" : "current-password"}
                value={password}
                aria-invalid={Boolean(fields.password)}
                aria-describedby={fields.password ? "auth-password-error" : "auth-password-hint"}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fields.password) setFields((prev) => ({ ...prev, password: undefined }));
                }}
                className={inputClass(Boolean(fields.password))}
              />
              {fields.password ? (
                <span id="auth-password-error" className="text-[0.75rem] text-danger">
                  {fields.password}
                </span>
              ) : (
                <span id="auth-password-hint" className="text-[0.75rem] text-muted">
                  {t(lang, "passwordHint")}
                </span>
              )}
            </label>
          ) : null}

          {mode === "newPassword" ? (
            <label className="grid gap-1 text-[0.8125rem] text-muted">
              {t(lang, "confirmPassword")}
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                aria-invalid={Boolean(fields.confirm)}
                aria-describedby={fields.confirm ? "auth-confirm-error" : undefined}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (fields.confirm) setFields((prev) => ({ ...prev, confirm: undefined }));
                }}
                className={inputClass(Boolean(fields.confirm))}
              />
              {fields.confirm ? (
                <span id="auth-confirm-error" className="text-[0.75rem] text-danger">
                  {fields.confirm}
                </span>
              ) : null}
            </label>
          ) : null}

          <div className="flex flex-col gap-2">
            <button type="submit" disabled={busy} className="auth-btn-primary">
              {submitLabel}
            </button>
            {feedback}
          </div>

          {showDivider ? <AuthDivider lang={lang} /> : null}

          {showGoogle ? (
            <button type="button" disabled={busy} className="auth-btn-tertiary" onClick={() => void onGoogle()}>
              <GoogleMark />
              {t(lang, "googleContinue")}
            </button>
          ) : null}

          {showBrowse ? (
            <button type="button" disabled={busy} className="auth-btn-secondary" onClick={() => void onBrowse()}>
              {t(lang, "browse")}
            </button>
          ) : null}

          {showToggle ? (
            <button
              type="button"
              className="auth-link-toggle"
              onClick={() => {
                setMode(mode === "up" ? "in" : "up");
                setMessage("");
                setSuccess("");
                setFields({});
              }}
            >
              {mode === "up" ? t(lang, "enter") : t(lang, "signUp")}
            </button>
          ) : null}

          {mode === "in" ? (
            <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1">
              <button
                type="button"
                className="auth-link-utility"
                onClick={() => {
                  setMode("findId");
                  setMessage("");
                  setSuccess("");
                  setFields({});
                }}
              >
                {t(lang, "findId")}
              </button>
              <span className="text-[0.8125rem] text-ink-soft" aria-hidden>
                ·
              </span>
              <button
                type="button"
                className="auth-link-utility"
                onClick={() => {
                  setMode("resetPassword");
                  setMessage("");
                  setSuccess("");
                  setFields({});
                }}
              >
                {t(lang, "resetPassword")}
              </button>
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
