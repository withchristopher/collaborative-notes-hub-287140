import NoteEditor from "@/components/NoteEditor";
import { api } from "@/lib/api";

type Props = {
  params: Promise<{ id: string }>;
};

async function fetchNote(id: string) {
  try {
    // Use the API client on server by calling the backend via fetch
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_BACKEND_URL || ""}/notes/${encodeURIComponent(id)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return (await res.json()) as Awaited<ReturnType<typeof api.getNote>>;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export default async function NoteDetailPage({ params }: Props) {
  /** Displays a single note and allows editing with optimistic updates. */
  const { id } = await params;
  const data = await fetchNote(id);

  return (
    <div className="space-y-4">
      <NoteEditor noteId={id} initialNote={data} />
    </div>
  );
}
