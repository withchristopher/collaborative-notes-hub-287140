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
  /**
   * Note editor with explicit save (no per-keystroke save). A generous blur debounce is used
   * only when editor is dirty and an input loses focus. Includes a brief confirmation state and
   * prevents rapid double-saves.
   */
  const [note, setNote] = useState<Note | null>(initialNote || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // UX: show a small confirmation after successful save
  const [showSaved, setShowSaved] = useState(false);
  const savedTimerRef = useRef<number | null>(null);

  // Track dirty state to conditionally save on blur
  const [dirtyFields, setDirtyFields] = useState<{ title?: boolean; content?: boolean }>({});

  // Rapid-save guard: minimum interval between saves
  const lastSaveAtRef = useRef<number>(0);
  const MIN_SAVE_INTERVAL_MS = 1200;

  // Debounce for blur actions only (>=1500ms requirement)
  const blurDebounceRef = useRef<number | null>(null);
  const BLUR_DEBOUNCE_MS = 1600;

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
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      if (blurDebounceRef.current) window.clearTimeout(blurDebounceRef.current);
    };
  }, [noteId, initialNote]);

  const onChange =
    (field: keyof Pick<Note, "title" | "content">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setNote((prev) => (prev ? { ...prev, [field]: value } : prev));
      setDirtyFields((prev) => ({ ...prev, [field]: true }));
      // No per-keystroke save
    };

  const maybeBlurSave = () => {
    if (!note) return;
    // Only fire when there's pending dirty fields
    const isDirty = !!dirtyFields.title || !!dirtyFields.content;
    if (!isDirty) return;

    // If currently saving or we just saved recently, skip scheduling a blur save
    const now = Date.now();
    if (saving || now - lastSaveAtRef.current < MIN_SAVE_INTERVAL_MS) {
      // eslint-disable-next-line no-console
      console.debug("[NoteEditor] skip blur save (saving or recently saved)", {
        saving,
        sinceLast: now - lastSaveAtRef.current,
      });
      return;
    }

    if (blurDebounceRef.current) window.clearTimeout(blurDebounceRef.current);
    blurDebounceRef.current = window.setTimeout(() => {
      // eslint-disable-next-line no-console
      console.debug("[NoteEditor] blur debounced save firing");
      void doSave({});
    }, BLUR_DEBOUNCE_MS);
  };

  async function doSave(patch: Partial<Note>) {
    if (!note) return;

    // Clear any pending blur-save to avoid duplicate PUTs when user clicks Save
    if (blurDebounceRef.current) {
      window.clearTimeout(blurDebounceRef.current);
      blurDebounceRef.current = null;
    }

    // Prevent rapid consecutive saves
    const now = Date.now();
    if (now - lastSaveAtRef.current < MIN_SAVE_INTERVAL_MS) {
      // eslint-disable-next-line no-console
      console.debug("[NoteEditor] save suppressed by min interval guard", {
        sinceLast: now - lastSaveAtRef.current,
      });
      return; // silently ignore rapid clicks to avoid accidental spam
    }
    lastSaveAtRef.current = now;

    // eslint-disable-next-line no-console
    console.debug("[NoteEditor] doSave invoked", { patchKeys: Object.keys(patch || {}) });

    setSaving(true);
    setError(null);

    // Always send current title and content to ensure persistence even if caller passed {}
    const payload: Partial<Note> = {
      title: typeof patch.title !== "undefined" ? patch.title : note.title,
      content: typeof patch.content !== "undefined" ? patch.content : note.content,
      // Only include tags if explicitly provided in patch; otherwise keep existing on server
      ...(typeof patch.tags !== "undefined" ? { tags: patch.tags } : {}),
    };

    const optimistic = { ...note, ...payload, updated_at: new Date().toISOString() };
    setNote(optimistic);

    try {
      const updated = await api.updateNote(noteId, {
        title: payload.title,
        content: payload.content,
        ...(typeof payload.tags !== "undefined" ? { tags: payload.tags } : {}),
      });
      startTransition(() => {
        setNote((prev) => ({ ...(prev || optimistic), ...(updated || {}) }));
      });

      // Clear dirty flags since we've just saved the current content
      setDirtyFields({});

      // Show confirmation briefly
      setShowSaved(true);
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = window.setTimeout(() => setShowSaved(false), 1500);
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

      {/* Editor toolbar area to better match the design reference */}
      <div className="flex items-center gap-2 py-1">
        <input
          className="input text-lg font-medium flex-1"
          value={note.title || ""}
          onChange={onChange("title")}
          onBlur={maybeBlurSave}
          placeholder="Untitled"
          aria-label="Note title"
        />
        <div className="flex items-center gap-2">
          {showSaved ? (
            <span
              className="text-xs text-green-700 px-2 py-1 rounded bg-green-50 border border-green-200"
              role="status"
              aria-live="polite"
            >
              Saved
            </span>
          ) : null}
          <button
            className="button primary"
            onClick={() => {
              // Cancel any scheduled blur save before manual save to prevent double PUT
              if (blurDebounceRef.current) {
                window.clearTimeout(blurDebounceRef.current);
                blurDebounceRef.current = null;
              }
              // eslint-disable-next-line no-console
              console.debug("[NoteEditor] manual Save clicked");
              void doSave({});
            }}
            disabled={saving || isPending}
            aria-disabled={saving || isPending}
            aria-label="Save note"
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
      </div>

      <div className="editor">
        <textarea
          className="w-full min-h-[50vh] p-4 outline-none"
          placeholder="Write your note…"
          value={note.content || ""}
          onChange={onChange("content")}
          onBlur={maybeBlurSave}
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
