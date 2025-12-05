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

  function getDefaultTitle(): string {
    // Example format: 'Friday - 2025-12-05 - 12:27' (24-hour local time)
    const d = new Date();
    const day = d.toLocaleDateString(undefined, { weekday: "long" });
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${day} - ${yyyy}-${mm}-${dd} - ${hh}:${mi}`;
  }

  const onCreate = async () => {
    setCreating(true);
    try {
      const tag = params.get("tag") || undefined;
      const note = await api.createNote({
        title: getDefaultTitle(),
        content: "",
        tags: tag ? [tag] : [],
      });
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
