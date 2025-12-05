"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

/**
 * Client-side guard for pages that require auth.
 * If Supabase is not configured, access is allowed (graceful no-auth mode).
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, supabaseAvailable } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!supabaseAvailable) return; // No auth configured, allow
    if (loading) return;
    if (!user) {
      router.replace("/auth");
    }
  }, [user, loading, router, supabaseAvailable]);

  if (supabaseAvailable && (loading || !user)) {
    return <div className="muted">Checking authentication…</div>;
  }

  return <>{children}</>;
}
