"use client";

import NoteList from "@/components/NoteList";
import { api } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// PUBLIC_INTERFACE
export default function NotesClient() {
  /** Client-side Notes page that handles creation and reads search params within Suspense boundary provided by the route. Protected when Supabase is enabled. */
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const onCreate = async () => {
    setCreating(true);
    try {
      const tag = params.get("tag") || undefined;
      const note = await api.createNote({ title: "Untitled", tags: tag ? [tag] : [] });
      router.push(`/notes/${note.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-medium text-gray-800">All Notes</h1>
        <button className="button primary" onClick={() => void onCreate()} disabled={creating}>
          {creating ? "Creating…" : "New Note"}
        </button>
      </div>
      <NoteList />
    </div>
  );
}
