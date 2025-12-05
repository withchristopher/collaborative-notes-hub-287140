 /**
E2E Smoke Checklist (manual):
- Create note: api.createNote({ title: "Untitled" }) -> navigate to /notes/:id
- Edit: api.updateNote(id, { title, content }) -> refresh -> persistence confirmed
- Search: api.listNotes({ q: "keyword" }) -> list shows filtered results
- View history: verify updated_at changes after edit
*/
export type ListNotesParams = { q?: string; tag?: string };

/**
 * Resolve the backend base URL from environment variables.
 * This must point to the FastAPI backend (e.g., http://localhost:3001).
 * We purposefully DO NOT fall back to a relative path because that would
 * incorrectly hit the Next.js app on port 3000 and lead to 405 responses.
 */
function getBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "";

  if (!base) {
    // Provide a clear diagnostic error to surface misconfiguration fast.
    throw new Error(
      "Backend URL missing. Set NEXT_PUBLIC_API_BASE (recommended) or NEXT_PUBLIC_BACKEND_URL to your FastAPI URL, e.g. http://localhost:3001"
    );
  }
  return base.replace(/\/*$/, "");
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

  // Lightweight dev logging to help diagnose 405/URL issues without noisy production logs
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[api] request", {
      method: init?.method || "GET",
      url,
      payloadPreview:
        init?.body && typeof init.body === "string"
          ? init.body.slice(0, 200)
          : undefined,
    });
  }

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

// CreateNote payload must include content per backend NoteIn schema
type CreateNotePayload = {
  title: string;
  content: string;
  tags?: string[];
};

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

async function createNote(payload: CreateNotePayload): Promise<Note> {
  // Minimal guard to ensure backend-required content is not undefined
  const safePayload: CreateNotePayload = {
    title: payload.title,
    content: typeof payload.content === "string" ? payload.content : "",
    tags: Array.isArray(payload.tags) ? payload.tags : [],
  };
  return http<Note>(`/notes`, { method: "POST", body: JSON.stringify(safePayload) });
}

async function updateNote(id: string, payload: UpdateNotePayload): Promise<Note> {
  // Backend expects PUT /notes/{id} with NoteUpdate (partial fields allowed)
  return http<Note>(`/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

async function deleteNote(id: string): Promise<void> {
  await http<void>(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/** Helper to expose the resolved backend base URL for components that need to make ad-hoc fetches. */
// PUBLIC_INTERFACE
export function getApiBase(): string {
  return getBaseUrl();
}

// PUBLIC_INTERFACE
export const api = {
  /** List notes with optional search and tag filters. */
  listNotes,
  /** Get a single note by id. */
  getNote,
  /** Create a note with required content field. */
  createNote,
  /** Update a note with partial payload. */
  updateNote,
  /** Delete a note by id. */
  deleteNote,
};
