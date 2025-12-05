"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export type Note = {
  id: string;
  title: string;
  content?: string;
  tags?: string[];
  updated_at?: string;
  created_at?: string;
};

function formatDate(d?: string) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(+dt)) return "";
  return dt.toLocaleString();
}

// PUBLIC_INTERFACE
export default function NoteList() {
  /** Displays note list with search and tag filters. */
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const params = useSearchParams();
  const tag = params.get("tag") || undefined;
  const q = params.get("q") || undefined;

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.listNotes({ q, tag });
        if (!mounted) return;
        setNotes(data);
      } catch (e) {
        if (!mounted) return;
        const msg = e instanceof Error ? e.message : "Failed to load notes";
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [q, tag]);

  const items = useMemo(() => notes, [notes]);

  return (
    <section aria-busy={loading} aria-live="polite" className="space-y-3">
      {error ? (
        <div className="card p-3 text-red-600 text-sm" role="alert">
          {error}
        </div>
      ) : null}
      <ul role="list" className="grid gap-2">
        {items.map((n) => {
          const active = pathname === `/notes/${n.id}`;
          return (
            <li key={n.id}>
              <Link
                href={`/notes/${n.id}`}
                className={`note-item block ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{n.title || "Untitled"}</p>
                    <p className="muted text-xs truncate">
                      Last edited {formatDate(n.updated_at) || "—"}
                    </p>
                  </div>
                  {Array.isArray(n.tags) && n.tags.length > 0 ? (
                    <div className="flex gap-1 flex-wrap justify-end">
                      {n.tags?.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {loading ? <p className="muted text-sm">Loading…</p> : null}
      {!loading && items.length === 0 ? (
        <p className="muted text-sm">No notes found.</p>
      ) : null}
    </section>
  );
}
