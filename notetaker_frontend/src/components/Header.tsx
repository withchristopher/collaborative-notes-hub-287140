"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

// PUBLIC_INTERFACE
export default function Header() {
  /** Top header with search input and profile placeholder. */
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

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
        <div
          className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300"
          aria-label="Profile"
        />
      </div>
    </header>
  );
}
