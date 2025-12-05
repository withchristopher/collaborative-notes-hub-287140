This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

1) Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2) Ensure the backend is running at `http://localhost:3001` (or update `NEXT_PUBLIC_API_BASE` accordingly).

3) Start the development server:
```bash
npm run dev
# or: yarn dev | pnpm dev | bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Integration Notes
- Frontend reads the backend base URL from `NEXT_PUBLIC_API_BASE` (recommended) or `NEXT_PUBLIC_BACKEND_URL`.
- Supabase is optional. If used, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_KEY`. When blank, the app simply does not use Supabase capabilities.
- For production, set the same variables via your hosting platform’s env configuration.

### E2E Smoke Checklist (manual)
- Create note: Go to “All Notes” and click “New Note”; verify it opens a new note detail page.
- Edit: Change title/content; click “Save” and confirm changes persist after refresh.
- Search: Use the top search input; verify note list filters accordingly.
- View history (basic): Update a note, refresh, and verify “Last edited” timestamp updates.

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
