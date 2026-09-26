import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Mail, X } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useAuth } from "../context/Auth";
import { localScrapCount } from "../lib/localScraps";
import { GoogleMark } from "./GoogleMark";
import { GlassCluster } from "./GlassCluster";
import { markArriveGenie } from "../lib/pageGenie";
import { sheetGenieClass, usePresence } from "../lib/presence";

type Props = {
  open: boolean;
  onClose: () => void;
  /** "sheet" = floating corner panel with scrim (default). "page" = inline panel for a dedicated route. */
  variant?: "sheet" | "page";
  /** Controlled auth step when variant is "page" (Header back). */
  pageMode?: AuthMode;
  onPageModeChange?: (mode: AuthMode) => void;
};
export type AuthMode = "chooser" | "in" | "up" | "findId" | "resetPassword" | "newPassword";
type Mode = AuthMode;
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
  if (mode === "chooser") return "enter";
  if (mode === "up") return "signUp";
  if (mode === "findId") return "findId";
  if (mode === "resetPassword") return "resetPassword";
  if (mode === "newPassword") return "resetPassword";
  return "emailSignIn";
}

function GoogleHintCallout({ lang }: { lang: "ko" | "en" }) {
  return (
    <p className="auth-callout">
      {t(lang, "googleAccountHintLead")}{" "}
      <strong className="auth-callout-action ui-nowrap-phrase">{t(lang, "googleContinue")}</strong>
      {t(lang, "googleAccountHintTail")}
    </p>
  );
}

function AuthDivider({ lang, labelKey = "authOr" }: { lang: "ko" | "en"; labelKey?: string }) {
  return (
    <div className="auth-divider" role="separator">
      {t(lang, labelKey)}
    </div>
  );
}

