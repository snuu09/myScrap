import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabase, isGoogleAuthEnabled, isSupabaseConfigured } from "../lib/supabase";

type AuthState = {
  configured: boolean;
  ready: boolean;
  session: Session | null;
  user: User | null;
  recoveryPending: boolean;
  clearRecoveryPending: () => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirm: boolean }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  requestLoginReminder: (email: string) => Promise<{ error: string | null }>;
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  browse: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [session, setSession] = useState<Session | null>(null);
  const [recoveryPending, setRecoveryPending] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, next) => {
      setSession(next);
      if (event === "PASSWORD_RECOVERY") setRecoveryPending(true);
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      configured,
      ready,
      session,
      user: session?.user ?? null,
      recoveryPending,
      clearRecoveryPending: () => setRecoveryPending(false),
      async signIn(email, password) {
        const supabase = getSupabase();
        if (!supabase) return { error: "config" };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error ? error.message : null };
      },
      async signUp(email, password) {
        const supabase = getSupabase();
        if (!supabase) return { error: "config", needsConfirm: false };
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: error.message, needsConfirm: false };
        return { error: null, needsConfirm: !data.session };
      },
      async signInWithGoogle() {
        const supabase = getSupabase();
        if (!supabase) return { error: "config" };
        if (!(await isGoogleAuthEnabled())) return { error: "google_disabled" };
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: window.location.origin },
        });
        return { error: error ? error.message : null };
      },
      async requestLoginReminder(email) {
        const supabase = getSupabase();
        if (!supabase) return { error: "config" };
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false, emailRedirectTo: window.location.origin },
        });
        return { error: error ? error.message : null };
      },
      async requestPasswordReset(email) {
        const supabase = getSupabase();
        if (!supabase) return { error: "config" };
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        return { error: error ? error.message : null };
      },
      async updatePassword(password) {
        const supabase = getSupabase();
        if (!supabase) return { error: "config" };
        const { error } = await supabase.auth.updateUser({ password });
        if (!error) setRecoveryPending(false);
        return { error: error ? error.message : null };
      },
      async browse() {
        const supabase = getSupabase();
        if (!supabase) return { error: "config" };
        const anon = await supabase.auth.signInAnonymously();
        if (!anon.error) return { error: null };
        const disabled =
          anon.error.code === "anonymous_provider_disabled" ||
          /anonymous sign-ins are disabled/i.test(anon.error.message);
        if (!disabled) return { error: anon.error.message };
        const email = `${crypto.randomUUID()}@guest.mybrary.test`;
        const password = `${crypto.randomUUID()}Aa1!`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { browse: true } },
        });
        return { error: error ? error.message : null };
      },
      async signOut() {
        const supabase = getSupabase();
        if (supabase) await supabase.auth.signOut();
        setRecoveryPending(false);
      },
    }),
    [configured, ready, session, recoveryPending],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function isBrowseUser(user: User | null) {
  return Boolean(user?.is_anonymous || user?.user_metadata?.browse === true);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth");
  return ctx;
}
