import { Suspense } from "react";
import NotesClient from "./notes.client";
import RequireAuth from "@/components/RequireAuth";

// Force dynamic rendering to avoid static prerender complaints when using search params in client
export const dynamic = "force-dynamic";

// PUBLIC_INTERFACE
export default function NotesPage() {
  /** Lists notes with search and tag filter; provides create button. Protected when Supabase is enabled. */
  return (
    <RequireAuth>
      <Suspense fallback={<div className="muted">Loading…</div>}>
        <NotesClient />
      </Suspense>
    </RequireAuth>
  );
}