export function AuthSheet({
  open,
  onClose,
  variant = "sheet",
  pageMode,
  onPageModeChange,
}: Props) {
  const { lang, look } = usePrefs();
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
  const [internalMode, setInternalMode] = useState<Mode>(variant === "page" ? "in" : "chooser");
  const pageControlled = variant === "page" && pageMode != null && Boolean(onPageModeChange);
  const mode = pageControlled ? pageMode! : internalMode;

  function setMode(next: Mode) {
    if (pageControlled) onPageModeChange!(next);
    else setInternalMode(next);
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyKind, setBusyKind] = useState<"google" | "browse" | "submit" | null>(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [fields, setFields] = useState<FieldErrors>({});

  useEffect(() => {
    if (open && recoveryPending) setMode("newPassword");
  }, [open, recoveryPending]);

  const presence = usePresence(open);

  useEffect(() => {
    if (presence.shown) return;
    setMode(variant === "page" ? "in" : "chooser");
    setEmail("");
    setPassword("");
    setConfirm("");
    setShowPassword(false);
    setMessage("");
    setSuccess("");
    setFields({});
    setBusy(false);
    setBusyKind(null);
  }, [presence.shown, variant]);

  if (!presence.shown) return null;

  function startBusy(kind: "google" | "browse" | "submit") {
    setBusy(true);
    setBusyKind(kind);
  }

  function endBusy() {
    setBusy(false);
    setBusyKind(null);
  }

  function backToChooser() {
    setMode(variant === "page" ? "in" : "chooser");
    setMessage("");
    setSuccess("");
    setFields({});
    clearRecoveryPending();
  }

  function backToLogin() {
    setMode("in");
    setMessage("");
    setSuccess("");
    setFields({});
    clearRecoveryPending();
  }

  function authMessage(code: string | null) {
    if (!code) return t(lang, "authError");
    if (code === "timeout") return t(lang, "authTimeout");
    if (code === "google_disabled") return t(lang, "authGoogleDisabled");
    if (code === "config") return t(lang, "authNeedConfig");
    return t(lang, "authError");
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
      startBusy("submit");
      try {
        const result =
          mode === "findId"
            ? await requestLoginReminder(email.trim())
            : await requestPasswordReset(email.trim());
        if (result.error) {
          setMessage(authMessage(result.error));
          return;
        }
        setSuccess(t(lang, "recoverySent"));
      } finally {
        endBusy();
      }
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
      startBusy("submit");
      try {
        const result = await updatePassword(password);
        if (result.error) {
          setMessage(authMessage(result.error));
          return;
        }
        clearRecoveryPending();
        markArriveGenie();
        onClose();
      } finally {
        endBusy();
      }
      return;
    }

    if (mode !== "in" && mode !== "up") return;

    const next: FieldErrors = {};
    const emailErr = emailIssue(lang, email);
    const passwordErr = passwordIssue(lang, password, mode === "up");
    if (emailErr) next.email = emailErr;
    if (passwordErr) next.password = passwordErr;
    if (mode === "up" && !passwordErr && password !== confirm) {
      next.confirm = t(lang, "passwordMismatch");
    }
    setFields(next);
    if (next.email || next.password || next.confirm) return;
    if (!configured) {
      setMessage(t(lang, "authNeedConfig"));
      return;
    }
    startBusy("submit");
    try {
      if (mode === "up") {
        const result = await signUp(email.trim(), password);
        if (result.error) {
          setMessage(authMessage(result.error));
          return;
        }
        if (result.needsConfirm) {
          setSuccess("");
          setMessage(t(lang, "signUpOk"));
          return;
        }
        markArriveGenie();
        onClose();
        return;
      }
      const result = await signIn(email.trim(), password);
      if (result.error) {
        setMessage(authMessage(result.error));
        return;
      }
      markArriveGenie();
      onClose();
    } finally {
      endBusy();
    }
  }

  async function onGoogle() {
    setMessage("");
    setSuccess("");
    setFields({});
    if (!configured) {
      setMessage(t(lang, "authNeedConfig"));
      return;
    }
    startBusy("google");
    const result = await signInWithGoogle();
    if (result.error) {
      endBusy();
      setMessage(authMessage(result.error));
    }
  }

  async function onBrowse() {
    setMessage("");
    setSuccess("");
    setFields({});
    if (!configured) {
      setMessage(t(lang, "authNeedConfig"));
      return;
    }
    startBusy("browse");
    try {
      const result = await browse();
      if (result.error) {
        setMessage(authMessage(result.error));
        return;
      }
      markArriveGenie();
      onClose();
    } finally {
      endBusy();
    }
  }

  const inputClass = (invalid: boolean) =>
    "auth-field" + (invalid ? " is-invalid" : "");

  const localCount = localScrapCount();
  const isChooser = mode === "chooser";
  const isRecovery = mode === "findId" || mode === "resetPassword";
  const isLoginForm = mode === "in" || mode === "up";
  const isPage = variant === "page";
  const isPageDossier = isPage && isLoginForm;
  /** Sheet only: in-card back. Page uses Header back. */
  const showBack = !isPage && (isRecovery || mode === "newPassword" || isLoginForm);

  const submitLabel =
    mode === "findId"
      ? t(lang, "findId")
      : mode === "resetPassword"
        ? t(lang, "resetPassword")
        : mode === "newPassword"
          ? t(lang, "savePassword")
          : mode === "up"
            ? t(lang, "signUp")
            : isPage
              ? t(lang, "loginOpenShelf")
              : t(lang, "enter");

  function progressClass(kind: "google" | "browse" | "submit") {
    return busyKind === kind ? " is-progress" : "";
  }

  let feedback: ReactNode = null;
  if (success) feedback = <p className="auth-feedback-ok">{success}</p>;
  else if (message) feedback = <p className="auth-feedback-error">{message}</p>;

  function ConfirmField() {
    return (
      <label className="auth-field-label">
        <span className="auth-field-caption">{t(lang, "confirmPassword")}</span>
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
    );
  }

  function EmailField({ withIcon }: { withIcon?: boolean }) {
    return (
      <label className={"auth-field-label" + (withIcon ? " auth-field-label--icon" : "")}>
        <span className="auth-field-caption">{t(lang, "email")}</span>
        <span className={withIcon ? "auth-field-shell" : undefined}>
          {withIcon ? <Mail className="auth-field-icon" strokeWidth={1.7} aria-hidden /> : null}
          <input
            type="email"
            autoComplete="email"
            value={email}
            placeholder={withIcon ? "archivist@mybrary.archive" : undefined}
            aria-invalid={Boolean(fields.email)}
            aria-describedby={fields.email ? "auth-email-error" : undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fields.email) setFields((prev) => ({ ...prev, email: undefined }));
            }}
            className={inputClass(Boolean(fields.email)) + (withIcon ? " auth-field--icon" : "")}
          />
        </span>
        {fields.email ? (
          <span id="auth-email-error" className="text-[0.75rem] text-danger">
            {fields.email}
          </span>
        ) : null}
      </label>
    );
  }

  function PasswordField({ withIcon, withToggle }: { withIcon?: boolean; withToggle?: boolean }) {
    return (
      <label className={"auth-field-label" + (withIcon ? " auth-field-label--icon" : "")}>
        <span className="auth-field-caption">{t(lang, mode === "newPassword" ? "newPassword" : "password")}</span>
        <span className={withIcon || withToggle ? "auth-field-shell" : undefined}>
          {withIcon ? <KeyRound className="auth-field-icon" strokeWidth={1.7} aria-hidden /> : null}
          <input
            type={withToggle && showPassword ? "text" : "password"}
            autoComplete={mode === "up" || mode === "newPassword" ? "new-password" : "current-password"}
            value={password}
            placeholder={withIcon ? "••••••••" : undefined}
            aria-invalid={Boolean(fields.password)}
            aria-describedby={fields.password ? "auth-password-error" : "auth-password-hint"}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fields.password) setFields((prev) => ({ ...prev, password: undefined }));
            }}
            className={
              inputClass(Boolean(fields.password)) +
              (withIcon ? " auth-field--icon" : "") +
              (withToggle ? " auth-field--toggle" : "")
            }
          />
          {withToggle ? (
            <button
              type="button"
              className="auth-field-eye"
              aria-label={t(lang, showPassword ? "hidePassword" : "showPassword")}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <Eye className="size-4" strokeWidth={1.7} /> : <EyeOff className="size-4" strokeWidth={1.7} />}
            </button>
          ) : null}
        </span>
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
    );
  }

  const googleButton = (
    <GlassCluster className="liquid-solo">
      <button
        type="button"
        disabled={busy}
        aria-busy={busyKind === "google"}
        className={"auth-btn-tertiary" + (isPage ? " login-google-btn" : "") + progressClass("google")}
        onClick={() => void onGoogle()}
      >
        <GoogleMark />
        {t(lang, "googleContinue")}
      </button>
    </GlassCluster>
  );

  const dossierBody = (
    <>
      <div className="login-dossier-spine" aria-hidden />
      <div className="login-dossier-body">
        <div className="login-dossier-intro">
          <div className="login-dossier-copy">
            <h2 id="auth-title" className="login-dossier-title">
              {mode === "up" ? t(lang, "signUp") : t(lang, "loginConnectTitle")}
            </h2>
            <p className="login-dossier-lead">{t(lang, "loginConnectLead")}</p>
          </div>
        </div>

        {localCount > 0 ? (
          <div className="auth-resume">
            <p className="auth-callout">{t(lang, "guestResume", { n: localCount }, look)}</p>
            <GlassCluster className="liquid-solo">
              <button
                type="button"
                disabled={busy}
                aria-busy={busyKind === "browse"}
                className={"auth-btn-secondary" + progressClass("browse")}
                onClick={() => void onBrowse()}
              >
                {t(lang, "guestResumeCta")}
              </button>
            </GlassCluster>
          </div>
        ) : null}

        {mode === "in" ? googleButton : null}
        {mode === "in" ? <AuthDivider lang={lang} labelKey="authOrEmail" /> : null}

        <form className="login-dossier-form" noValidate onSubmit={onSubmit}>
          <EmailField withIcon />
          <PasswordField withIcon withToggle />
          {mode === "up" ? <ConfirmField /> : null}

          <GlassCluster className="liquid-solo" magnet ripple>
            <button
              type="submit"
              disabled={busy}
              aria-busy={busyKind === "submit"}
              className={"auth-btn-primary login-open-btn" + progressClass("submit")}
            >
              <span>{submitLabel}</span>
              {mode === "in" ? <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden /> : null}
            </button>
          </GlassCluster>
          {feedback}

          {mode === "in" ? (
            <button
              type="button"
              disabled={busy}
              aria-busy={busyKind === "browse"}
              className={"login-browse-btn" + progressClass("browse")}
              onClick={() => void onBrowse()}
            >
              <Eye className="size-4" strokeWidth={1.7} aria-hidden />
              <span>{t(lang, "browseGuest")}</span>
            </button>
          ) : null}

          <div className="login-dossier-foot">
            {mode === "in" ? (
              <p className="login-dossier-signup">
                {t(lang, "loginNoAccount")}{" "}
                <button
                  type="button"
                  className="auth-link-toggle login-dossier-signup-link"
                  onClick={() => {
                    setMode("up");
                    setMessage("");
                    setFields({});
                    setConfirm("");
                  }}
                >
                  {t(lang, "loginSignUpInvite")}
                </button>
              </p>
            ) : (
              <button
                type="button"
                className="auth-link-toggle"
                onClick={() => {
                  setMode("in");
                  setMessage("");
                  setSuccess("");
                  setFields({});
                  setConfirm("");
                }}
              >
                {t(lang, "emailSignIn")}
              </button>
            )}
            {mode === "in" ? (
              <p className="login-dossier-find">
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
                <span className="login-dossier-find-sep" aria-hidden>
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
          </div>
        </form>
      </div>
    </>
  );

  const sheetBody = (
    <>
      <div className={"auth-sheet-head" + (showBack ? " has-back" : "")}>
        {showBack ? (
          <button
            type="button"
            className="auth-back-btn"
            onClick={isLoginForm ? backToChooser : backToLogin}
            aria-label={t(lang, "backToLogin")}
          >
            <ArrowLeft className="size-[22px]" strokeWidth={1.8} aria-hidden />
          </button>
        ) : null}
        <h2 id="auth-title" className="auth-sheet-title">
          {t(lang, titleKey(mode))}
        </h2>
        {variant === "sheet" ? (
          <button
            type="button"
            className="auth-sheet-close"
            onClick={onClose}
            aria-label={t(lang, "close")}
            disabled={busy}
          >
            <X className="size-[22px]" strokeWidth={1.8} />
          </button>
        ) : null}
      </div>

      {isChooser ? (
        <div className="flex flex-col gap-2">
          {localCount > 0 ? (
            <div className="auth-resume">
              <p className="auth-callout">{t(lang, "guestResume", { n: localCount }, look)}</p>
              <GlassCluster className="liquid-solo">
                <button
                  type="button"
                  disabled={busy}
                  aria-busy={busyKind === "browse"}
                  className={"auth-btn-secondary" + progressClass("browse")}
                  onClick={() => void onBrowse()}
                >
                  {t(lang, "guestResumeCta")}
                </button>
              </GlassCluster>
            </div>
          ) : null}
          {googleButton}
          <GlassCluster className="liquid-solo" magnet ripple>
            <button
              type="button"
              disabled={busy}
              className="auth-btn-primary"
              onClick={() => {
                setMode("in");
                setMessage("");
                setFields({});
              }}
            >
              {t(lang, "emailSignIn")}
            </button>
          </GlassCluster>
          {localCount > 0 ? null : (
            <GlassCluster className="liquid-solo">
              <button
                type="button"
                disabled={busy}
                aria-busy={busyKind === "browse"}
                className={"auth-btn-secondary" + progressClass("browse")}
                onClick={() => void onBrowse()}
              >
                {t(lang, "browse")}
              </button>
            </GlassCluster>
          )}
          {feedback}
          <button
            type="button"
            className="auth-link-toggle"
            onClick={() => {
              setMode("up");
              setMessage("");
              setFields({});
            }}
          >
            {t(lang, "signUp")}
          </button>
        </div>
      ) : (
        <form className="flex flex-col gap-3" noValidate onSubmit={onSubmit}>
          {isRecovery ? (
            <div className="auth-recovery-brief">
              <p className="auth-lead">{t(lang, mode === "findId" ? "findIdLead" : "resetPasswordLead")}</p>
              <GoogleHintCallout lang={lang} />
            </div>
          ) : null}

          {mode !== "newPassword" ? <EmailField /> : null}
          {isLoginForm || mode === "newPassword" ? <PasswordField /> : null}
          {mode === "up" || mode === "newPassword" ? <ConfirmField /> : null}

          <div className="flex flex-col gap-2">
            <GlassCluster className="liquid-solo" magnet ripple>
              <button
                type="submit"
                disabled={busy}
                aria-busy={busyKind === "submit"}
                className={"auth-btn-primary" + progressClass("submit")}
              >
                {submitLabel}
              </button>
            </GlassCluster>
            {feedback}
          </div>

          {isRecovery ? (
            <>
              <AuthDivider lang={lang} />
              {googleButton}
            </>
          ) : null}

          {isLoginForm ? (
            <button
              type="button"
              className="auth-link-toggle"
              onClick={() => {
                setMode(mode === "up" ? "in" : "up");
                setMessage("");
                setSuccess("");
                setFields({});
                setConfirm("");
              }}
            >
              {mode === "up" ? t(lang, "emailSignIn") : t(lang, "signUp")}
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
      )}
    </>
  );

  const pageRecoveryBody = (
    <>
      <div className="login-dossier-spine" aria-hidden />
      <div className="login-dossier-body">
        <div className="login-dossier-intro">
          <div className="login-dossier-copy">
            <h2 id="auth-title" className="login-dossier-title">
              {t(lang, titleKey(mode))}
            </h2>
          </div>
        </div>
        <form className="login-dossier-form" noValidate onSubmit={onSubmit}>
          {isRecovery ? (
            <div className="auth-recovery-brief">
              <p className="auth-lead">{t(lang, mode === "findId" ? "findIdLead" : "resetPasswordLead")}</p>
              <GoogleHintCallout lang={lang} />
            </div>
          ) : null}
          {mode !== "newPassword" ? <EmailField withIcon /> : null}
          {mode === "newPassword" ? <PasswordField withIcon withToggle /> : null}
          {mode === "newPassword" ? <ConfirmField /> : null}
          <div className="flex flex-col gap-2">
            <GlassCluster className="liquid-solo" magnet ripple>
              <button
                type="submit"
                disabled={busy}
                aria-busy={busyKind === "submit"}
                className={"auth-btn-primary" + progressClass("submit")}
              >
                {submitLabel}
              </button>
            </GlassCluster>
            {feedback}
          </div>
          {isRecovery ? (
            <>
              <AuthDivider lang={lang} />
              {googleButton}
            </>
          ) : null}
        </form>
      </div>
    </>
  );

  const panel = (
    <div
      role={variant === "sheet" ? "dialog" : undefined}
      aria-modal={variant === "sheet" ? true : undefined}
      aria-labelledby="auth-title"
      className={
        (variant === "sheet"
          ? "auth-sheet-panel"
          : "auth-sheet-panel auth-sheet-panel--page login-dossier") +
        sheetGenieClass(presence.closing, variant === "sheet" ? "corner" : undefined)
      }
      onAnimationEnd={(event) => presence.onEnd(event, "sheet-genie-out")}
      onClick={variant === "sheet" ? (e) => e.stopPropagation() : undefined}
    >
      {isPageDossier ? dossierBody : isPage ? pageRecoveryBody : sheetBody}
    </div>
  );

  if (variant === "page") return panel;

  return (
    <div className="auth-sheet-scrim" onClick={onClose}>
      {panel}
    </div>
  );
}
