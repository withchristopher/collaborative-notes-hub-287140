This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

1) Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2) Ensure the backend is running at `http://localhost:3001` (or update `NEXT_PUBLIC_API_BASE` accordingly).

3) (Optional) Enable Supabase authentication:
- Create a Supabase project and go to Settings → API to find:
  - Project URL (use as `NEXT_PUBLIC_SUPABASE_URL`)
  - anon public key (use as `NEXT_PUBLIC_SUPABASE_KEY`)
- Update `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_KEY=your-anon-key
  ```
- Start the dev server and visit `/auth` to sign in/up or request a magic link.

4) Start the development server:
```bash
npm run dev
# or: yarn dev | pnpm dev | bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Integration Notes
- Frontend reads the backend base URL from `NEXT_PUBLIC_API_BASE` (recommended) or `NEXT_PUBLIC_BACKEND_URL`.
- Supabase is optional. If `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_KEY` are set, the app enables auth:
  - `/auth` page offers sign in, sign up, and magic link (email redirect goes to `/notes`).
  - Header shows user email and a Logout button when authenticated.
  - `/notes` routes are protected: unauthenticated users are redirected to `/auth`.
- If Supabase envs are not set, the app runs in no-auth mode:
  - `/notes` is accessible without login.
  - Header shows “Auth disabled”.
  - `/auth` shows a helpful message indicating auth is disabled.

### E2E Smoke Checklist (manual)
- Create note: Go to “All Notes” and click “New Note”; verify it opens a new note detail page.
- Edit: Change title/content; click “Save” and confirm changes persist after refresh.
- Search: Use the top search input; verify note list filters accordingly.
- View history (basic): Update a note, refresh, and verify “Last edited” timestamp updates.
- Auth (if enabled):
  - Visit `/auth` and sign up/sign in.
  - After login, you should land on `/notes`.
  - Click Logout in header and confirm redirect to `/auth`.

---

## Learn More

To learn more about Next.js, take a look at:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js).

## Deploy

Deploy on any Node-compatible host. Be sure to configure:
- `NEXT_PUBLIC_API_BASE` to your backend URL (e.g., `https://your-backend.example.com`)
- (Optional) Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY`

### Notes on Environment Variables
- Do not hardcode secrets.
- When using magic links or email confirmations, Supabase will use the provided redirect URL; in this app we set it to `${window.location.origin}/notes`.
- For production deployments, set env vars via your hosting platform and verify the site URL in Supabase auth settings to allow redirects.
