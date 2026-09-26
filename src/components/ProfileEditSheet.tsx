import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, Trash2, User, X } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { useAuth } from "../context/Auth";
import { useDialog } from "../lib/dialog";
import { useT } from "../lib/useT";
import { accountAvatarUrl } from "../lib/accountAvatar";
import { sheetGenieClass, usePresence } from "../lib/presence";

type Props = {
  open: boolean;
  user: AuthUser;
  onClose: () => void;
  onDeleted: () => void;
};

function displayNameOf(user: AuthUser) {
  const meta = user.user_metadata || {};
  const name = meta.full_name ?? meta.name;
  return typeof name === "string" ? name.trim() : "";
}

function hasGoogleIdentity(user: AuthUser) {
  return (user.identities || []).some((id) => id.provider === "google");
}

export function ProfileEditSheet({ open, user, onClose, onDeleted }: Props) {
  const t = useT();
  const { updateProfile, updatePassword, deleteAccount } = useAuth();
  const { alert, confirm } = useDialog();
  const presence = usePresence(open);

  const [name, setName] = useState(displayNameOf(user));
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [profileOk, setProfileOk] = useState(false);
  const [passwordOk, setPasswordOk] = useState(false);

  const avatarUrl = accountAvatarUrl(user);
  const google = hasGoogleIdentity(user);

  useEffect(() => {
    if (!open) return;
    setName(displayNameOf(user));
    setPassword("");
    setConfirmPw("");
    setProfileMsg("");
    setPasswordMsg("");
    setProfileOk(false);
    setPasswordOk(false);
    setSavingProfile(false);
    setSavingPassword(false);
    setWithdrawing(false);
  }, [open, user]);

  useEffect(() => {
    if (!presence.shown) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape" && !savingProfile && !savingPassword && !withdrawing) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presence.shown, onClose, savingProfile, savingPassword, withdrawing]);

  if (!presence.shown) return null;

  async function onSaveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileMsg("");
    setProfileOk(false);
    const trimmed = name.trim();
    if (!trimmed) {
      setProfileMsg(t("settingsProfileNameRequired"));
      return;
    }
    setSavingProfile(true);
    try {
      const result = await updateProfile(trimmed);
      if (result.error) {
        setProfileMsg(t("settingsProfileSaveError"));
        return;
      }
      setProfileOk(true);
      setProfileMsg(t("settingsProfileSaved"));
    } finally {
      setSavingProfile(false);
    }
  }

  async function onSavePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordOk(false);
    if (password.length < 8) {
      setPasswordMsg(t("passwordShort"));
      return;
    }
    if (password !== confirmPw) {
      setPasswordMsg(t("passwordMismatch"));
      return;
    }
    setSavingPassword(true);
    try {
      const result = await updatePassword(password);
      if (result.error) {
        setPasswordMsg(t("settingsPasswordSaveError"));
        return;
      }
      setPassword("");
      setConfirmPw("");
      setPasswordOk(true);
      setPasswordMsg(t("passwordUpdated"));
    } finally {
      setSavingPassword(false);
    }
  }

  async function onWithdraw() {
    const ok = await confirm({
      title: t("settingsWithdraw"),
      body: t("settingsWithdrawConfirm"),
      confirmLabel: t("settingsWithdraw"),
      danger: true,
    });
    if (!ok) return;
    setWithdrawing(true);
    try {
      const result = await deleteAccount();
      if (result.error) {
        await alert(t("settingsWithdrawError"));
        return;
      }
      onClose();
      onDeleted();
    } finally {
      setWithdrawing(false);
    }
  }

  const busy = savingProfile || savingPassword || withdrawing;

  return (
    <div className="protocol-modal-scrim" onClick={() => !busy && onClose()}>
      <div className="sheet-stage">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-edit-title"
          className={
            "sheet-panel protocol-modal-panel protocol-modal-panel--wide profile-edit-panel" +
            sheetGenieClass(presence.closing)
          }
          onAnimationEnd={(event) => presence.onEnd(event, "sheet-genie-out")}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="protocol-modal-head">
            <div className="protocol-modal-head-copy">
              <h2 id="profile-edit-title" className="protocol-modal-title">
                {t("settingsEditProfile")}
              </h2>
            </div>
            <button
              type="button"
              className="protocol-modal-close"
              onClick={onClose}
              disabled={busy}
              aria-label={t("close")}
            >
              <X className="size-5" strokeWidth={1.8} />
            </button>
          </div>

          <div className="profile-edit-identity">
            <span className={"settings-arch-avatar" + (avatarUrl ? " has-photo" : "")} aria-hidden>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="settings-arch-avatar-img" referrerPolicy="no-referrer" />
              ) : (
                <User className="size-6" strokeWidth={1.6} />
              )}
            </span>
            <div className="profile-edit-identity-copy">
              <p className="settings-arch-profile-meta">{user.email || "—"}</p>
              <p className="settings-arch-profile-name">{displayNameOf(user) || user.email || "—"}</p>
            </div>
          </div>

          <form className="profile-edit-section" onSubmit={(e) => void onSaveProfile(e)}>
            <h3 className="profile-edit-section-title">{t("settingsProfileName")}</h3>
            <p className="profile-edit-section-lead">{t("settingsProfileNameLead")}</p>
            <label className="auth-field-label">
              <span className="auth-field-caption">{t("settingsProfileName")}</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                disabled={busy}
                onChange={(e) => {
                  setName(e.target.value);
                  if (profileMsg) setProfileMsg("");
                  if (profileOk) setProfileOk(false);
                }}
                className="auth-field"
              />
            </label>
            {profileMsg ? (
              <p className={profileOk ? "auth-feedback-ok" : "auth-feedback-error"}>{profileMsg}</p>
            ) : null}
            <button
              type="submit"
              className={"protocol-modal-btn-primary" + (savingProfile ? " is-progress" : "")}
              disabled={busy}
              aria-busy={savingProfile}
            >
              <span>{t("settingsProfileSave")}</span>
            </button>
          </form>

          <form className="profile-edit-section" onSubmit={(e) => void onSavePassword(e)}>
            <h3 className="profile-edit-section-title">
              <KeyRound className="size-4" strokeWidth={1.8} aria-hidden />
              {t("settingsChangePassword")}
            </h3>
            <p className="profile-edit-section-lead">
              {google ? t("settingsPasswordGoogleLead") : t("settingsPasswordLead")}
            </p>
            <label className="auth-field-label">
              <span className="auth-field-caption">{t("newPassword")}</span>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                disabled={busy}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordMsg) setPasswordMsg("");
                  if (passwordOk) setPasswordOk(false);
                }}
                className="auth-field"
              />
            </label>
            <label className="auth-field-label">
              <span className="auth-field-caption">{t("confirmPassword")}</span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPw}
                disabled={busy}
                onChange={(e) => {
                  setConfirmPw(e.target.value);
                  if (passwordMsg) setPasswordMsg("");
                  if (passwordOk) setPasswordOk(false);
                }}
                className="auth-field"
              />
            </label>
            {passwordMsg ? (
              <p className={passwordOk ? "auth-feedback-ok" : "auth-feedback-error"}>{passwordMsg}</p>
            ) : null}
            <button
              type="submit"
              className={"protocol-modal-btn-primary" + (savingPassword ? " is-progress" : "")}
              disabled={busy}
              aria-busy={savingPassword}
            >
              <span>{t("savePassword")}</span>
            </button>
          </form>

          <div className="profile-edit-section profile-edit-section--danger">
            <h3 className="profile-edit-section-title">
              <Trash2 className="size-4" strokeWidth={1.8} aria-hidden />
              {t("settingsWithdraw")}
            </h3>
            <p className="profile-edit-section-lead">{t("settingsWithdrawLead")}</p>
            <button
              type="button"
              className={"protocol-modal-btn-danger" + (withdrawing ? " is-progress" : "")}
              disabled={busy}
              aria-busy={withdrawing}
              onClick={() => void onWithdraw()}
            >
              <Trash2 className="size-3.5" strokeWidth={1.8} aria-hidden />
              <span>{t("settingsWithdraw")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
