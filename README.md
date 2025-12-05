# Collaborative Notes Hub

A self-hosted notetaking application designed for customer and product teams to collaboratively create, organize, and manage notes.

## Containers
- Frontend (Next.js): `collaborative-notes-hub-287140/notetaker_frontend`
- Backend (FastAPI): `collaborative-notes-hub-287141/backend`
- Database (PostgreSQL): `collaborative-notes-hub-287142/database`

## Quick Start (Local Dev)
1) Database: Ensure a Postgres instance is running. If a `db_connection.txt` file exists in the database workspace, it will include connection info (host, port, db, user, password). Prefer using the port found in that file when forming `DATABASE_URL`.

2) Backend: In `collaborative-notes-hub-287141/backend`, copy `.env.example` to `.env` and set:
```
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
ALLOWED_ORIGINS=http://localhost:3000
```
If `DATABASE_URL` is not set, the backend may attempt to parse `db_connection.txt` to construct it (host defaults to localhost; use the discovered port).

3) Frontend: In `collaborative-notes-hub-287140/notetaker_frontend`, copy `.env.local.example` to `.env.local` and ensure:
```
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```
Supabase is optional (leave blank if not used).

4) Run services:
- Start database
- Start backend on port 3001
- Start frontend on port 3000

## E2E Smoke Checklist
- Create note: Click “New Note” and confirm a new note opens.
- Edit: Change title/content, Save, refresh and verify persistence.
- Search: Use the header search to filter notes.
- View history (basic): Ensure the “Last edited” timestamp updates after changes.

## Notes
- CORS: Backend should include `ALLOWED_ORIGINS=http://localhost:3000` for local dev.
- Environment: Do not commit real credentials. Use the provided `.env.example` templates.