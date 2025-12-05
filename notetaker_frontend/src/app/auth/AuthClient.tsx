"use client";

import React, { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

/**
 * Client-side auth UI (email/password + magic link).
 * This component lives under a server component wrapper to avoid CSR bailout.
 */
export default function AuthClient() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup" | "magic">("signin");

  useEffect(() => {
    if (user && typeof window !== "undefined") {
      router.replace("/notes");
    }
  }, [user, router]);

  const supabaseMissing = !supabase;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY in .env.local to enable authentication."
      );
      setPending(false);
      return;
    }

    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo:
              typeof window !== "undefined" ? window.location.origin + "/notes" : undefined,
          },
        });
        if (error) throw error;
        setMessage("Magic link sent. Check your email.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              typeof window !== "undefined" ? window.location.origin + "/notes" : undefined,
          },
        });
        if (error) throw error;
        setMessage("Signup successful. Check your email to confirm (if required).");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/notes");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Authentication failed";
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <section className="card p-6 w-full max-w-md">
        <h1 className="text-xl font-semibold text-gray-800">Sign in to Collaborative Notes</h1>
        <p className="muted text-sm mt-1">
          {supabaseMissing
            ? "Supabase auth is disabled because env vars are missing. Configure to enable authentication."
            : "Use your email to sign in, sign up, or request a magic link."}
        </p>

        <div className="mt-4 flex gap-2" role="tablist" aria-label="Auth modes">
          <button
            className={`button ${mode === "signin" ? "primary" : ""}`}
            onClick={() => setMode("signin")}
            role="tab"
            aria-selected={mode === "signin"}
          >
            Sign In
          </button>
          <button
            className={`button ${mode === "signup" ? "primary" : ""}`}
            onClick={() => setMode("signup")}
            role="tab"
            aria-selected={mode === "signup"}
          >
            Sign Up
          </button>
          <button
            className={`button ${mode === "magic" ? "primary" : ""}`}
            onClick={() => setMode("magic")}
            role="tab"
            aria-selected={mode === "magic"}
          >
            Magic Link
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3" aria-busy={pending}>
          <div>
            <label className="block text-sm mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input w-full"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {mode !== "magic" ? (
            <div>
              <label className="block text-sm mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input w-full"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </div>
          ) : null}

          {error ? (
            <div className="card p-3 text-red-600 text-sm" role="alert">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="card p-3 text-green-700 text-sm" role="status" aria-live="polite">
              {message}
            </div>
          ) : null}

          <button className="button primary w-full justify-center" type="submit" disabled={pending}>
            {pending ? "Please wait…" : mode === "magic" ? "Send Magic Link" : mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}
