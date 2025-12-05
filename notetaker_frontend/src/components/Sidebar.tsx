"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { getApiBase } from "@/lib/api";

type Tag = { id: string; name: string; count?: number };

function classNames(...s: Array<string | false | null | undefined>): string {
  return s.filter(Boolean).join(" ");
}

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Sidebar navigation with tags and quick actions, Ocean Professional theme. */
  const pathname = usePathname();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const { supabaseAvailable, user } = useAuth();

  useEffect(() => {
    let mounted = true;
    async function fetchTags() {
      try {
        setLoading(true);
        const url = new URL("/tags", getApiBase());
        const res = await fetch(url.toString(), { next: { revalidate: 30 } });
        if (!mounted) return;
        if (!res.ok) throw new Error(`Failed tags: ${res.status}`);
        const data = await res.json();
        setTags(Array.isArray(data) ? data : []);
      } catch {
        // Fallback minimal defaults if backend missing
        setTags([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchTags();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <nav aria-label="Sidebar" className="h-full flex flex-col p-4 gap-3">
      <Link
        href="/notes"
        className={classNames(
          "button w-full justify-center",
          pathname?.startsWith("/notes") ? "" : ""
        )}
        aria-label="Create or view latest note"
        title="New Note"
      >
        + New Note
      </Link>

      <div className="mt-1">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
          Navigation
        </p>
        <ul className="space-y-1" role="list">
          <li>
            <Link
              href="/notes"
              className={classNames(
                "note-item flex justify-between items-center",
                pathname === "/notes" ? "active" : ""
              )}
            >
              <span>All Notes</span>
            </Link>
          </li>
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
          Tags
        </p>
        <div
          role="status"
          aria-live="polite"
          className="text-xs text-gray-500 mb-1"
        >
          {loading ? "Loading…" : null}
        </div>
        <ul className="space-y-1" role="list">
          {tags.length === 0 ? (
            <li className="muted text-sm">No tags</li>
          ) : (
            tags.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/notes?tag=${encodeURIComponent(t.name)}`}
                  className="note-item flex justify-between items-center"
                >
                  <span>#{t.name}</span>
                  {typeof t.count === "number" ? (
                    <span className="text-xs text-gray-500">{t.count}</span>
                  ) : null}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Ocean Professional
          {supabaseAvailable ? (
            user ? (
              <span className="block text-[10px] text-gray-400 mt-1">Signed in</span>
            ) : (
              <span className="block text-[10px] text-gray-400 mt-1">Auth enabled</span>
            )
          ) : (
            <span className="block text-[10px] text-gray-400 mt-1">Auth disabled</span>
          )}
        </p>
      </div>
    </nav>
  );
}


