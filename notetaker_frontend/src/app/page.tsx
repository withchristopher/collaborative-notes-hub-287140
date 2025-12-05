import { redirect } from "next/navigation";
import { Suspense } from "react";

// Force dynamic rendering to avoid static export and CSR bailout issues
export const dynamic = "force-dynamic";

export default function Home() {
  // Wrap in Suspense to satisfy Next.js CSR bailout guidance when client hooks are used downstream
  return (
    <Suspense fallback={<div className="muted p-6">Loading…</div>}>
      {(() => {
        // Redirect to /notes for main list view; if auth is enabled and user not logged in,
        // the /notes page will redirect to /auth via client-side guard.
        redirect("/notes");
        // Return a fragment to satisfy the JSX return type, though redirect will throw
        return <></>;
      })()}
    </Suspense>
  );
}
