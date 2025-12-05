"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { api } from "@/lib/api";
import type { Note } from "./NoteList";

type Props = {
  noteId: string;
  initialNote?: Note | null;
};

// PUBLIC_INTERFACE
export default function NoteEditor({ noteId, initialNote }: Props) {
  /** Note editor with optimistic updates and last-edited display. */
  const [note, setNote] = useState<Note | null>(initialNote || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (initialNote) return; // already provided by server fetch
      try {
        const data = await api.getNote(noteId);
        if (mounted) setNote(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load";
        if (mounted) setError(msg);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [noteId, initialNote]);

  const onChange =
    (field: keyof Pick<Note, "title" | "content">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setNote((prev) => (prev ? { ...prev, [field]: value } : prev));
      // Debounce save
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        void save({ [field]: value } as Partial<Note>);
      }, 500);
    };

  async function save(patch: Partial<Note>) {
    if (!note) return;
    setSaving(true);
    setError(null);
    const optimistic = { ...note, ...patch, updated_at: new Date().toISOString() };
    setNote(optimistic);
    try {
      const updated = await api.updateNote(noteId, patch);
      // reconcile in transition to keep UI responsive
      startTransition(() => {
        setNote((prev) => ({ ...(prev || optimistic), ...(updated || {}) }));
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function destroy() {
    if (!note) return;
    setSaving(true);
    setError(null);
    try {
      await api.deleteNote(noteId);
      // Navigate back to list
      window.location.href = "/notes";
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (!note) {
    return <div className="muted">Loading note…</div>;
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="card p-3 text-red-600 text-sm" role="alert">
          {error}
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <input
          className="input text-lg font-medium flex-1"
          value={note.title || ""}
          onChange={onChange("title")}
          placeholder="Untitled"
          aria-label="Note title"
        />
        <button
          className="button"
          onClick={() => void save({})}
          disabled={saving || isPending}
          aria-disabled={saving || isPending}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          className="button"
          onClick={() => void destroy()}
          aria-label="Delete note"
        >
          Delete
        </button>
      </div>
      <div className="editor">
        <textarea
          className="w-full min-h-[50vh] p-4 outline-none"
          placeholder="Write your note…"
          value={note.content || ""}
          onChange={onChange("content")}
          aria-label="Note content"
        />
      </div>
      <p className="muted text-xs">
        Last edited:{" "}
        {note.updated_at ? new Date(note.updated_at).toLocaleString() : "—"}
      </p>
    </div>
  );
}
