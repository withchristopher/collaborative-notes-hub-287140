import { Suspense } from "react";
import AuthClient from "./AuthClient";

// Force dynamic for auth UI – disable prerender and only render at runtime
export const dynamic = "force-dynamic";

// PUBLIC_INTERFACE
export default function AuthPage() {
  /** Server wrapper for the /auth route that renders the client-side AuthClient under Suspense. */
  return (
    <Suspense fallback={<div className="muted p-6">Loading…</div>}>
      <AuthClient />
    </Suspense>
  );
}
