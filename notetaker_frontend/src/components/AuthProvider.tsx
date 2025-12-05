"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  supabaseAvailable: boolean;
  refresh: () => Promise<void>;
};

// PUBLIC_INTERFACE
export const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: false,
  error: null,
  supabaseAvailable: false,
  // no-op default
  refresh: async () => {},
});

/**
 * AuthProvider wires up Supabase onAuthStateChange and exposes session/user to children.
 * If Supabase is not configured (envs missing), it remains inactive but provides helpful state.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = getSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!client);
  const [error, setError] = useState<string | null>(null);

  const supabaseAvailable = Boolean(client);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    async function init() {
      if (!client) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error: err } = await client.auth.getSession();
        if (err) {
          setError(err.message);
        } else {
          setSession(data.session);
        }
        const { data: sub } = client.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession);
        });
        unsub = () => sub.subscription.unsubscribe();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Auth init failed";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    void init();

    return () => {
      if (unsub) unsub();
    };
  }, [client]);

  const value: AuthContextValue = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      error,
      supabaseAvailable,
      refresh: async () => {
        if (!client) return;
        const { data, error: err } = await client.auth.getSession();
        if (err) setError(err.message);
        setSession(data.session);
      },
    }),
    [session, loading, error, supabaseAvailable, client]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth(): AuthContextValue {
  /** Hook to access user/session/auth state. */
  return useContext(AuthContext);
}
