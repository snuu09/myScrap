import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";

export { isBrowseUser } from "../lib/guest";

const AUTH_TIMEOUT_MS = 25_000;

async function withTimeout<T>(promise: Promise<T>, ms = AUTH_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

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

function mapAuthError(error: { message: string; code?: string } | null): string | null {
  if (!error) return null;
  const msg = error.message || "";
  const code = error.code || "";
  if (/provider is not enabled|validation_failed|unsupported provider/i.test(msg + code)) {
    return "google_disabled";
  }
  return msg || "auth_error";
}

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
        try {
          const { error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }));
          return { error: error ? error.message : null };
        } catch (err) {
          return { error: err instanceof Error && err.message === "timeout" ? "timeout" : "auth_error" };
        }
      },
      async signUp(email, password) {
        const supabase = getSupabase();
        if (!supabase) return { error: "config", needsConfirm: false };
        try {
          const { data, error } = await withTimeout(supabase.auth.signUp({ email, password }));
          if (error) return { error: error.message, needsConfirm: false };
          return { error: null, needsConfirm: !data.session };
        } catch (err) {
          return {
            error: err instanceof Error && err.message === "timeout" ? "timeout" : "auth_error",
            needsConfirm: false,
          };
        }
      },
      async signInWithGoogle() {
        const supabase = getSupabase();
        if (!supabase) return { error: "config" };
        try {
          const { error } = await withTimeout(
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: window.location.origin },
            }),
            AUTH_TIMEOUT_MS,
          );
          return { error: mapAuthError(error) };
        } catch (err) {
          return { error: err instanceof Error && err.message === "timeout" ? "timeout" : "auth_error" };
        }
      },
      async requestLoginReminder(email) {
        const supabase = getSupabase();
        if (!supabase) return { error: "config" };
        try {
          const { error } = await withTimeout(
            supabase.auth.signInWithOtp({
              email,
              options: { shouldCreateUser: false, emailRedirectTo: window.location.origin },
            }),
          );
          return { error: error ? error.message : null };
        } catch (err) {
          return { error: err instanceof Error && err.message === "timeout" ? "timeout" : "auth_error" };
        }
      },
      async requestPasswordReset(email) {
        const supabase = getSupabase();
        if (!supabase) return { error: "config" };
        try {
          const { error } = await withTimeout(
            supabase.auth.resetPasswordForEmail(email, {
              redirectTo: window.location.origin,
            }),
          );
          return { error: error ? error.message : null };
        } catch (err) {
          return { error: err instanceof Error && err.message === "timeout" ? "timeout" : "auth_error" };
        }
      },
      async updatePassword(password) {
        const supabase = getSupabase();
        if (!supabase) return { error: "config" };
        try {
          const { error } = await withTimeout(supabase.auth.updateUser({ password }));
          if (!error) setRecoveryPending(false);
          return { error: error ? error.message : null };
        } catch (err) {
          return { error: err instanceof Error && err.message === "timeout" ? "timeout" : "auth_error" };
        }
      },
      async browse() {
        const supabase = getSupabase();
        if (!supabase) return { error: "config" };
        try {
          const anon = await withTimeout(supabase.auth.signInAnonymously());
          if (!anon.error) return { error: null };
          const disabled =
            anon.error.code === "anonymous_provider_disabled" ||
            /anonymous sign-ins are disabled/i.test(anon.error.message);
          if (!disabled) return { error: anon.error.message };
          const email = `${crypto.randomUUID()}@guest.mybrary.test`;
          const password = `${crypto.randomUUID()}Aa1!`;
          const { error } = await withTimeout(
            supabase.auth.signUp({
              email,
              password,
              options: { data: { browse: true } },
            }),
          );
          return { error: error ? error.message : null };
        } catch (err) {
          return { error: err instanceof Error && err.message === "timeout" ? "timeout" : "auth_error" };
        }
      },
      async signOut() {
        const supabase = getSupabase();
        if (supabase) {
          try {
            await withTimeout(supabase.auth.signOut(), 15_000);
          } catch {
            /* still clear local recovery flag */
          }
        }
        setRecoveryPending(false);
      },
    }),
    [configured, ready, session, recoveryPending],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth");
  return ctx;
}
