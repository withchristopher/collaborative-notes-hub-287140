"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { getSupabaseClient } from "@/lib/supabaseClient";

// PUBLIC_INTERFACE
export default function Header() {
  /** Top header with search input and account menu (logout) when authenticated. */
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const { user, supabaseAvailable } = useAuth();
  const supabase = getSupabaseClient();

  useEffect(() => {
    setQ(params.get("q") || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.toString()]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params?.toString());
    if (q) next.set("q", q);
    else next.delete("q");
    router.push(`/notes?${next.toString()}`);
  };

  const onLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  return (
    <header className="h-full flex items-center justify-between px-4">
      <form onSubmit={onSubmit} role="search" className="flex-1 max-w-xl">
        <label htmlFor="search" className="sr-only">
          Search notes
        </label>
        <input
          id="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search notes…"
          className="input w-full"
          aria-label="Search notes"
        />
      </form>
      <div className="flex items-center gap-3">
        <Link className="button" href="/notes">
          Notes
        </Link>
        {supabaseAvailable ? (
          user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm muted max-w-[180px] truncate" title={user.email || ""}>
                {user.email}
              </span>
              <button className="button" onClick={() => void onLogout()}>Logout</button>
            </div>
          ) : (
            <Link className="button" href="/auth">
              Sign In
            </Link>
          )
        ) : (
          <span className="text-xs muted">Auth disabled</span>
        )}
      </div>
    </header>
  );
}
