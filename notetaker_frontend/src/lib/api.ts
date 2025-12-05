/**
E2E Smoke Checklist (manual):
- Create note: api.createNote({ title: "Untitled" }) -> navigate to /notes/:id
- Edit: api.updateNote(id, { title, content }) -> refresh -> persistence confirmed
- Search: api.listNotes({ q: "keyword" }) -> list shows filtered results
- View history: verify updated_at changes after edit
*/
export type ListNotesParams = { q?: string; tag?: string };

function getBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "";
  if (base) return base.replace(/\/+$/, "");
  // Fallback to relative path assuming reverse proxy to backend
  return "";
}

type AbortControllerWithTimeout = AbortController & {
  __timeoutId?: ReturnType<typeof setTimeout>;
};

function withAbortSignal(timeoutMs = 8000): AbortControllerWithTimeout {
  const controller = new AbortController() as AbortControllerWithTimeout;
  const id = setTimeout(() => controller.abort("timeout"), timeoutMs);
  controller.__timeoutId = id;
  return controller;
}

async function http<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const controller = withAbortSignal(init?.timeoutMs);
  try {
    const res: Response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } finally {
    const id = controller.__timeoutId;
    if (id) clearTimeout(id);
  }
}

export type Note = {
  id: string;
  title: string;
  content?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

type UpdateNotePayload = Partial<Pick<Note, "title" | "content" | "tags">>;

async function listNotes(params: ListNotesParams = {}): Promise<Note[]> {
  const usp = new URLSearchParams();
  if (params.q) usp.set("q", params.q);
  if (params.tag) usp.set("tag", params.tag);
  const qs = usp.toString();

  // Fetch raw response; backend may return either:
  // - Note[] (array)
  // - { items: Note[], total?: number } (object wrapper)
  const raw = await http<unknown>(`/notes${qs ? `?${qs}` : ""}`, { method: "GET" });

  // Types to help with safe narrowing
  type UnknownRecord = Record<string, unknown>;
  type NoteLike = UnknownRecord;

  // Normalize to Note[] defensively at runtime
  try {
    if (Array.isArray(raw)) {
      // Ensure elements are objects with id field, filter out invalid entries
      const arr = (raw as unknown[]).filter(
        (x): x is NoteLike => !!x && typeof x === "object" && "id" in (x as UnknownRecord)
      );
      return arr as unknown as Note[];
    }
    if (raw && typeof raw === "object") {
      const obj = raw as UnknownRecord;
      const items = (obj as { items?: unknown }).items;
      if (Array.isArray(items)) {
        const filtered = items.filter(
          (x): x is NoteLike => !!x && typeof x === "object" && "id" in (x as UnknownRecord)
        );
        return filtered as unknown as Note[];
      }
    }
  } catch {
    // fall through to return empty array
  }
  // Fallback to empty list if shape not recognized
  return [];
}

async function getNote(id: string): Promise<Note> {
  return http<Note>(`/notes/${encodeURIComponent(id)}`, { method: "GET" });
}

async function createNote(payload: UpdateNotePayload = {}): Promise<Note> {
  return http<Note>(`/notes`, { method: "POST", body: JSON.stringify(payload) });
}

async function updateNote(id: string, payload: UpdateNotePayload): Promise<Note> {
  return http<Note>(`/notes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

async function deleteNote(id: string): Promise<void> {
  await http<void>(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// PUBLIC_INTERFACE
export const api = {
  /** List notes with optional search and tag filters. */
  listNotes,
  /** Get a single note by id. */
  getNote,
  /** Create a note. */
  createNote,
  /** Update a note with partial payload. */
  updateNote,
  /** Delete a note by id. */
  deleteNote,
};
